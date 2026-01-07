# =========================================================
# Base args
# ---------------------------------------------------------
# Node / pnpm のバージョンを ARG にまとめることで：
# - Dockerfile 内での重複を避ける
# - 将来のアップデートを 1 箇所で済ませる
# - build cache の無駄な invalidation を防ぐ
# =========================================================
ARG NODE_TAG="24.12.0-trixie-slim"
ARG PNPM_VERSION="10.27.0"


# =========================================================
# envsubst stage
# ---------------------------------------------------------
# nginx.conf は runtime の環境変数（PORT など）に依存するが、
# runtime イメージに envsubst / gettext を入れたくない。
#
# → build 時に「設定ファイルだけ」生成し、
#    実行環境には最終成果物のみ持ち込む。
#
# これにより：
# - runtime イメージを最小化
# - 不要なツールを実行環境に残さない
# =========================================================
FROM debian:13.2-slim AS envsubst

ARG EXPRESS_PORT
RUN apt-get update -y \
  && apt-get install -y gettext-base

COPY ./docker/application/nginx.conf /envsubst/nginx.conf.template
RUN envsubst '$$EXPRESS_PORT' \
  < /envsubst/nginx.conf.template \
  > /envsubst/nginx.conf


# =========================================================
# certs stage
# ---------------------------------------------------------
# 開発用の自己署名証明書は：
# - git に含めたくない
# - 手動生成やスクリプト管理も避けたい
#
# → Docker build の一部として「一時的に」生成する。
#
# 生成物（証明書）だけを runtime に COPY し、
# openssl 自体は runtime には含めない。
#
# ※ 本番ではこの stage 自体を差し替える想定
# =========================================================
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


# =========================================================
# build stage
# ---------------------------------------------------------
# - pnpm workspace / turborepo 前提
# - devDependencies はビルドに必要
# - runtime には持ち込まない
#
# pnpm の思想：
# - install は lockfile ベースで再現性重視
# - store は共有キャッシュとして使う
#
# RUN --mount=type=cache のポイント：
# - イメージには含まれない
# - build 間で再利用される
# - sharing=locked により並列 build での破壊を防止
#
# → 「速い・安全・再現性あり」のビルドを実現
# =========================================================
FROM node:${NODE_TAG} AS build

RUN corepack enable pnpm
WORKDIR /@todo

# --- 依存解決レイヤー（キャッシュ最重要） ---
# ソースコードより先に package.json / lockfile のみ COPY することで、
# 依存関係が変わらない限り pnpm install がキャッシュヒットする
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./turbo.json ./
COPY ./app/vue/package.json                                             ./app/vue/
COPY ./app/express/package.json                                         ./app/express/
COPY ./common/lib/package.json                                          ./common/lib/
COPY ./common/prisma/package.json                                       ./common/prisma/

RUN --mount=type=cache,sharing=locked,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# --- 実装コード ---
COPY ./script   ./script
COPY ./app      ./app
COPY ./common   ./common

# turborepo のキャッシュも cache mount で共有
ARG DATABASE_URL
RUN --mount=type=cache,sharing=locked,target=/.turbo \
    pnpm build

# pnpm deploy:
# - devDependencies を除外
# - workspace 依存を含めた「実行可能な最小構成」を生成
# - runtime では pnpm install を実行しない
COPY ./docker/application/.npmrc ./
RUN pnpm --filter @todo/express --prod deploy /@todo/deploy


# =========================================================
# runtime stage
# ---------------------------------------------------------
# 実行環境：
# - Node
# - nginx（SPA 配信 + reverse proxy）
# - tini（PID 1 問題対策）
#
# ビルドツール / pnpm / openssl / gettext は一切含めない
# =========================================================
FROM node:${NODE_TAG}

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends \
    nginx \
    tini \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# --- nginx 設定と証明書（成果物のみ） ---
COPY --from=certs    /certs               /etc/nginx/certs
COPY --from=envsubst /envsubst/nginx.conf /etc/nginx/nginx.conf

WORKDIR /@todo

# --- non-root 実行 ---
# nginx / node 両方を非 root で動かす
RUN useradd -r -u 1001 todo \
  && chown -R todo:todo \
    /@todo \
    /var/log/nginx \
    /var/lib/nginx \
    /etc/nginx/certs

# --- アプリ成果物 ---
COPY --from=build /@todo/app/vue/dist /usr/share/nginx/html
COPY --from=build /@todo/deploy       /@todo

USER todo

EXPOSE 5173

# tini で node + nginx を正しく supervise
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["sh", "-c", "node --enable-source-maps dist/index.mjs & nginx -g 'daemon off;'"]
