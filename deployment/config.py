#!/usr/bin/env python3
"""Deployment configuration and network checks. Standard library only; never eval dotenv."""

import argparse
import ipaddress
import json
import os
from pathlib import Path
import re
import secrets
import socket
import stat
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / ".env.production.example"
HOSTS = (
    "makanapp.org", "www.makanapp.org", "app.makanapp.org", "testapp.makanapp.org",
    "management.makanapp.org", "testmanagement.makanapp.org",
)
SECRET_KEYS = (
    "MAKAN_APP_SESSION_SECRET", "MAKAN_TESTAPP_SESSION_SECRET",
    "MAKAN_MANAGEMENT_SESSION_SECRET", "MAKAN_TESTMANAGEMENT_SESSION_SECRET",
    "MAKAN_LANDING_POSTGRES_PASSWORD", "MAKAN_LANDING_MIGRATION_DB_PASSWORD",
    "MAKAN_LANDING_API_DB_PASSWORD", "MAKAN_LANDING_AUTH_SECRET",
    "MAKAN_LANDING_AUTH_MFA_KEY", "MAKAN_LANDING_PROXY_SHARED_SECRET",
)
LANDING_KEYS = {key: key.removeprefix("MAKAN_LANDING_") for key in SECRET_KEYS[4:]}


def dotenv(path):
    values = {}
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        match = re.fullmatch(r"([A-Z][A-Z0-9_]*)=(.*)", line)
        if not match or match[1] in values:
            raise ValueError("Invalid or duplicate dotenv assignment; use KEY=value on each line")
        key, value = match.groups()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        values[key] = value
    return values


def validate(path):
    if path.is_symlink() or not path.is_file():
        raise ValueError("Credential file is missing or is a symlink; run ./deploy.sh init")
    if stat.S_IMODE(path.stat().st_mode) & 0o077:
        raise ValueError("Credential file permissions must be 600; use chmod 600 on that file")
    values = dotenv(path)
    expected = set(dotenv(TEMPLATE))
    if set(values) != expected:
        missing = sorted(expected - values.keys())
        unknown = sorted(values.keys() - expected)
        raise ValueError(f"Environment keys differ from the template; missing={missing}, unknown={unknown}")
    for key in SECRET_KEYS:
        if not re.fullmatch(r"[a-f0-9]{64}", values[key]):
            raise ValueError(f"{key} must be a private 32-byte lowercase hexadecimal key")
    if len({values[key] for key in SECRET_KEYS}) != len(SECRET_KEYS):
        raise ValueError("Every session key, authentication key and database password must differ")
    if ipaddress.ip_address(values["MAKAN_SERVER_IP"]).version != 4:
        raise ValueError("MAKAN_SERVER_IP must be the frontend server's public IPv4 address")
    ipv6 = values["MAKAN_SERVER_IPV6"]
    if ipv6 and ipaddress.ip_address(ipv6).version != 6:
        raise ValueError("MAKAN_SERVER_IPV6 must be IPv6 or empty")
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", values["MAKAN_ACME_EMAIL"]):
        raise ValueError("MAKAN_ACME_EMAIL is invalid")
    ca = urllib.parse.urlsplit(values["MAKAN_ACME_CA"])
    if ca.scheme != "https" or not ca.hostname or ca.username or ca.password or ca.query or ca.fragment:
        raise ValueError("MAKAN_ACME_CA must be an HTTPS ACME directory URL")
    for key in ("MAKAN_MANAGEMENT_OWNER_ROLE_KEYS", "MAKAN_TESTMANAGEMENT_OWNER_ROLE_KEYS"):
        roles = json.loads(values[key])
        if not isinstance(roles, list) or not roles or any(not isinstance(r, str) or not r for r in roles):
            raise ValueError(f"{key} must be a nonempty JSON array of backend role keys")
    for key in ("MAKAN_LANDING_EXTERNAL_VOLUMES", "MAKAN_LANDING_SEO_INDEXING_ENABLED", "MAKAN_LANDING_ANALYTICS_ENABLED"):
        if values[key] not in ("true", "false"):
            raise ValueError(f"{key} must be true or false")
    if not re.fullmatch(r"[a-z][a-z0-9_]{0,62}", values["MAKAN_LANDING_DB_NAME"]):
        raise ValueError("MAKAN_LANDING_DB_NAME is invalid")
    for key in ("MAKAN_LANDING_DB_VOLUME", "MAKAN_LANDING_MEDIA_VOLUME", "MAKAN_LANDING_OPERATIONS_VOLUME"):
        if not re.fullmatch(r"[a-zA-Z0-9][a-zA-Z0-9_.-]+", values[key]):
            raise ValueError(f"{key} is invalid")
    return values


