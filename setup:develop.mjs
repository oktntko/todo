#!/usr/bin/env zx

import { cwd } from "process";

const currentdir = cwd();

// docker-compose で使うネットワークを作る
await $`docker network create todo-network || true`;

// todo-express のセットアップを行う
cd(`todo-express`);
await $`docker-compose up -d`; // database コンテナを起動する
await $`npm i -f`;
await $`npm run db`;
await $`npm run test:db`; // unittest 用のデータベース

// 戻る
cd(currentdir);

// todo-react のセットアップを行う
cd(`todo-react`);
await $`npm i`;
