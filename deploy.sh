#!/usr/bin/env bash
# One entry point for the five MakanApp sites. Run on the frontend server.
set -Eeuo pipefail
umask 077

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
ENV_FILE="${MAKAN_ENV_FILE:-$ROOT/.env.production}"
BACKUP_ROOT="${MAKAN_BACKUP_DIR:-$ROOT/.deployment/backups}"
COMMAND="${1:-up}"
if (( $# )); then shift; fi
DOCKER=(docker --host "${MAKAN_DOCKER_HOST:-unix:///var/run/docker.sock}")
COMPOSE=()
JOB_NAME=''
BUILDING_SERVICE=''
QUIESCED=()
AUTO_RESUME=0

say() { printf '\n[MakanApp] %s\n' "$*"; }
die() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }
cfg() { python3 "$ROOT/deployment/config.py" "$@" --env-file "$ENV_FILE"; }
dc() { "${COMPOSE[@]}" "$@"; }

usage() {
  cat <<'HELP'
Usage: bash deploy.sh [command]
  up           Install missing prerequisites, check DNS/API, build and deploy (default)
  install      Install Docker Engine and Compose on Ubuntu/Debian
  init         Generate or validate persistent keys; never replace an existing env file
               Then run: bash ./deploy.sh check, followed by bash ./deploy.sh up
               Legacy installations only: --import-landing-env EXISTING_FILE --landing-project makan-landing-prod
  check        Validate credentials, Compose, DNS and both backend servers
  verify       Verify running backend configuration and public HTTPS for every hostname
  status       Show this deployment's containers
  logs [name]  Follow logs (optional Compose service name)
  backup       Briefly stop landing writers; back up database, media, TLS and credentials
  down         Stop/remove this deployment's containers; retain all volumes
  admin        Bootstrap the landing owner by phone (interactive)
  sms          Configure the landing SMS provider (interactive, hidden credentials)

Optional environment variables:
  MAKAN_ENV_FILE              Absolute path to a persistent credential file
  MAKAN_BACKUP_DIR            Private backup destination
  MAKAN_DOCKER_HOST           Default: unix:///var/run/docker.sock
  MAKAN_SKIP_BUILD=1          Reuse images already built from these exact sources
  MAKAN_PYPI_MIRROR_URL       Optional public HTTPS PyPI mirror base for the landing API build
See DEPLOYMENT.fa.md before migrating an existing production landing site.
HELP
}

case "$COMMAND" in
  help|-h|--help) usage; exit 0 ;;
  up|install|init|check|verify|status|logs|backup|down|admin|sms) ;;
  *) usage; die "Unknown command: $COMMAND" ;;
esac
if [[ "$COMMAND" != init && "$COMMAND" != logs && $# -gt 0 ]]; then
  die 'Unexpected arguments. Use bash deploy.sh help.'
fi

require_root() { (( EUID == 0 )) || die 'Missing system packages require root; run sudo bash deploy.sh up.'; }

ensure_host_tools() {
  local tool missing=0
  for tool in python3 curl flock timeout ss; do
    command -v "$tool" >/dev/null || missing=1
  done
  if (( missing )); then
    case "$COMMAND" in up|install|init) ;; *) die 'Install prerequisites first: sudo bash deploy.sh install' ;; esac
    require_root
    command -v apt-get >/dev/null || die 'Install python3, curl, util-linux, coreutils and iproute2 for your OS.'
    say 'Installing host prerequisites'
    apt-get update
    DEBIAN_FRONTEND=noninteractive apt-get install -y python3 ca-certificates curl util-linux coreutils iproute2
  fi
}

