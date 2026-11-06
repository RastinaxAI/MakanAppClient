"""Repository routing must preserve Debian's signatures and security suites."""

from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "landing/apps/api/configure_apt.sh"
ORIGINAL = """Types: deb
# http://snapshot.debian.org/archive/debian/20261005T000000Z
URIs: http://deb.debian.org/debian
Suites: trixie trixie-updates
Components: main
Signed-By: /usr/share/keyrings/debian-archive-keyring.pgp

Types: deb
URIs: http://deb.debian.org/debian-security
Suites: trixie-security
Components: main
Signed-By: /usr/share/keyrings/debian-archive-keyring.pgp
"""


class AptMirrorTests(unittest.TestCase):
    def rewrite(self, original, mirror):
        with tempfile.TemporaryDirectory(prefix="makan-apt-test-") as directory:
            sources = Path(directory) / "debian.sources"
            sources.write_text(original)
            result = subprocess.run(["sh", str(SCRIPT), mirror, str(sources)], capture_output=True, text=True)
            self.assertEqual([sources], list(Path(directory).iterdir()))
            return result, sources.read_text()

    def test_only_download_host_changes_for_every_supported_https_mirror(self):
        for host in ("mirrors.aliyun.com", "deb.debian.org", "mirrors.tuna.tsinghua.edu.cn", "mirrors.ustc.edu.cn"):
            with self.subTest(host=host):
                result, rewritten = self.rewrite(ORIGINAL, "https://" + host + "/")
                self.assertEqual(0, result.returncode, result.stderr)
                expected = ORIGINAL.replace("URIs: http://deb.debian.org/", "URIs: https://" + host + "/")
                self.assertEqual(expected, rewritten)

    def test_security_host_and_repeated_configuration_are_supported(self):
        original = ORIGINAL.replace("http://deb.debian.org/debian-security", "https://security.debian.org/debian-security")
        result, rewritten = self.rewrite(original, "https://mirrors.aliyun.com")
        self.assertEqual(0, result.returncode, result.stderr)
        result, repeated = self.rewrite(rewritten, "https://mirrors.aliyun.com")
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertEqual(rewritten, repeated)

    def test_insecure_unknown_or_injectable_origins_do_not_modify_sources(self):
        for mirror in ("http://mirrors.aliyun.com", "https://user:secret@deb.debian.org", "https://example.com",
                       "https://deb.debian.org?query=1", "https://deb.debian.org\nTrusted: yes", "https://deb.debian.org/debian"):
            with self.subTest(mirror=mirror):
                result, rewritten = self.rewrite(ORIGINAL, mirror)
                self.assertNotEqual(0, result.returncode)
                self.assertEqual(ORIGINAL, rewritten)

    def test_unknown_or_incomplete_repository_configuration_is_preserved_on_failure(self):
        for original in (ORIGINAL.replace("deb.debian.org/debian-security", "third-party.example/debian-security"),
                         ORIGINAL.split("\n\n")[0] + "\n"):
            with self.subTest(original=original):
                result, rewritten = self.rewrite(original, "https://mirrors.aliyun.com")
                self.assertNotEqual(0, result.returncode)
                self.assertEqual(original, rewritten)


if __name__ == "__main__":
    unittest.main()