def initialize(path, landing_env=None, landing_project=None):
    if path.exists():
        if landing_env or landing_project:
            raise ValueError("Existing platform credentials were preserved. Import is only allowed before the first initialization")
        validate(path)
        print("Existing credentials validated and preserved.")
        return
    values = dotenv(TEMPLATE)
    values.update({key: secrets.token_hex(32) for key in SECRET_KEYS})
    if landing_env:
        if not landing_project or not re.fullmatch(r"makan-landing-prod(?:-[a-z0-9]+)*", landing_project):
            raise ValueError("Import requires --landing-project, e.g. makan-landing-prod")
        old = dotenv(landing_env)
        for new_key, old_key in LANDING_KEYS.items():
            if not re.fullmatch(r"[a-f0-9]{64}", old.get(old_key, "")):
                raise ValueError(f"Previous landing credential is missing or invalid: {old_key}")
            values[new_key] = old[old_key]
        values.update({
            "MAKAN_LANDING_DB_NAME": old.get("POSTGRES_DB", "makan_landing"),
            "MAKAN_LANDING_EXTERNAL_VOLUMES": "true",
            "MAKAN_LANDING_DB_VOLUME": landing_project + "_postgres_data",
            "MAKAN_LANDING_MEDIA_VOLUME": landing_project + "_media_data",
            "MAKAN_LANDING_OPERATIONS_VOLUME": landing_project + "_operations_data",
            "MAKAN_LANDING_SEO_INDEXING_ENABLED": old.get("SEO_INDEXING_ENABLED", "false"),
            "MAKAN_LANDING_ANALYTICS_ENABLED": old.get("ANALYTICS_ENABLED", "false"),
        })
    elif landing_project:
        raise ValueError("--landing-project requires --import-landing-env")
    path.parent.mkdir(parents=True, exist_ok=True)
    # Exclusive creation prevents a concurrent invocation from replacing credentials.
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            for key, value in values.items():
                if key.endswith("_OWNER_ROLE_KEYS"):
                    value = "'" + value + "'"
                handle.write(f"{key}={value}\n")
            handle.flush()
            os.fsync(handle.fileno())
        validate(path)
    except Exception:
        path.unlink(missing_ok=True)
        raise
    print("Production credentials created with mode 600. Keep a private offline copy.")
    if landing_env:
        print("Previous landing keys and volume names imported; stop its old containers before deployment.")


def dns_check(values):
    expected_v4 = {values["MAKAN_SERVER_IP"]}
    expected_v6 = {str(ipaddress.ip_address(values["MAKAN_SERVER_IPV6"]))} if values["MAKAN_SERVER_IPV6"] else set()
    errors = []
    for host in HOSTS:
        try:
            addresses = {info[4][0] for info in socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)}
            v4 = {str(ipaddress.ip_address(a)) for a in addresses if ipaddress.ip_address(a).version == 4}
            v6 = {str(ipaddress.ip_address(a)) for a in addresses if ipaddress.ip_address(a).version == 6}
            if v4 != expected_v4 or v6 != expected_v6:
                raise ValueError(f"A={sorted(v4)}, AAAA={sorted(v6)}; expected frontend IP(s)")
            print(f"[DNS] {host}: OK", flush=True)
        except (OSError, ValueError) as error:
            errors.append(f"{host}: {error}")
    if errors:
        raise ValueError("DNS must point directly to this server (DNS only):\n" + "\n".join(errors))


