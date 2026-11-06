#!/bin/sh
# Keep Debian's suites, components and signing keys; change only the download host.
set -eu

mirror=${1:-https://mirrors.aliyun.com}
sources=${2:-/etc/apt/sources.list.d/debian.sources}
mirror=${mirror%/}
case "$mirror" in
  https://mirrors.aliyun.com|https://deb.debian.org|https://mirrors.tuna.tsinghua.edu.cn|https://mirrors.ustc.edu.cn) ;;
  *)
    echo 'Unsupported Debian mirror. Use an HTTPS origin listed in DEPLOYMENT.fa.md.' >&2
    exit 64 ;;
esac

temporary=$(mktemp "${sources}.XXXXXX")
trap 'rm -f -- "$temporary"' 0
trap 'exit 130' INT
trap 'exit 143' TERM
if ! awk -v mirror="$mirror" '
  /^URIs:/ {
    if ($0 !~ /^URIs: https?:\/\/(deb\.debian\.org|security\.debian\.org|mirrors\.aliyun\.com|mirrors\.tuna\.tsinghua\.edu\.cn|mirrors\.ustc\.edu\.cn)\/debian(-security)?\/?$/) {
      invalid = 1
      exit
    }
    if ($0 ~ /\/debian-security\/?$/) security++; else main++
    sub(/https?:\/\/[^/]+/, mirror)
  }
  { print }
  END { if (invalid || main != 1 || security != 1) exit 1 }
' "$sources" > "$temporary"; then
  echo 'Unexpected Debian sources; refusing to replace repository settings.' >&2
  exit 65
fi
chmod 0644 "$temporary"
mv -- "$temporary" "$sources"
printf 'Debian packages: %s (original suites and signing keys retained)\n' "$mirror"
