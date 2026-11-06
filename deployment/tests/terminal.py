"""Run a bounded command with a controlling terminal, as in an SSH session."""

import os
import pty
import select
import signal
import time


def run_terminal(command, *, env, timeout=20, live=False):
    pid, descriptor = pty.fork()
    if pid == 0:
        try:
            os.execvpe(command[0], command, env)
        except BaseException:
            os._exit(127)
    output = bytearray()
    status = None
    started = time.monotonic()
    try:
        while time.monotonic() - started < timeout:
            ready, _, _ = select.select([descriptor], [], [], 0.1)
            if ready:
                try:
                    block = os.read(descriptor, 65536)
                except OSError:
                    block = b""
                output.extend(block)
                if live and block:
                    print(block.decode(errors="replace"), end="", flush=True)
            done, result = os.waitpid(pid, os.WNOHANG)
            if done:
                status = os.waitstatus_to_exitcode(result)
                # Drain the final completion message after the child exits.
                while select.select([descriptor], [], [], 0)[0]:
                    try:
                        block = os.read(descriptor, 65536)
                    except OSError:
                        break
                    if not block:
                        break
                    output.extend(block)
                    if live:
                        print(block.decode(errors="replace"), end="", flush=True)
                break
        if status is None:
            raise TimeoutError(f"Terminal command exceeded {timeout}s:\n" + output.decode(errors="replace"))
        return status, output.decode(errors="replace")
    finally:
        if status is None:
            # The tested fixed runner stays in this foreground process group.
            try:
                os.killpg(pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            os.waitpid(pid, 0)
        os.close(descriptor)


# All values are argv, without shell expansion. Use the exact production runner.
JOB_SCRIPT = r'''
set -Eeuo pipefail
source "$1"
shift
name="$1"; limit="$2"; service="$3"; shift 3
count="$1"; shift
DOCKER=("${@:1:count}"); shift "$count"
count="$1"; shift
COMPOSE=("${@:1:count}"); shift "$count"
JOB_NAME=''
say() { printf '\n[MakanApp] %s\n' "$*"; }
die() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }
cleanup_job() { if [[ -n "$JOB_NAME" ]]; then "${DOCKER[@]}" rm -f "$JOB_NAME" >/dev/null 2>&1 || true; fi; }
trap cleanup_job EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
run_job "$name" "$limit" "$service" "$@"
'''


def job_command(library, name, limit, service, docker, compose, command):
    return ["bash", "-c", JOB_SCRIPT, "makan-terminal-test", str(library), name, str(limit), service,
            str(len(docker)), *docker, str(len(compose)), *compose, *command]