def backend_check():
    for origin in ("http://94.184.32.84", "http://94.184.32.84:8090"):
        with urllib.request.urlopen(origin + "/swagger/index.html", timeout=12) as response:
            if response.status != 200:
                raise ValueError(f"Backend is unavailable: {origin}")
        print(f"[API] {origin}: reachable", flush=True)


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def public_check(wait_seconds):
    pending = {
        "makanapp.org": ("/", "landing"), "app.makanapp.org": ("/enter", "app"),
        "testapp.makanapp.org": ("/enter", "testapp"),
        "management.makanapp.org": ("/api/health", "management"),
        "testmanagement.makanapp.org": ("/api/health", "testmanagement"),
    }
    pending["www.makanapp.org"] = ("/", None)
    opener = urllib.request.build_opener(NoRedirect)
    deadline = time.monotonic() + wait_seconds
    last_errors = {}
    while pending:
        for host, (path, identity) in list(pending.items()):
            try:
                try:
                    opener.open("http://" + host + path, timeout=8).close()
                    raise ValueError("HTTP did not redirect to HTTPS")
                except urllib.error.HTTPError as response:
                    if response.code != 308 or response.headers.get("Location") != "https://" + host + path:
                        raise ValueError("HTTP redirect is incorrect") from None
                    response.close()
                if identity is None:
                    try:
                        opener.open("https://" + host + path, timeout=8).close()
                        raise ValueError("www did not redirect to the canonical domain")
                    except urllib.error.HTTPError as response:
                        if response.code != 308 or response.headers.get("Location") != "https://makanapp.org/":
                            raise ValueError("www canonical redirect is incorrect") from None
                        response.close()
                else:
                    with urllib.request.urlopen("https://" + host + path, timeout=8) as response:
                        if response.status != 200 or response.headers.get("X-Makan-Service") != identity:
                            raise ValueError("HTTPS returned an unexpected service")
                print(f"[HTTPS] {host}: certificate, redirect and routing OK", flush=True)
                del pending[host]
                last_errors.pop(host, None)
            except (OSError, ValueError) as error:
                last_errors[host] = str(error)
        if not pending:
            return
        if time.monotonic() >= deadline:
            raise ValueError("Public HTTPS verification failed:\n" + "\n".join(f"{host}: {error}" for host, error in last_errors.items()))
        print("[HTTPS] Waiting for certificates: " + ", ".join(pending), flush=True)
        time.sleep(min(5, max(0, deadline - time.monotonic())))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("init", "validate", "keys", "get", "dns", "backend", "public"))
    parser.add_argument("--env-file", type=Path, default=ROOT / ".env.production")
    parser.add_argument("--import-landing-env", type=Path)
    parser.add_argument("--landing-project")
    parser.add_argument("--key")
    parser.add_argument("--wait", type=int, default=0)
    args = parser.parse_args()
    if args.command == "init":
        initialize(args.env_file, args.import_landing_env, args.landing_project)
    elif args.command == "keys":
        print("\n".join(dotenv(TEMPLATE)))
    elif args.command == "backend":
        backend_check()
    elif args.command == "public":
        public_check(args.wait)
    else:
        values = validate(args.env_file)
        if args.command == "validate":
            print("Production environment validated; secret values were not printed.")
        elif args.command == "dns":
            dns_check(values)
        elif args.command == "get":
            if args.key in SECRET_KEYS or args.key not in values:
                raise ValueError("Only known non-secret configuration fields can be printed")
            print(values[args.key])


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, urllib.error.URLError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1) from None
