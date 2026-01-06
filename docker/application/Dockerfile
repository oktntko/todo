# -------- build stage (node) --------
FROM node:24.12.0-trixie AS build

RUN corepack enable

WORKDIR /@todo
COPY . .

ARG DATABASE_URL
RUN pnpm i && pnpm build

# 環境変数を nginx.conf に埋め込む
ARG EXPRESS_PORT
RUN apt-get update -y \
  && apt-get install -y gettext-base
COPY ./docker/application/nginx.conf ./nginx.conf.template
RUN envsubst '$$EXPRESS_PORT' < ./nginx.conf.template > ./nginx.conf

# 自己署名証明書
RUN mkdir certs \
  && openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout certs/dev.key \
    -out certs/dev.crt \
    -days 365 \
    -subj "/CN=localhost"

# # -------- runtime stage --------
FROM node:24.12.0-trixie-slim

RUN corepack enable

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
COPY --from=build /@todo/certs            /etc/nginx/certs
COPY --from=build /@todo/nginx.conf       /etc/nginx/nginx.conf
COPY --from=build /@todo/app/vue/dist     /usr/share/nginx/html

# # ---- app ----
WORKDIR /@todo
COPY --from=build /@todo/package.json /@todo/pnpm-lock.yaml /@todo/pnpm-workspace.yaml ./
COPY --from=build /@todo/app/express/package.json                                      ./app/express/
COPY --from=build /@todo/app/express/dist                                              ./app/express/dist
COPY --from=build /@todo/common/lib/package.json                                       ./common/lib/
COPY --from=build /@todo/common/lib/dist                                               ./common/lib/dist
COPY --from=build /@todo/common/prisma/package.json                                    ./common/prisma/
COPY --from=build /@todo/common/prisma/dist                                            ./common/prisma/dist

RUN pnpm i --production

# ---- non-root user ----
RUN useradd -r -u 1001 todo \
  && chown -R todo:todo \
    /@todo \
    /var/log/nginx \
    /var/lib/nginx \
    /etc/nginx/certs

USER todo

EXPOSE 5173

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["sh", "-c", "node --enable-source-maps app/express/dist/index.mjs & nginx -g 'daemon off;'"]