install_docker() {
  require_root
  [[ -f /etc/os-release ]] || die 'Install Docker Engine and Docker Compose for your OS.'
  # /etc/os-release is trusted system configuration, never a project dotenv file.
  # shellcheck source=/dev/null
  . /etc/os-release
  case "$ID" in ubuntu|debian) ;; *) die 'Automatic installation supports Ubuntu and Debian; install Docker manually on this OS.' ;; esac
  if command -v docker >/dev/null; then
    if ! "${DOCKER[@]}" compose version >/dev/null 2>&1; then
      apt-get update
      if [[ "$(dpkg-query -W -f='${Status}' docker.io 2>/dev/null || true)" == 'install ok installed' ]]; then
        apt-cache show docker-compose-v2 >/dev/null 2>&1 || die 'This distro lacks docker-compose-v2. Install a current Compose plugin without replacing existing Docker data.'
        DEBIAN_FRONTEND=noninteractive apt-get install -y docker-compose-v2
      else
        DEBIAN_FRONTEND=noninteractive apt-get install -y docker-compose-plugin
      fi
    fi
  else
    say 'Installing Docker Engine from the official Docker apt repository'
    apt-get update
    DEBIAN_FRONTEND=noninteractive apt-get install -y ca-certificates curl
    install -m 0755 -d /etc/apt/keyrings
    curl --fail --show-error --location --retry 3 --connect-timeout 15 --max-time 120 \
      "https://download.docker.com/linux/$ID/gpg" -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc
    local codename="${UBUNTU_CODENAME:-${VERSION_CODENAME:-}}"
    [[ -n "$codename" ]] || die 'Could not determine the distribution codename.'
    cat > /etc/apt/sources.list.d/docker.sources <<REPO
Types: deb
URIs: https://download.docker.com/linux/$ID
Suites: $codename
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
REPO
    DEBIAN_FRONTEND=noninteractive apt-get update
    DEBIAN_FRONTEND=noninteractive apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  fi
  command -v systemctl >/dev/null || die 'Start Docker Engine using your system service manager.'
  systemctl enable --now docker
}

ensure_engine() {
  if ! command -v docker >/dev/null || ! "${DOCKER[@]}" compose version >/dev/null 2>&1; then
    case "$COMMAND" in up|install|init) install_docker ;; *) die 'Docker/Compose is missing; run sudo bash deploy.sh install.' ;; esac
  fi
  if ! "${DOCKER[@]}" info >/dev/null 2>&1; then
    case "$COMMAND" in
      up|install|init)
        if (( EUID == 0 )) && command -v systemctl >/dev/null; then systemctl start docker; fi ;;
    esac
  fi
  "${DOCKER[@]}" info >/dev/null 2>&1 || die "Cannot reach Docker Engine at ${DOCKER[2]}. Check its service and socket permissions."
  local version
  version="$("${DOCKER[@]}" compose version --short)"
  python3 - "$version" <<'PY'
import re, sys
version = tuple(map(int, re.findall(r'\d+', sys.argv[1])[:2]))
if version < (2, 24):
    raise SystemExit('Docker Compose 2.24+ is required; update the Compose plugin.')
PY
}

init_environment() {
  if [[ ! -e "$ENV_FILE" ]]; then
    local existing imported=0 item
    existing="$("${DOCKER[@]}" volume ls --filter label=com.docker.compose.project=makan-platform --format '{{.Name}}')"
    [[ -z "$existing" ]] || die 'Existing platform volumes found without their credential file. Restore .env.production; fresh keys would invalidate existing data/sessions.'
    for item in "$@"; do [[ "$item" != --import-landing-env ]] || imported=1; done
    if (( ! imported )); then
      existing="$("${DOCKER[@]}" volume ls --format '{{.Name}}' | python3 -c 'import sys; print("".join(x for x in sys.stdin if x.startswith("makan-landing-prod")), end="")')"
      if [[ -n "$existing" || -f /etc/makanapp/production.env || -f /etc/makan-landing/production.env ]]; then
        die 'An older production landing installation was detected. Import its keys/volumes with init --import-landing-env PATH --landing-project makan-landing-prod; see DEPLOYMENT.fa.md.'
      fi
    fi
  fi
  cfg init "$@"
}

