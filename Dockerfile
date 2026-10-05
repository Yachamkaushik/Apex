# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1 — build: install dependencies, type-check, and produce the static
# bundle. Nothing from this stage except /app/dist reaches the final image.
# ---------------------------------------------------------------------------
FROM node:24-alpine AS build
WORKDIR /app

# Manifests first, so the (slow) dependency layer is only rebuilt when
# package.json / package-lock.json actually change.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2 — runtime: nginx serving the static bundle, running as a non-root
# user (the "unprivileged" image listens on 8080 instead of 80).
# ---------------------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime

# Have the image's entrypoint read the container's DNS servers into
# $NGINX_LOCAL_RESOLVERS, which the nginx template below uses so the /api/f1
# proxy keeps re-resolving the upstream hostname instead of pinning one IP.
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1

# Files in /etc/nginx/templates/*.template are run through envsubst on start
# and written to /etc/nginx/conf.d/ (replacing the stock default.conf).
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/healthz || exit 1
