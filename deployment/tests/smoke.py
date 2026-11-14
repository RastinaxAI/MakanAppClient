#!/usr/bin/env python3
"""Exercise prebuilt images using disposable data, loopback ports and a private TLS CA.

No public certificates, DNS changes, real accounts or production volumes are used.
Run from any directory: python3 deployment/tests/smoke.py
"""

import json
import hashlib
import os
from pathlib import Path
import re
import socket
import subprocess
import sys
import tempfile
import tarfile
import time
import uuid

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from deployment import config
from deployment.tests.terminal import job_command, run_terminal

DOCKER = ["docker", "--host", os.environ.get("MAKAN_DOCKER_HOST", "unix:///var/run/docker.sock")]
ENV = {key: value for key, value in os.environ.items() if key not in config.dotenv(config.TEMPLATE)}
ENV.pop("DOCKER_CONTEXT", None)
ENV.pop("COMPOSE_PROFILES", None)


def run(command, timeout=300, **kwargs):
    return subprocess.run(command, env=ENV, check=True, timeout=timeout, **kwargs)


def free_port():
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        return listener.getsockname()[1]


def main():
    timings = {}
    project = "makan-platform-smoke-" + uuid.uuid4().hex[:8]
    work = ROOT / ".deployment"
    work.mkdir(mode=0o700, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="smoke-", dir=work) as temporary:
        directory = Path(temporary)
        env_file = directory / "production.env"
        config.initialize(env_file)
        model = json.loads(run(DOCKER + ["compose", "--env-file", str(env_file), "-f", str(ROOT / "compose.production.yaml"), "--profile", "tools", "config", "--format", "json"], capture_output=True, text=True).stdout)
        model["name"] = project
        for collection in ("volumes", "networks"):
            for name, settings in model[collection].items():
                settings["name"] = project + "_" + name
        for service in model["services"].values():
            service.pop("build", None)
        # Optional explicitly supplied runtime images for checking locally cached builds.
        api_image = os.environ.get("MAKAN_SMOKE_API_IMAGE")
        web_image = os.environ.get("MAKAN_SMOKE_WEB_IMAGE")
        if api_image:
            for name in ("landing-api", "landing-migrate", "landing-maintenance"):
                model["services"][name]["image"] = api_image
        if web_image:
            model["services"]["landing-web"]["image"] = web_image
        if api_image or web_image:
            print("Runtime image overrides supplied; this test does not validate their original build pipeline.", flush=True)
        http_port, https_port = free_port(), free_port()
        while https_port == http_port:
            https_port = free_port()
        edge = model["services"]["edge"]
        edge["ports"] = [
            {"host_ip": "127.0.0.1", "published": str(http_port), "target": 8080, "protocol": "tcp"},
            {"host_ip": "127.0.0.1", "published": str(https_port), "target": 8443, "protocol": "tcp"},
        ]
        caddyfile = directory / "Caddyfile"
        text, count = re.subn(r"^\s*acme_ca .+$", "\tlocal_certs\n\tskip_install_trust", (ROOT / "deployment/Caddyfile").read_text(), flags=re.MULTILINE)
        if count != 1:
            raise RuntimeError("Could not replace the public ACME issuer for the isolated test")
        caddyfile.write_text(text)
        caddyfile.chmod(0o644)
        edge["volumes"].append({"type": "bind", "source": str(caddyfile), "target": "/etc/caddy/Caddyfile", "read_only": True})
        compose_file = directory / "compose.json"
        # This is resolved Compose output. Escape literal $ before parsing it again.
        compose_file.write_text(json.dumps(model).replace("$", "$$"))
        compose_file.chmod(0o600)
        compose = DOCKER + ["compose", "--env-file", "/dev/null", "-p", project, "-f", str(compose_file)]
        try:
            started = time.monotonic()
            run(compose + ["up", "-d", "--no-build", "--wait", "--wait-timeout", "180", "landing-db"])
            timings["database_ready_seconds"] = round(time.monotonic() - started, 2)
            jobs = [("migration", "landing-migrate", ["alembic", "upgrade", "head"]),
                    ("content-import", "landing-api", ["python", "-u", "-m", "app.commands.import_content"]),
                    ("content-import-repeat", "landing-api", ["python", "-u", "-m", "app.commands.import_content"])]
            for name, service, command in jobs:
                job = job_command(ROOT / "deployment/jobs.sh", name, 120, service, DOCKER, compose, command)
                status, output = run_terminal(job, env=ENV, timeout=150, live=True)
                if status != 0:
                    raise RuntimeError(f"Terminal job {name} failed (exit {status}):\n{output}")
                assert name + " completed" in output
            print("PASS real migration + content imports via production runner in a controlling terminal", flush=True)
            started = time.monotonic()
            run(compose + ["up", "-d", "--no-build", "--wait", "--wait-timeout", "240"])
            timings["all_services_ready_seconds"] = round(time.monotonic() - started, 2)
            edge_id = run(compose + ["ps", "-q", "edge"], capture_output=True, text=True).stdout.strip()
            certificate = directory / "root.crt"
            run(DOCKER + ["cp", edge_id + ":/data/caddy/pki/authorities/local/root.crt", str(certificate)])
            targets = {
                "makanapp.org": ("/", "landing"),
                "app.makanapp.org": ("/enter", "app"),
                "testapp.makanapp.org": ("/enter", "testapp"),
                "management.makanapp.org": ("/api/health", "management"),
                "testmanagement.makanapp.org": ("/api/health", "testmanagement"),
            }
            curl = ["curl", "--noproxy", "*", "--silent", "--show-error", "--max-time", "20"]
            for host, (path, identity) in targets.items():
                headers = directory / "headers"
                code = run(curl + ["-H", "Host: " + host, "-D", str(headers), "-o", "/dev/null", "-w", "%{http_code}", f"http://127.0.0.1:{http_port}{path}"], capture_output=True, text=True).stdout
                assert code == "308" and f"location: https://{host}{path}" in headers.read_text().lower()
                code = run(curl + ["--resolve", f"{host}:{https_port}:127.0.0.1", "--cacert", str(certificate), "-D", str(headers), "-o", "/dev/null", "-w", "%{http_code}", f"https://{host}:{https_port}{path}"], capture_output=True, text=True).stdout
                assert code == "200", f"{host}: HTTP {code}"
                assert f"x-makan-service: {identity}" in headers.read_text().lower()
                print(f"PASS TLS + redirect + routing: {host}", flush=True)
            www = run(curl + ["--resolve", f"www.makanapp.org:{https_port}:127.0.0.1", "--cacert", str(certificate), "-D", "-", "-o", "/dev/null", f"https://www.makanapp.org:{https_port}/smoke?check=1"], capture_output=True, text=True).stdout.lower()
            assert "308" in www and "location: https://makanapp.org/smoke?check=1" in www
            print("PASS canonical www redirect preserves path/query", flush=True)
            for service in ("app", "testapp", "management", "testmanagement"):
                host = service + ".makanapp.org"
                source = ROOT / (service + "/web" if service in ("app", "testapp") else service)
                assets = ["/fonts/makan-reference/Vazirmatn.woff2", "/brand/makan-logo-v2.webp"] if service in ("app", "testapp") else ["/guides/makan-owner-guide.pdf"]
                for asset in assets:
                    body = directory / "asset"
                    code = run(curl + ["--resolve", f"{host}:{https_port}:127.0.0.1", "--cacert", str(certificate), "-o", str(body), "-w", "%{http_code}", f"https://{host}:{https_port}{asset}"], capture_output=True, text=True).stdout
                    assert code == "200", f"Missing production asset: {host}{asset}"
                    assert hashlib.sha256(body.read_bytes()).digest() == hashlib.sha256((source / "public" / asset.lstrip("/")).read_bytes()).digest()
                run(compose + ["exec", "-T", service, "node", "-e", "const fs=require('node:fs');if(process.getuid()!==1000||fs.existsSync('/usr/local/lib/node_modules')||fs.existsSync('/usr/local/bin/npm')||fs.existsSync('/usr/local/bin/yarn'))process.exit(1)"])
            print("PASS production font/logo/guide bytes + nonroot runtimes without npm/Yarn", flush=True)
            for service in ("app", "testapp", "management", "testmanagement"):
                backend = "http://94.184.32.84" + (":8090" if service.startswith("test") else "")
                javascript = "if(process.env.BACKEND_BASE_URL!==process.argv[1]||process.env.APP_ORIGIN!==process.argv[2]||process.env.COOKIE_SECURE!=='true')process.exit(1);fetch(process.env.BACKEND_BASE_URL+'/swagger/index.html',{signal:AbortSignal.timeout(12000)}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
                run(compose + ["exec", "-T", service, "node", "-e", javascript, backend, f"https://{service}.makanapp.org"])
            print("PASS backend selection + backend access from all four containers", flush=True)
            count_query = ["exec", "-T", "landing-db", "psql", "-U", "postgres", "-d", "makan_landing", "-Atc", "SELECT count(*) FROM pages"]
            before = run(compose + count_query, capture_output=True, text=True).stdout.strip()
            assert int(before) > 0
            dump = directory / "landing.dump"
            with dump.open("wb") as output:
                run(compose + ["exec", "-T", "landing-db", "pg_dump", "-U", "postgres", "-d", "makan_landing", "-Fc"], stdout=output)
            run(compose + ["exec", "-T", "landing-db", "createdb", "-U", "postgres", "smoke_restore"])
            with dump.open("rb") as source:
                run(compose + ["exec", "-T", "landing-db", "pg_restore", "--exit-on-error", "--no-owner", "--no-acl", "-U", "postgres", "-d", "smoke_restore"], stdin=source)
            restored = run(compose + ["exec", "-T", "landing-db", "psql", "-U", "postgres", "-d", "smoke_restore", "-Atc", "SELECT count(*) FROM pages"], capture_output=True, text=True).stdout.strip()
            assert before == restored
            print(f"PASS PostgreSQL backup/restore: {before} content records", flush=True)
            run(compose + ["exec", "-T", "landing-api", "python", "-c", "from pathlib import Path; Path('/srv/media/backup-check.txt').write_text('private smoke media')"])
            archive = directory / "media.tar.gz"
            with archive.open("wb") as output:
                run(DOCKER + ["run", "--rm", "--network", "none", "--read-only", "--cap-drop", "ALL", "--security-opt", "no-new-privileges:true", "--mount", "type=volume,src=" + model["volumes"]["landing_media"]["name"] + ",dst=/backup-media,readonly", "--entrypoint", "python", model["services"]["landing-api"]["image"], "-c", 'import sys,tarfile; t=tarfile.open(fileobj=sys.stdout.buffer,mode="w|gz"); t.add("/backup-media",arcname="media"); t.close()'], stdout=output)
            with tarfile.open(archive) as media:
                assert media.extractfile("media/backup-check.txt").read() == b"private smoke media"
            archive = directory / "tls.tar.gz"
            with archive.open("wb") as output:
                run(DOCKER + ["run", "--rm", "--network", "none", "--read-only", "--cap-drop", "ALL", "--security-opt", "no-new-privileges:true", "--mount", "type=volume,src=" + model["volumes"]["caddy_data"]["name"] + ",dst=/backup-tls,readonly", "--entrypoint", "tar", model["services"]["edge"]["image"], "-czf", "-", "-C", "/backup-tls", "."], stdout=output)
            with tarfile.open(archive) as tls:
                assert any(name.endswith("/authorities/local/root.crt") for name in tls.getnames())
            print("PASS media + TLS archives with read-only mounts and unprivileged users", flush=True)
            run(compose + ["down"], timeout=120)
            started = time.monotonic()
            run(compose + ["up", "-d", "--no-build", "--wait", "--wait-timeout", "240"])
            timings["recreated_services_ready_seconds"] = round(time.monotonic() - started, 2)
            after = run(compose + count_query, capture_output=True, text=True).stdout.strip()
            assert before == after
            print("PASS data persistence after complete container removal/recreation", flush=True)
            (work / "last-smoke-timings.json").write_text(json.dumps(timings, indent=2) + "\n")
            print("Readiness timings: " + json.dumps(timings), flush=True)
            print("SMOKE TEST PASSED (private local TLS CA; public ACME issuance requires the target server)", flush=True)
        finally:
            run(compose + ["down", "--volumes", "--remove-orphans"], timeout=120)


if __name__ == "__main__":
    main()