check_volumes() {
  local key volume container project
  for key in MAKAN_LANDING_DB_VOLUME MAKAN_LANDING_MEDIA_VOLUME MAKAN_LANDING_OPERATIONS_VOLUME; do
    volume="$(cfg get --key "$key")"
    if [[ "$(cfg get --key MAKAN_LANDING_EXTERNAL_VOLUMES)" == true ]]; then
      "${DOCKER[@]}" volume inspect "$volume" >/dev/null 2>&1 || die "Imported volume does not exist: $volume. Correct its name in the credential file."
    fi
    while read -r container; do
      [[ -n "$container" ]] || continue
      project="$("${DOCKER[@]}" inspect --format '{{index .Config.Labels "com.docker.compose.project"}}' "$container")"
      [[ "$project" == makan-platform ]] || die "Volume $volume is still used by $container. Stop the old landing stack before sharing its database/media volumes."
    done < <("${DOCKER[@]}" ps -q --filter "volume=$volume")
  done
}

check_ports() {
  local edge listeners
  edge="$(dc ps --status running -q edge)"
  [[ -z "$edge" ]] || return 0
  listeners="$(ss -H -ltn '( sport = :80 or sport = :443 )'; ss -H -lun 'sport = :443')"
  [[ -z "$listeners" ]] || die 'Ports 80/443 are already occupied. Inspect ss -ltnup and migrate the old Nginx/Apache/Caddy stack as described in DEPLOYMENT.fa.md.'
}

preflight() {
  cfg validate
  dc config --quiet
  check_volumes
  check_ports
  cfg dns
  cfg backend
}

run_job() {
  local name="$1" limit="$2" service="$3" result=0
  shift 3
  JOB_NAME="makan-platform-${name}-$$"
  say "Running $name (timeout ${limit}s; live output follows)"
  timeout --signal=TERM --kill-after=20s "${limit}s" \
    "${COMPOSE[@]}" run --rm --no-deps -T --name "$JOB_NAME" "$service" "$@" || result=$?
  "${DOCKER[@]}" rm -f "$JOB_NAME" >/dev/null 2>&1 || true
  JOB_NAME=''
  (( result == 0 )) || die "$name failed (exit $result). Deployment stopped; review the output before retrying."
}

