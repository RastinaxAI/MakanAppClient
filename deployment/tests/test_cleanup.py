"""Cleanup is restricted to generated output and protects secrets/live data."""

from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from deployment.cleanup import clean


class CleanupTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="makan-cleanup-")
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)

    def write(self, name, data=b"generated"):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        return path

    def run_clean(self, **kwargs):
        return clean(self.root, activity=(set(), set()), **kwargs)

    def test_generated_outputs_are_removed_and_source_inputs_remain(self):
        garbage = [self.write(p) for p in ("app/web/output/review/run/screenshot.png",
                   "testapp/web/tmp/trace.zip", "management/maintenance/generated/result.json",
                   "testmanagement/test-results/result.json")]
        source = [self.write(p) for p in ("app/web/src/page.tsx", "app/web/tests/unit/a.test.ts",
                  "app/web/design/reference-v5/source.pdf", "app/web/output/pdf/delivery.pdf",
                  "DEPLOYMENT.fa.md", "app/web/node_modules/package.json")]
        result = self.run_clean()
        self.assertEqual(4, result["files"])
        self.assertEqual(4 * len(b"generated"), result["bytes"])
        self.assertFalse(result["errors"])
        self.assertTrue(all(not p.exists() for p in garbage))
        self.assertTrue(all(p.exists() for p in source))

    def test_credentials_sessions_databases_and_backups_are_preserved(self):
        names = [".env.production", ".deployment/backups/current/data.dump", ".git/config",
                 "app/web/.makan-sessions/session.json", "app/web/tmp/.env.local",
                 "app/web/tmp/.makan-sessions/session.json", "app/web/tmp/private.key",
                 "app/web/tmp/backup.sqlite3", "app/web/tmp/storage-state.json",
                 "app/web/tmp/database.dump", "app/web/tmp/db-backup.sql.gz",
                 "app/web/tmp/private.key.old", "app/web/tmp/backups/data.tar.gz",
                 "app/web/tmp/.auth/user.json"]
        paths = [self.write(name) for name in names]
        self.write("app/web/tmp/obsolete.log")
        result = self.run_clean()
        self.assertEqual(1, result["files"])
        self.assertTrue(all(path.exists() for path in paths))

    def test_dry_run_has_no_deletions(self):
        path = self.write("app/web/output/review/run/image.png")
        result = self.run_clean(dry_run=True)
        self.assertEqual(1, result["files"])
        self.assertTrue(path.exists())

    def test_symlinked_parent_or_child_cannot_delete_other_data(self):
        external = self.write("unclassified/important.txt")
        (self.root / "app/web").mkdir(parents=True)
        (self.root / "app/web/tmp").symlink_to(external.parent, target_is_directory=True)
        directory = self.root / "testapp/web/tmp"
        directory.mkdir(parents=True)
        (directory / "outside").symlink_to(external.parent, target_is_directory=True)
        self.run_clean()
        self.assertEqual(b"generated", external.read_bytes())
        self.assertTrue((directory / "outside").is_symlink())

    def test_live_review_outputs_are_preserved_while_other_projects_are_cleaned(self):
        active = self.write("testapp/web/output/review/live/index.html")
        obsolete = self.write("app/web/output/review/old/image.png")
        result = clean(self.root, activity=(set(), {self.root / "testapp/web"}))
        self.assertTrue(active.exists())
        self.assertFalse(obsolete.exists())
        self.assertEqual(1, result["files"])

    def test_a_process_inside_a_temporary_checkout_prevents_its_removal(self):
        path = self.write("app/web/tmp/checkout/src/index.ts")
        result = clean(self.root, activity=({path.parent}, set()))
        self.assertEqual(0, result["files"])
        self.assertTrue(path.exists())

    def test_repeated_cleanup_is_idempotent(self):
        self.write("management/test-results/test.png")
        self.run_clean()
        self.assertEqual(0, self.run_clean()["files"])
