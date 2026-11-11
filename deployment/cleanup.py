#!/usr/bin/env python3
"""Remove known generated artifacts, never application inputs or runtime data."""

import argparse
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = ("app/web", "testapp/web", "management", "testmanagement")
PROTECTED = {
    ".git", ".deployment", ".ops", ".auth", ".backups", "backups", "backup", ".media", "media", "uploads",
    ".makan-sessions", ".makan-test-sessions", ".makan-qa-sessions",
    "sessions", "storage-state.json", "auth-state.json",
}
PRIVATE_SUFFIXES = {".env", ".pem", ".key", ".p12", ".pfx", ".db", ".sqlite", ".sqlite3", ".dump", ".sql"}


def targets():
    for project in PROJECTS:
        for folder in ("test-results", "playwright-report", "tmp"):
            yield project, project + "/" + folder
        if project.endswith("/web"):
            yield project, project + "/output/review"
        else:
            yield project, project + "/maintenance/generated"


def active_paths(root):
    """Preserve artifacts used by a running checkout or review server."""
    busy, reviews = set(), set()
    for process in Path("/proc").iterdir():
        if not process.name.isdecimal():
            continue
        try:
            cwd = Path(os.readlink(process / "cwd"))
            if not cwd.is_relative_to(root):
                continue
            busy.add(cwd)
            args = (process / "cmdline").read_bytes().split(b"\0")
            if not args or b"node" not in args[0]:
                continue
            scripts = [arg.decode(errors="replace") for arg in args[1:]
                       if arg.lower().endswith((b".js", b".mjs", b".cjs"))]
            if any("review" in Path(script).name.lower() or "playwright" in script.lower()
                   or "vitest" in script.lower() for script in scripts):
                script_paths = [(cwd / script).resolve() for script in scripts]
                for project in PROJECTS:
                    if cwd.is_relative_to(root / project) or any(path.is_relative_to(root / project) for path in script_paths):
                        reviews.add(root / project)
        except (OSError, ValueError):
            continue
    return busy, reviews


def protected(path):
    return (path.name in PROTECTED or path.name.startswith(".env") or "backup" in path.name.lower()
            or any(suffix.lower() in PRIVATE_SUFFIXES for suffix in path.suffixes) or path.is_symlink())


def clean(root, *, dry_run=False, activity=None):
    root = Path(root).resolve()
    busy, reviews = active_paths(root) if activity is None else activity
    report = {"dry_run": dry_run, "files": 0, "bytes": 0, "preserved": 0, "targets": [], "errors": []}

    def remove(path):
        if protected(path):
            report["preserved"] += 1
            return
        try:
            if path.is_dir():
                for child in path.iterdir():
                    remove(child)
                if not dry_run:
                    try:
                        path.rmdir()
                    except OSError:
                        # Protected entries, symlinks or a concurrent writer can remain.
                        pass
            elif path.is_file():
                size = path.stat().st_size
                if not dry_run:
                    path.unlink()
                report["files"] += 1
                report["bytes"] += size
        except OSError as error:
            report["errors"].append({"path": str(path.relative_to(root)), "reason": error.strerror})

    for project, relative in targets():
        path = root / relative
        # Do not follow a symlink in any component of an allowlisted path.
        cursor = root
        linked = False
        for part in Path(relative).parts:
            cursor = cursor / part
            linked |= cursor.is_symlink()
        if linked:
            report["targets"].append({"path": relative, "status": "preserved symlink"})
            continue
        if not path.exists():
            continue
        if root / project in reviews or any(cwd == path or cwd.is_relative_to(path) for cwd in busy):
            report["targets"].append({"path": relative, "status": "preserved active process"})
            continue
        before = report["files"]
        remove(path)
        report["targets"].append({"path": relative, "status": "preview" if dry_run else "cleaned",
                                  "files": report["files"] - before})
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="List removable generated artifacts without deleting them")
    args = parser.parse_args()
    report = clean(ROOT, dry_run=args.dry_run)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if report["errors"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
