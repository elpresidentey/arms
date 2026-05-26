import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

const root = resolve(process.cwd())
const backendCwd = resolve(root, 'backend')
const frontendCwd = resolve(root, 'frontend')

const children = []

const startProcess = (name, args, cwd) => {
  const child = spawn('cmd.exe', ['/d', '/c', ['npm.cmd', ...args].join(' ')], {
    cwd,
    stdio: 'inherit',
    env: process.env,
    windowsHide: false,
  })

  child.on('exit', (code, signal) => {
    if (signal || code !== 0) {
      for (const other of children) {
        if (other !== child && !other.killed) {
          other.kill()
        }
      }
      if (signal) {
        process.exitCode = 1
      } else {
        process.exitCode = code ?? 1
      }
    }
  })

  children.push(child)
  console.log(`[dev] started ${name}`)
  return child
}

startProcess('backend', ['run', 'start:dev'], backendCwd)
startProcess('frontend', ['run', 'dev'], frontendCwd)

process.on('SIGINT', () => {
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGINT')
    }
  }
  process.exit(0)
})

process.on('SIGTERM', () => {
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM')
    }
  }
  process.exit(0)
})
