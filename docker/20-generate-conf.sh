#!/bin/sh
set -eu

API_UPSTREAM="${API_UPSTREAM:-}"
RUNTIME_API_BASE_URL="${API_BASE_URL:-/api}"

case "$RUNTIME_API_BASE_URL" in
  *[\"\'\;\{\}]*|*' '*|*'	'*)
    echo "[ERROR] API_BASE_URL contains invalid characters" >&2
    exit 1
    ;;
esac

case "$API_UPSTREAM" in
  *[\"\'\;\{\}]*|*' '*|*'	'*)
    echo "[ERROR] API_UPSTREAM contains invalid characters" >&2
    exit 1
    ;;
esac

if [ -z "$API_UPSTREAM" ]; then
  echo "[WARN] API_UPSTREAM is not set; /api/* will return 502" >&2
  API_LOCATION="return 502;"
else
  API_LOCATION="proxy_pass $API_UPSTREAM;"
fi

cat > /usr/share/nginx/html/runtime-config.js <<CONFJS
window.__APP_CONFIG__ = {
  apiBaseUrl: "${RUNTIME_API_BASE_URL}"
};
CONFJS

cat > /etc/nginx/conf.d/default.conf <<CONF
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location /api/ {
    $API_LOCATION
    proxy_http_version 1.1;
    proxy_ssl_server_name on;
    proxy_set_header Host \$proxy_host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location / {
    try_files \$uri \$uri/ /index.html;
  }
}
CONF

nginx -t
