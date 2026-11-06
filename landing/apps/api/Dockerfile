FROM python:3.13.16-slim-trixie@sha256:70729b46c69b4f1e97c4822c1af3df53a1476cf5ddc6c087c0c10bc3a5678c2f AS builder
COPY --from=ghcr.io/astral-sh/uv:0.13.0@sha256:cdc6093146eb3ff6a40107b38f008b789e050e77ad87865e381d9917da55a168 /uv /usr/local/bin/uv
WORKDIR /srv/api
ARG PYPI_MIRROR_URL=https://mirrors.aliyun.com/pypi
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=never \
    UV_HTTP_CONNECT_TIMEOUT=15 UV_HTTP_TIMEOUT=120 UV_HTTP_RETRIES=3 \
    UV_CONCURRENT_DOWNLOADS=4
COPY pyproject.toml uv.lock ./
COPY install_locked.py /usr/local/bin/makan-install-locked.py
RUN --mount=type=cache,id=makan-landing-uv,target=/root/.cache/uv,sharing=locked \
    python /usr/local/bin/makan-install-locked.py --mirror "$PYPI_MIRROR_URL" --no-install-project
COPY app ./app
RUN --mount=type=cache,id=makan-landing-uv,target=/root/.cache/uv,sharing=locked \
    python /usr/local/bin/makan-install-locked.py --mirror "$PYPI_MIRROR_URL"

FROM python:3.13.16-slim-trixie@sha256:70729b46c69b4f1e97c4822c1af3df53a1476cf5ddc6c087c0c10bc3a5678c2f AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PATH="/srv/api/.venv/bin:$PATH"
WORKDIR /srv/api
RUN apt-get -o Acquire::Retries=2 -o Acquire::http::Timeout=20 -o Acquire::https::Timeout=20 update --error-on=any \
    && apt-get -o Acquire::Retries=2 -o Acquire::http::Timeout=20 -o Acquire::https::Timeout=20 upgrade -y \
    && rm -rf /var/lib/apt/lists/* \
    && python -m pip uninstall -y pip
RUN groupadd --gid 10001 api && useradd --uid 10001 --gid api --no-create-home api
RUN mkdir -p /srv/media /srv/operations && chown 10001:10001 /srv/media /srv/operations
COPY --from=builder --chown=10001:10001 /srv/api/.venv ./.venv
COPY --chown=10001:10001 app ./app
COPY --chown=10001:10001 alembic ./alembic
COPY --chown=10001:10001 alembic.ini ./alembic.ini
USER 10001:10001
EXPOSE 8000
CMD ["uvicorn", "app.main:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000", "--no-access-log", "--no-proxy-headers"]
