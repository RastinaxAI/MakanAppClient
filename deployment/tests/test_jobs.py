"""Migration jobs must finish, fail and time out correctly in an SSH-like TTY."""

import os
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from deployment.tests.terminal import job_command, run_terminal

LIBRARY = ROOT / "deployment/jobs.sh"


class TerminalJobTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix="makan-terminal-job-")
        self.addCleanup(self.directory.cleanup)
        self.folder = Path(self.directory.name)
        self.trace = self.folder / "cleanup.txt"
        self.docker = self.folder / "docker"
        # Deliberately read stdin like Compose's attach path. With a controlling
        # terminal and no input, an interactive invocation cannot finish.
        self.docker.write_text("""#!/usr/bin/env python3
import os, pathlib, sys, time
args = sys.argv[1:]
if args[0] == 'rm':
    with pathlib.Path(os.environ['MAKAN_TEST_CLEANUP']).open('a') as log:
        log.write(args[-1] + '\\n')
    raise SystemExit(0)
print('Created test job', flush=True)
assert not os.isatty(0), 'noninteractive jobs must not inherit the SSH terminal'
assert os.read(0, 1) == b'', 'noninteractive stdin must be closed'
if args[-1] == 'failure':
    raise SystemExit(7)
if args[-1] == 'hang':
    time.sleep(10)
print('JOB_EXECUTED', flush=True)
""")
        self.docker.chmod(0o700)
        self.environment = dict(os.environ, MAKAN_TEST_CLEANUP=str(self.trace))

    def run_job(self, mode, limit=4):
        command = job_command(LIBRARY, "migration", limit, "landing-migrate",
                              [str(self.docker)], [str(self.docker)], [mode])
        return run_terminal(command, env=self.environment, timeout=7)

    def assert_job_removed(self):
        self.assertRegex(self.trace.read_text(), r"^makan-platform-migration-\d+\n$")

    def test_job_finishes_with_closed_stdin_in_a_controlling_terminal(self):
        status, output = self.run_job("success")
        self.assertEqual(0, status, output)
        self.assertIn("JOB_EXECUTED", output)
        self.assertIn("migration completed", output)
        self.assert_job_removed()

    def test_job_failure_stops_deployment_and_removes_its_container(self):
        status, output = self.run_job("failure")
        self.assertNotEqual(0, status, output)
        self.assertIn("migration failed (exit 7)", output)
        self.assertNotIn("migration completed", output)
        self.assert_job_removed()

    def test_job_timeout_works_in_a_controlling_terminal_and_removes_its_container(self):
        status, output = self.run_job("hang", limit=1)
        self.assertNotEqual(0, status, output)
        self.assertIn("exceeded its 1s timeout (exit 124)", output)
        self.assertNotIn("migration completed", output)
        self.assert_job_removed()


if __name__ == "__main__":
    unittest.main()
