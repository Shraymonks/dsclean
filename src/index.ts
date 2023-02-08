#!/usr/bin/env node
import { writeSync } from 'node:fs';
import { logout, spinner } from './api.js';
import { deleteUnregisteredTasks, listUnregisteredTasks } from './task.js';

process.on('uncaughtException', (error) => {
  spinner.stop();
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
