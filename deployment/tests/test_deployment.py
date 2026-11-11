"""Safety/contract checks for a deployment that handles credentials and persistent data."""

from contextlib import redirect_stdout
import io
import json
import os
from pathlib import Path
import secrets
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from deployment import config


class DeploymentTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix="makan-deploy-test-")
        self.addCleanup(self.directory.cleanup)
        self.folder = Path(self.directory.name)
        self.env_file = self.folder / "production.env"
        with redirect_stdout(io.StringIO()):
            config.initialize(self.env_file)

    def test_repeated_initialization_preserves_keys_and_private_permissions(self):
        before = self.env_file.read_bytes()
        with redirect_stdout(io.StringIO()) as output:
            config.initialize(self.env_file)
        self.assertEqual(before, self.env_file.read_bytes())
        self.assertEqual(0o600, self.env_file.stat().st_mode & 0o777)
        values = config.validate(self.env_file)
        self.assertEqual(len(config.SECRET_KEYS), len({values[key] for key in config.SECRET_KEYS}))
        for key in config.SECRET_KEYS:
            self.assertNotIn(values[key], output.getvalue())

    def test_import_retains_existing_keys_and_external_volume_identity(self):
        old_file = self.folder / "old-production.env"
        old = {old_key: secrets.token_hex(32) for old_key in config.LANDING_KEYS.values()}
        old["POSTGRES_DB"] = "existing_landing"
        old_file.write_text("".join(f"{key}={value}\n" for key, value in old.items()))
        destination = self.folder / "imported.env"
        with redirect_stdout(io.StringIO()):
            config.initialize(destination, old_file, "makan-landing-prod")
        values = config.validate(destination)
        for new_key, old_key in config.LANDING_KEYS.items():
            self.assertEqual(old[old_key], values[new_key])
        self.assertEqual("existing_landing", values["MAKAN_LANDING_DB_NAME"])
        self.assertEqual("true", values["MAKAN_LANDING_EXTERNAL_VOLUMES"])
        self.assertEqual("makan-landing-prod_postgres_data", values["MAKAN_LANDING_DB_VOLUME"])
        with self.assertRaisesRegex(ValueError, "preserved"):
            config.initialize(destination, old_file, "makan-landing-prod")

    def test_missing_legacy_file_preserves_initialized_keys_and_explains_recovery(self):
        before = self.env_file.read_bytes()
        missing = self.folder / "missing-legacy.env"
        with self.assertRaisesRegex(ValueError, "Legacy environment file does not exist") as error:
            config.initialize(self.env_file, missing, "makan-landing-prod")
        self.assertEqual(before, self.env_file.read_bytes())
        self.assertIn("bash ./deploy.sh check", str(error.exception))
        self.assertIn("bash ./deploy.sh up", str(error.exception))
        for key in config.SECRET_KEYS:
            self.assertNotIn(config.validate(self.env_file)[key], str(error.exception))

    def test_missing_legacy_file_does_not_generate_replacement_keys(self):
        destination = self.folder / "new-production.env"
        with self.assertRaisesRegex(ValueError, "without import options"):
            config.initialize(destination, self.folder / "missing-legacy.env", "makan-landing-prod")
        self.assertFalse(destination.exists())

    def test_shell_substitution_in_dotenv_is_never_executed(self):
        marker = self.folder / "must-not-exist"
        content = self.env_file.read_text().replace(
            "MAKAN_ACME_EMAIL=rastinaxoffice@gmail.com",
            f"MAKAN_ACME_EMAIL=$(touch {marker})",
        )
        self.env_file.write_text(content)
        with self.assertRaises(ValueError):
            config.validate(self.env_file)
        self.assertFalse(marker.exists())

    def test_world_readable_credentials_are_rejected(self):
        self.env_file.chmod(0o644)
        with self.assertRaisesRegex(ValueError, "permissions"):
            config.validate(self.env_file)

    def test_duplicate_and_shared_keys_are_rejected(self):
        original = self.env_file.read_text()
        self.env_file.write_text(original + "MAKAN_ACME_EMAIL=extra@example.com\n")
        with self.assertRaisesRegex(ValueError, "duplicate"):
            config.validate(self.env_file)
        self.env_file.write_text(original)
        values = config.dotenv(self.env_file)
        self.env_file.write_text(original.replace(values["MAKAN_TESTAPP_SESSION_SECRET"], values["MAKAN_APP_SESSION_SECRET"]))
        with self.assertRaisesRegex(ValueError, "must differ"):
            config.validate(self.env_file)

    def test_dns_rejects_stale_ipv6_records(self):
        values = config.validate(self.env_file)
        records = [(None, None, None, None, (values["MAKAN_SERVER_IP"], 443)),
                   (None, None, None, None, ("2001:db8::1", 443))]
        with patch.object(config.socket, "getaddrinfo", return_value=records):
            with self.assertRaisesRegex(ValueError, "AAAA"):
                config.dns_check(values)

    @unittest.skipUnless(shutil.which("docker"), "Docker CLI is needed for Compose contract validation")
    def test_resolved_compose_separates_environments_and_exposes_only_edge(self):
        environment = {key: value for key, value in os.environ.items() if key not in config.dotenv(config.TEMPLATE)}
        result = subprocess.run(
            ["docker", "compose", "--env-file", str(self.env_file), "-f", str(ROOT / "compose.production.yaml"), "--profile", "tools", "config", "--format", "json"],
            env=environment, capture_output=True, text=True, check=True,
        )
        model = json.loads(result.stdout)
        services = model["services"]
        keys = []
        for name in ("app", "testapp", "management", "testmanagement"):
            service = services[name]
            expected = "http://94.184.32.84" + (":8090" if name.startswith("test") else "")
            self.assertEqual(expected, service["environment"]["BACKEND_BASE_URL"])
            self.assertEqual(f"https://{name}.makanapp.org", service["environment"]["APP_ORIGIN"])
            self.assertEqual("true", service["environment"]["COOKIE_SECURE"])
            self.assertTrue(service["read_only"])
            self.assertIn("healthcheck", service)
            keys.append(service["environment"]["SESSION_SECRET"])
        self.assertEqual(4, len(set(keys)))
        self.assertEqual(["edge"], [name for name, service in services.items() if service.get("ports")])
        self.assertIn("makan_migrator:", services["landing-migrate"]["environment"]["DATABASE_URL"])
        self.assertIn("makan_api:", services["landing-api"]["environment"]["DATABASE_URL"])
        self.assertNotEqual(services["landing-api"]["environment"]["DATABASE_URL"], services["landing-migrate"]["environment"]["DATABASE_URL"])
        self.assertTrue(model["networks"]["landing_database"]["internal"])
        self.assertEqual(10, len(model["volumes"]))

    def test_launcher_refuses_new_keys_when_platform_data_exists(self):
        bin_folder = self.folder / "bin"
        bin_folder.mkdir()
        fake_docker = bin_folder / "docker"
        fake_docker.write_text("""#!/bin/bash
if [[ "$1" == --host ]]; then shift 2; fi
case "$1" in
  info) exit 0 ;;
  compose) echo 2.24.0; exit 0 ;;
  volume) echo preserved-platform-data; exit 0 ;;
esac
exit 1
""")
        fake_docker.chmod(0o700)
        missing_file = self.folder / "missing.env"
        environment = dict(os.environ, PATH=str(bin_folder) + os.pathsep + os.environ["PATH"], MAKAN_ENV_FILE=str(missing_file))
        result = subprocess.run(["bash", str(ROOT / "deploy.sh"), "init"], env=environment, capture_output=True, text=True)
        self.assertNotEqual(0, result.returncode)
        self.assertIn("Existing platform volumes", result.stderr)
        self.assertFalse(missing_file.exists())

    def test_launcher_does_not_accept_volume_deletion_flags(self):
        result = subprocess.run(["bash", str(ROOT / "deploy.sh"), "down", "--volumes"], capture_output=True, text=True)
        self.assertNotEqual(0, result.returncode)
        self.assertIn("Unexpected arguments", result.stderr)

    def test_cleanup_preview_does_not_require_a_running_docker_engine(self):
        bin_folder = self.folder / "no-engine"
        bin_folder.mkdir()
        docker = bin_folder / "docker"
        docker.write_text("#!/bin/sh\necho 'Cleanup must not contact Docker' >&2\nexit 90\n")
        docker.chmod(0o700)
        environment = dict(os.environ, PATH=str(bin_folder) + os.pathsep + os.environ["PATH"])
        result = subprocess.run(["bash", str(ROOT / "deploy.sh"), "clean", "--dry-run"],
                                env=environment, capture_output=True, text=True)
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertIn('"dry_run": true', result.stdout)
        self.assertNotIn("Cleanup must not contact Docker", result.stderr)

    def test_successful_init_followed_by_accidental_legacy_import_keeps_credentials(self):
        bin_folder = self.folder / "read-only-docker"
        bin_folder.mkdir()
        docker = bin_folder / "docker"
        docker.write_text("""#!/bin/bash
if [[ "$1" == --host ]]; then shift 2; fi
if [[ "$1" == info ]]; then exit 0; fi
if [[ "$1" == compose && "$2" == version ]]; then echo 5.7.0; exit 0; fi
echo 'Unexpected Docker mutation in initialization regression test' >&2
exit 90
""")
        docker.chmod(0o700)
        environment = dict(os.environ, PATH=str(bin_folder) + os.pathsep + os.environ["PATH"], MAKAN_ENV_FILE=str(self.env_file))
        before = self.env_file.read_bytes()
        result = subprocess.run(["bash", str(ROOT / "deploy.sh"), "init"], env=environment, capture_output=True, text=True)
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertIn("Initialization complete", result.stdout)
        self.assertIn("bash ./deploy.sh check", result.stdout)
        result = subprocess.run([
            "bash", str(ROOT / "deploy.sh"), "init", "--import-landing-env",
            str(self.folder / "missing-old-production.env"), "--landing-project", "makan-landing-prod",
        ], env=environment, capture_output=True, text=True)
        self.assertNotEqual(0, result.returncode)
        self.assertIn("Legacy environment file does not exist", result.stderr)
        self.assertIn("bash ./deploy.sh up", result.stderr)
        self.assertIn("Setup stopped", result.stderr)
        self.assertNotIn("bash deploy.sh logs", result.stderr)
        self.assertEqual(before, self.env_file.read_bytes())


if __name__ == "__main__":
    unittest.main()
