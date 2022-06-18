#!/usr/bin/env zx

import { cwd } from "process";

const currentdir = cwd();

// docker-compose で使うネットワークを作る
await $`docker network create todo-network || true`;

// todo-express のセットアップを行う
cd(`todo-express`);
await $`cp .env.example .env`;
await $`docker-compose up -d`; // database コンテナを起動する
await $`npm i -f`;
await $`npm run db`;
await $`npm run build`;

// webserver コンテナ内に持っていくファイル類をコピーする
const copyFiles = [`dist`, `prisma`, `ecosystem.config.js`, `package.json`, `package-lock.json`];
await $`cp -rf ${copyFiles} ../.docker/webserver`;

// 戻る
cd(currentdir);

// todo-react のセットアップを行う
cd(`todo-react`);
await $`npm i`;
await $`npm run build`;
// frontend は docker-compose でバインドしているのでコピーしなくていい

// 戻る
cd(currentdir);
await $`cp .env.example .env`;
await $`docker-compose up -d --build`; // webserver コンテナを起動する
