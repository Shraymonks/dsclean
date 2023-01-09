#!/usr/bin/env node
import { writeSync } from 'node:fs';
import { logout } from './api.js';
import { deleteUnregisteredTasks, listUnregisteredTasks } from './task.js';

// Suppress fetch experimental warning
process.removeAllListeners('warning');

process.on('uncaughtException', (error) => {
  writeSync(process.stderr.fd, `${error.message}\n`);
  process.exit(1);
});

async function main() {
  await (process.argv[2] === '--delete'
    ? deleteUnregisteredTasks
    : listUnregisteredTasks)();
  logout();
}
main();
