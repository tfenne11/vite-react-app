const { spawn } = require('child_process')
const path = require('path')

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: false, ...opts })
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} exited ${code}`))))
    p.on('error', reject)
  })
}

async function main() {
  try {
    const root = path.resolve(__dirname, '..')
    const server = path.resolve(root, 'server')

    console.log('Installing server dependencies...')
    await run('npm', ['install'], { cwd: server })

    console.log('Installing client dependencies...')
    await run('npm', ['install'], { cwd: root })

    console.log('Starting both server and client (dev:all)')
    // delegate to npm script dev:all which uses concurrently
    await run('npm', ['run', 'dev:all'], { cwd: root })
  } catch (err) {
    console.error('Bootstrap failed:', err.message)
    process.exit(1)
  }
}

main()
