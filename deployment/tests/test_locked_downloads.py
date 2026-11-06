"""Mirror support must preserve frozen versions, hashes and the canonical lockfile."""

from contextlib import redirect_stdout
import copy
import importlib.util
import io
import json
import os
from pathlib import Path
import tempfile
import tomllib
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "landing/apps/api/install_locked.py"
spec = importlib.util.spec_from_file_location("makan_locked_install", SCRIPT)
installer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(installer)
LOCK = ROOT / "landing/apps/api/uv.lock"
MIRROR = "https://mirrors.aliyun.com/pypi"


class LockedDownloadTests(unittest.TestCase):
    def test_actual_lockfile_keeps_every_version_hash_and_dependency(self):
        original = LOCK.read_bytes()
        expected = copy.deepcopy(tomllib.loads(original.decode()))
        count = 0
        for package in expected["package"]:
            for artifact in [package.get("sdist", {})] + package.get("wheels", []):
                if artifact.get("url", "").startswith("https://files.pythonhosted.org/packages/"):
                    artifact["url"] = artifact["url"].replace("https://files.pythonhosted.org", MIRROR, 1)
                    count += 1
        changed = installer.mirrored_lock(original.decode(), MIRROR)
        self.assertGreater(count, 30)
        self.assertEqual(expected, tomllib.loads(changed))
        self.assertNotIn("https://files.pythonhosted.org/packages/", changed)
        self.assertEqual(original, LOCK.read_bytes())

    def test_direct_pypi_mode_is_byte_preserving(self):
        original = LOCK.read_text()
        self.assertEqual(original, installer.mirrored_lock(original, ""))

    def test_index_url_is_normalized_to_repository_base(self):
        self.assertEqual(MIRROR, installer.mirror_base(MIRROR + "/simple/"))
        self.assertEqual(MIRROR, installer.mirror_base(MIRROR + "/"))

    def test_insecure_credentialed_or_injectable_mirror_urls_are_rejected(self):
        for value in (
            "http://example.com/pypi", "https://user:password@example.com/pypi",
            "https://example.com/pypi?key=secret", "https://example.com/pypi#fragment",
            'https://example.com/pypi"', "https://example.com/pypi\\",
            "https://example.com:bad/pypi", "https://example.com/with space",
        ):
            with self.subTest(value=value), self.assertRaises(ValueError):
                installer.mirror_base(value)

    def test_failed_download_restores_original_lock_and_keeps_hash_checks_enabled(self):
        with tempfile.TemporaryDirectory(prefix="makan-mirror-test-") as temporary:
            directory = Path(temporary)
            lock = directory / "uv.lock"
            original = LOCK.read_bytes()
            lock.write_bytes(original)
            binary = directory / "uv"
            trace = directory / "trace.json"
            binary.write_text("""#!/usr/bin/env python3
import json, os, pathlib, sys
pathlib.Path(os.environ['MAKAN_TEST_TRACE']).write_text(json.dumps({
    'args': sys.argv[1:],
    'lock': pathlib.Path('uv.lock').read_text(),
    'hashes_disabled': 'UV_NO_VERIFY_HASHES' in os.environ,
}))
raise SystemExit(7)
""")
            binary.chmod(0o700)
            with patch.dict(os.environ, {
                "PATH": str(directory) + os.pathsep + os.environ["PATH"],
                "MAKAN_TEST_TRACE": str(trace), "UV_NO_VERIFY_HASHES": "true",
            }), redirect_stdout(io.StringIO()):
                result = installer.install(MIRROR, True, lock)
            recorded = json.loads(trace.read_text())
            self.assertEqual(7, result)
            self.assertEqual(original, lock.read_bytes())
            self.assertIn("--frozen", recorded["args"])
            self.assertIn("--no-install-project", recorded["args"])
            self.assertIn(MIRROR + "/simple", recorded["args"])
            self.assertFalse(recorded["hashes_disabled"])
            self.assertIn(MIRROR + "/packages/", recorded["lock"])


if __name__ == "__main__":
    unittest.main()
