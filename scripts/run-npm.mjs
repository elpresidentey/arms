import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
const [, , workspace, ...npmArgs] = process.argv

if (!workspace || npmArgs.length === 0) {
  console.error('Usage: node scripts/run-npm.mjs <workspace> <npm args...>')
  process.exit(1)
}

const env = { ...process.env }

if (process.platform === 'win32' && env.Path && env.PATH) {
  delete env.PATH
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const child = spawn(npmCommand, npmArgs, {
  cwd: resolve(process.cwd(), workspace),
  stdio: 'inherit',
  env,
  windowsHide: true,
  shell: process.platform === 'win32',
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.exitCode = 1
    return
  }

  process.exitCode = code ?? 1
})
