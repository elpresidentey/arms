/**
 * Complete cleanup script: Supabase Postgres + Supabase Auth.
 *
 * Usage: node cleanup-all.js
 */

const { spawn } = require('node:child_process');
const path = require('node:path');

const runScript = (script) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, script)], {
      cwd: __dirname,
      stdio: 'inherit',
      env: process.env,
    });

    child.on('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`${script} exited with signal ${signal}`));
        return;
      }

      if (code !== 0) {
        reject(new Error(`${script} exited with code ${code}`));
        return;
      }

      resolve();
    });
  });

async function cleanupAll() {
  console.log('ARMS complete cleanup: Supabase Postgres + Supabase Auth');
  await runScript('cleanup-postgres.js');
  await runScript('cleanup-supabase-auth.js');
  console.log('Complete cleanup finished.');
}

cleanupAll().catch((error) => {
  console.error('Cleanup failed:', error.message);
  process.exit(1);
});
