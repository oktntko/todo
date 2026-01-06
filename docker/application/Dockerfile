# -------- base args --------
ARG NODE_TAG="24.12.0-trixie-slim"
ARG PNPM_VERSION="10.27.0"

# -------- envsubst stage --------
FROM debian:13.2-slim AS envsubst

# 環境変数を nginx.conf に埋め込む
ARG EXPRESS_PORT
RUN apt-get update -y \
  && apt-get install -y gettext-base
COPY ./docker/application/nginx.conf /envsubst/nginx.conf.template
RUN envsubst '$$EXPRESS_PORT' < /envsubst/nginx.conf.template > /envsubst/nginx.conf

# -------- certs stage --------
FROM debian:13.2-slim AS certs
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir /certs \
  && openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout /certs/dev.key \
    -out /certs/dev.crt \
    -days 365 \
    -subj "/CN=localhost"

# -------- build stage (node) --------
FROM node:${NODE_TAG} AS build

RUN corepack enable pnpm

WORKDIR /@todo

COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./turbo.json ./
COPY ./app/vue/package.json                                             ./app/vue/
COPY ./app/express/package.json                                         ./app/express/
COPY ./common/lib/package.json                                          ./common/lib/
COPY ./common/prisma/package.json                                       ./common/prisma/
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY ./script   ./script
COPY ./app      ./app
COPY ./common   ./common

ARG DATABASE_URL
RUN --mount=type=cache,target=/.turbo \
    pnpm build

COPY ./docker/application/.npmrc ./
RUN pnpm --filter @todo/express --prod deploy /@todo/deploy

# # -------- runtime stage --------
FROM node:${NODE_TAG}

RUN corepack enable pnpm

RUN apt-get update -y \
  # slim を活かして余計な依存を入れない
  && apt-get install -y --no-install-recommends \ 
    nginx \
    #
    tini \
    # HTTPS upstream / proxy / curl 等を使う場合にほぼ必須
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# # nginx
COPY --from=certs    /certs                  /etc/nginx/certs
COPY --from=envsubst /envsubst/nginx.conf    /etc/nginx/nginx.conf

WORKDIR /@todo

# ---- non-root user ----
RUN useradd -r -u 1001 todo \
  && chown -R todo:todo \
    /@todo \
    /var/log/nginx \
    /var/lib/nginx \
    /etc/nginx/certs

# # ---- app ----
COPY --from=build /@todo/app/vue/dist       /usr/share/nginx/html
COPY --from=build /@todo/deploy             /@todo

USER todo

EXPOSE 5173

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["sh", "-c", "node --enable-source-maps dist/index.mjs & nginx -g 'daemon off;'"]