quiesce_landing() {
  local service
  QUIESCED=()
  for service in landing-web landing-api landing-maintenance; do
    if [[ -n "$(dc ps --status running -q "$service")" ]]; then QUIESCED+=("$service"); fi
  done
  if (( ${#QUIESCED[@]} )); then
    AUTO_RESUME=1
    say 'Briefly stopping landing writers for a consistent database/media backup'
    dc stop "${QUIESCED[@]}"
  fi
}

resume_landing() {
  if (( ${#QUIESCED[@]} )); then dc start "${QUIESCED[@]}"; fi
  QUIESCED=()
  AUTO_RESUME=0
}

backup_data() {
  local directory media_volume tls_volume
  [[ -n "$(dc ps --status running -q landing-db)" ]] || die 'The landing database must be running before backup.'
  directory="$BACKUP_ROOT/$(date -u +%Y%m%dT%H%M%SZ)-$$"
  mkdir -p -- "$directory"
  cp -- "$ENV_FILE" "$directory/production.env"
  say "Writing a private backup to $directory"
  # Variables intentionally expand inside the database container.
  # shellcheck disable=SC2016
  dc exec -T landing-db sh -c 'exec pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$directory/landing-db.dump"
  dc exec -T landing-db pg_restore --list < "$directory/landing-db.dump" > /dev/null
  media_volume="$(cfg get --key MAKAN_LANDING_MEDIA_VOLUME)"
  if "${DOCKER[@]}" volume inspect "$media_volume" >/dev/null 2>&1; then
    "${DOCKER[@]}" run --rm --network none --read-only --cap-drop ALL --security-opt no-new-privileges:true \
      --mount "type=volume,src=$media_volume,dst=/backup-media,readonly" \
      --entrypoint python makan-platform-landing-api:local -c \
      'import sys,tarfile; t=tarfile.open(fileobj=sys.stdout.buffer,mode="w|gz"); t.add("/backup-media",arcname="media"); t.close()' \
      > "$directory/landing-media.tar.gz"
  fi
  tls_volume=makan-platform_caddy_data
  if "${DOCKER[@]}" volume inspect "$tls_volume" >/dev/null 2>&1; then
    "${DOCKER[@]}" run --rm --network none --read-only --cap-drop ALL --security-opt no-new-privileges:true \
      --mount "type=volume,src=$tls_volume,dst=/backup-tls,readonly" \
      --entrypoint tar makan-platform-edge:local -czf - -C /backup-tls . > "$directory/caddy-data.tar.gz"
  fi
  python3 - "$directory" <<'PY'
import hashlib, pathlib, sys
directory = pathlib.Path(sys.argv[1])
files = sorted(p for p in directory.iterdir() if p.is_file() and p.name != 'SHA256SUMS')
with (directory / 'SHA256SUMS').open('w') as output:
    for path in files:
        digest = hashlib.sha256()
        with path.open('rb') as source:
            for block in iter(lambda: source.read(1024 * 1024), b''):
                digest.update(block)
        output.write(digest.hexdigest() + '  ' + path.name + '\n')
PY
  touch "$directory/.complete"
  say "Backup completed: $directory (keep an off-server copy)"
}

verify_internal() {
  local service backend
  for service in app testapp management testmanagement; do
    backend=http://94.184.32.84
    case "$service" in testapp|testmanagement) backend=http://94.184.32.84:8090 ;; esac
    dc exec -T "$service" node - "$backend" "https://$service.makanapp.org" <<'JS'
const [backend, origin] = process.argv.slice(2);
if (process.env.BACKEND_BASE_URL !== backend || process.env.APP_ORIGIN !== origin || process.env.COOKIE_SECURE !== 'true') {
  console.error('Runtime origin/backend/secure-cookie configuration is incorrect.'); process.exit(1);
}
fetch(backend + '/swagger/index.html', {signal: AbortSignal.timeout(12000)})
  .then(r => { if (!r.ok) throw new Error(); console.log('[Runtime] ' + origin + ' -> ' + backend + ': OK'); })
  .catch(() => { console.error('Configured backend is unreachable from this container.'); process.exit(1); });
JS
  done
}

cleanup() {
  local result=$?
  trap - EXIT
  if [[ -n "$JOB_NAME" ]]; then "${DOCKER[@]}" rm -f "$JOB_NAME" >/dev/null 2>&1 || true; fi
  if (( AUTO_RESUME && ${#QUIESCED[@]} )); then
    dc start "${QUIESCED[@]}" || true
  fi
  if (( result != 0 )); then
    if [[ -n "$BUILDING_SERVICE" ]]; then
      printf '\nImage build failed for %s. Review the build output above; no new application containers were started.\n' "$BUILDING_SERVICE" >&2
      printf 'After fixing the download/build issue, resume with: bash ./deploy.sh up\n' >&2
    else
      case "$COMMAND" in
        init|install) printf '\nSetup stopped. Review the message above for the next step.\n' >&2 ;;
        *) printf '\nDeployment command failed. Use: bash deploy.sh status / bash deploy.sh logs\n' >&2 ;;
      esac
    fi
    printf 'Credentials and data volumes have been retained.\n' >&2
  fi
  exit "$result"
}

ensure_host_tools
# Explicitly select the server Engine, independent of stale Desktop/Podman contexts.
unset DOCKER_CONTEXT COMPOSE_PROFILES COMPOSE_FILE COMPOSE_PROJECT_NAME
# Compose shell variables take priority over --env-file; clear only our schema keys.
while read -r key; do unset "$key"; done < <(python3 "$ROOT/deployment/config.py" keys)
export COMPOSE_PARALLEL_LIMIT=1
COMPOSE=("${DOCKER[@]}" compose --parallel 1 --project-directory "$ROOT" \
  --env-file "$ENV_FILE" -p makan-platform -f "$ROOT/compose.production.yaml")

case "$COMMAND" in
  up|install|init|backup|down|admin|sms)
    mkdir -p -- "$ROOT/.deployment"
    exec 9>"$ROOT/.deployment/deploy.lock"
    flock -n 9 || die 'Another deployment/backup/operator command is already running.' ;;
esac
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
ensure_engine

case "$COMMAND" in
  install) say 'Docker Engine and Compose are ready.' ;;
  init)
    init_environment "$@"
    if [[ "$(cfg get --key MAKAN_LANDING_EXTERNAL_VOLUMES)" == true ]]; then
      say 'Legacy data imported. Stop the previous stack as described in DEPLOYMENT.fa.md before continuing.'
    else
      say 'Initialization complete. Existing credentials will be reused; no legacy import is needed for a fresh installation.'
    fi
    printf 'Next commands (keep the same MAKAN_ENV_FILE if customized):\n  bash ./deploy.sh check\n  bash ./deploy.sh up\n' ;;
  check) preflight ;;
  status) dc ps --all ;;
  logs) dc logs --follow --tail 100 "$@" ;;
  down)
    cfg validate
    dc down
    say 'Containers stopped. All persistent volumes and credentials retained.' ;;
  verify)
    cfg validate
    verify_internal
    cfg public --wait 0 ;;
  backup)
    cfg validate
    quiesce_landing
    backup_data
    resume_landing ;;
  admin|sms)
    cfg validate
    [[ -t 0 && -t 1 ]] || die 'This operator command needs an interactive terminal.'
    if [[ "$COMMAND" == admin ]]; then
      dc run --rm --no-deps landing-api python -m app.commands.admin bootstrap
    else
      dc run --rm --no-deps landing-api python -m app.commands.sms configure
    fi ;;
  up)
    say 'MakanApp: unified deployment for all five sites'
    init_environment
    preflight
    if [[ "${MAKAN_SKIP_BUILD:-0}" != 1 ]]; then
      say 'Building production images sequentially to limit memory usage'
      for service in app testapp management testmanagement landing-db landing-api landing-web edge; do
        BUILDING_SERVICE="$service"
        if [[ "$service" == landing-api && "${MAKAN_PYPI_MIRROR_URL+x}" == x ]]; then
          dc build --build-arg "PYPI_MIRROR_URL=$MAKAN_PYPI_MIRROR_URL" "$service"
        else
          dc build "$service"
        fi
        BUILDING_SERVICE=''
      done
    fi
    say 'Validating the HTTPS reverse proxy configuration'
    dc run --rm --no-deps -T edge caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
    previous_data=0
    db_volume="$(cfg get --key MAKAN_LANDING_DB_VOLUME)"
    if "${DOCKER[@]}" volume inspect "$db_volume" >/dev/null 2>&1; then previous_data=1; fi
    dc up -d --no-build --wait --wait-timeout 180 landing-db
    quiesce_landing
    if (( previous_data )); then backup_data; fi
    # Once schema migration begins, an error needs operator review before resuming writers.
    AUTO_RESUME=0
    QUIESCED=()
    run_job migration 300 landing-migrate alembic upgrade head
    run_job content-import 300 landing-api python -u -m app.commands.import_content
    say 'Starting all sites and waiting for application health checks'
    dc up -d --no-build --wait --wait-timeout 300 --remove-orphans
    verify_internal
    say 'Checking public certificates, HTTPS redirects and hostname routing'
    cfg public --wait 180
    dc ps
    say 'Deployment verified: makanapp.org, app, management, testapp, testmanagement.' ;;
esac
