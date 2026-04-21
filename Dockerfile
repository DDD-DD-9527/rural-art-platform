FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html

RUN mkdir -p /docker-entrypoint.d \
  && cat > /docker-entrypoint.d/20-generate-conf.sh <<'EOF' \
  && chmod +x /docker-entrypoint.d/20-generate-conf.sh
#!/bin/sh
set -eu

API_UPSTREAM="${API_UPSTREAM:-}"

if [ -z "$API_UPSTREAM" ]; then
  echo "[WARN] API_UPSTREAM is not set; /api/* will return 502" >&2
fi

cat > /etc/nginx/conf.d/default.conf <<CONF
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location /api/ {
    proxy_intercept_errors on;
    error_page 404 = @api_no_prefix;
    $( [ -n "$API_UPSTREAM" ] && echo "proxy_pass $API_UPSTREAM;" || echo "return 502;" )
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location @api_no_prefix {
    rewrite ^/api/(.*)\$ /\$1 break;
    $( [ -n "$API_UPSTREAM" ] && echo "proxy_pass $API_UPSTREAM;" || echo "return 502;" )
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location / {
    try_files \$uri \$uri/ /index.html;
  }
}
CONF

nginx -t
EOF

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
