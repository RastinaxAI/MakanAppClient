"""Install the locked API dependencies through a configurable HTTPS PyPI mirror.

Only distribution download URLs in the build copy of uv.lock are substituted.
Versions, dependency resolution and hashes remain unchanged; the original lock
bytes are restored even when uv exits unsuccessfully.
"""

import argparse
import os
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import urlsplit, urlunsplit


ARTIFACT_URL = re.compile(r'(\burl\s*=\s*")https://files\.pythonhosted\.org(/packages/[^"\r\n]+)(")')


def mirror_base(value):
    if not value:
        return ""
    url = urlsplit(value)
    if (
        url.scheme != "https" or not url.hostname or url.username or url.password
        or url.query or url.fragment
        or any(character.isspace() or character in '\\"' for character in value)
    ):
        raise ValueError("PYPI_MIRROR_URL must be a public HTTPS URL without credentials, query or fragment")
    _ = url.port  # Reject malformed port numbers before touching the lockfile.
    # Accept either a repository base or its conventional /simple index URL.
    path = url.path.rstrip("/")
    if path.endswith("/simple"):
        path = path[:-7]
    return urlunsplit((url.scheme, url.netloc, path, "", ""))


def mirrored_lock(content, mirror):
    base = mirror_base(mirror)
    if not base:
        return content
    rewritten, count = ARTIFACT_URL.subn(lambda match: match[1] + base + match[2] + match[3], content)
    if not count:
        raise ValueError("The lockfile has no canonical PyPI artifact URLs to mirror")
    return rewritten


def install(mirror, no_install_project=False, lockfile=Path("uv.lock")):
    base = mirror_base(mirror)
    original = lockfile.read_bytes()
    updated = mirrored_lock(original.decode("utf-8"), base).encode("utf-8")
    command = ["uv", "sync", "--frozen", "--no-dev"]
    command.append("--no-install-project" if no_install_project else "--no-editable")
    if base:
        command.extend(["--default-index", base + "/simple"])
    environment = os.environ.copy()
    environment.pop("UV_NO_VERIFY_HASHES", None)
    print("Installing frozen dependencies via " + (base or "canonical PyPI") + "; locked versions and hashes retained.", flush=True)
    try:
        if updated != original:
            lockfile.write_bytes(updated)
        return subprocess.run(command, cwd=lockfile.parent, env=environment, check=False).returncode
    finally:
        if updated != original:
            lockfile.write_bytes(original)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mirror", default="")
    parser.add_argument("--no-install-project", action="store_true")
    args = parser.parse_args()
    try:
        return install(args.mirror, args.no_install_project)
    except (OSError, ValueError) as error:
        print(f"Dependency installation failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
