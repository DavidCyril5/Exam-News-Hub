pnpm install && PORT=3000 BASE_PATH=/ pnpm --filter @workspace/examcore-pulse run build && pnpm --filter @workspace/api-server run build
node --enable-source-maps artifacts/api-server/dist/index.mjs
