import process from 'node:process';
import { listen } from '~/app';
const server = listen();

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
