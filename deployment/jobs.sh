#!/usr/bin/env bash
# Shared by deploy.sh and the terminal integration test. The caller provides
# DOCKER, COMPOSE, JOB_NAME, say() and die(), and cleans up JOB_NAME on signals.

run_job() {
  local name="$1" limit="$2" service="$3" result=0 started=$SECONDS
  shift 3
  JOB_NAME="makan-platform-${name}-$$"
  say "Running $name (timeout ${limit}s; live output follows)"
  # Compose keeps stdin open even with -T. Under timeout's separate process
  # group, reading the SSH terminal can stop the client with SIGTTIN.
  # These jobs never need input; keep signal handling in the foreground too.
  timeout --foreground --signal=TERM --kill-after=20s "${limit}s" \
    "${COMPOSE[@]}" run --rm --no-deps -T --interactive=false \
    --name "$JOB_NAME" "$service" "$@" </dev/null || result=$?
  "${DOCKER[@]}" rm -f "$JOB_NAME" >/dev/null 2>&1 || true
  JOB_NAME=''
  if (( result == 124 || result == 137 )); then
    die "$name exceeded its ${limit}s timeout (exit $result). Deployment stopped."
  fi
  (( result == 0 )) || die "$name failed (exit $result). Deployment stopped; review the output before retrying."
  say "$name completed in $(( SECONDS - started ))s"
}
