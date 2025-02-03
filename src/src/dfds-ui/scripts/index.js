#!/usr/bin/env node
/* eslint-disable no-unused-vars */
/* eslint-disable no-fallthrough */
/* eslint-disable no-console */

const fs = require('fs')
const path = require('path')
const spawn = require('cross-spawn')
const chalk = require('chalk')
const deduplicate = require('yarn-deduplicate')

const { argv } = require('yargs')
  .scriptName('dfds-script')
  .usage('Usage: $0 <command> [options]')

  .command('babel', 'Runs babel', (yargs) => {
    yargs
      .option('out-dir', {
        type: 'string',
        default: 'dist',
        nargs: 1,
      })
      .option('only-lib-files', {
        type: 'boolean',
      })
      .option('ignore', {
        type: 'string',
      })
      .option('watch', {
        type: 'boolean',
      })
      .option('verbose', {
        type: 'boolean',
      })
      .option('env-name', {
        type: 'string',
        default: 'esm',
        nargs: 1,
      })
  })

  .command('prepare-package', 'Creates package.json and README.md files in dist')

  .command('upgrade-scope', 'Yarn upgrade packages with a specific scope to latest', (yargs) => {
    yargs.option('scope', {
      type: 'string',
      demandOption: true,
      nargs: 1,
    })
  })

  .command('yarn-deduplicate', 'Tool for deduplicating dependencies in yarn.lock', (yargs) => {
    yargs
      .option('check', {
        type: 'boolean',
      })
      .option('list', {
        type: 'boolean',
      })
      .option('fix', {
        type: 'boolean',
      })
      .conflicts({
        check: ['list', 'fix'],
        list: ['check', 'fix'],
        fix: ['check', 'list'],
      })
  })

  .option('silent', {
    description: 'Minimum log reporting',
    type: 'boolean',
  })
  .demandCommand(1, 1, 'You must provide a valid command')

const command = argv._[0]

const log = !argv.silent ? (message) => console.log(`${chalk.blue('[DFDS] ')}${message}`) : () => undefined
const error = (message) => console.log(`${chalk.red('error ')}${message}`)

log(`Running ${command} in: ${process.cwd()}`)

switch (command) {
  case 'babel': {
    // these are the ignore patterns when using the --onlyLibFiles option
    // Do notice that babel implements a very limiting pattern matching syntax
    // https://github.com/babel/babel/issues/12008
    const COMMON_IGNORE_PATTERNS = [
      'src/**/__tests__/*',
      'src/**/__mocks__/*',
      'src/**/*.stories.tsx',
      'src/**/*.story.tsx',
      'src/**/*.demo.tsx',
      'src/**/*.demo.ts',
    ]

    const srcDir = argv._[1] || './src'
    const outDir = argv.outDir || './dist'

    const predefinedArgs = [
      '--root-mode=upward',
      path.resolve(srcDir),
      '--out-dir',
      outDir,
      '--extensions',
      '.js,.jsx,.ts,.tsx',
    ]
    const restArgs = []

    // options passed directly to babel
    if (argv.watch) restArgs.push('--watch')
    if (argv.verbose) restArgs.push('--verbose')
    if (argv.envName) restArgs.push('--env-name', argv.envName)

    // matchPatterns for option ignore passed to babel
    const ignoreArgs = []
    const matchPatterns = argv.onlyLibFiles ? COMMON_IGNORE_PATTERNS : []

    // build ignore option
    if (argv.ignore || argv.onlyLibFiles) {
      ignoreArgs.push('--ignore')
      if (argv.ignore) {
        matchPatterns.push(...argv.ignore.split(','))
      }
      ignoreArgs.push(matchPatterns.join(','))
    }

    const babelCliPath = path.resolve(require.resolve('@babel/cli/bin/babel.js'))

    const result = spawn.sync(babelCliPath, [...predefinedArgs, ...ignoreArgs, ...restArgs], {
      stdio: 'pipe',
    })

    if (result.status !== 0) {
      throw result.stderr.toString()
    }
    log(`${result.stdout.toString()}`.trim())
    process.exit(result.status)
  }

  case 'prepare-package':
    {
      const packagePath = process.cwd()
      const distPath = path.join(packagePath, './dist')

      // if distPath doesn't exists create it
      if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath)
      }
      const originalPkg = JSON.parse(fs.readFileSync(path.resolve(packagePath, './package.json'), 'utf8'))
      const { publishConfig, files, scripts, devDependencies, ...pkgData } = originalPkg

      // we expect the original package.json to have "main", "module", "esnext" and "typings" entires pointing to
      // files within the "dist" folder. We want to remove "dist/" from these paths.
      // eg. ./dist/cjs/index.js => ./cjs/index.js
      const main = originalPkg.main ? originalPkg.main.replace('dist/', '') : ''
      const module = originalPkg.module ? originalPkg.module.replace('dist/', '') : ''
      const esnext = originalPkg.esnext ? originalPkg.esnext.replace('dist/', '') : ''
      const typings = originalPkg.typings ? originalPkg.typings.replace('dist/', '') : ''

      const newPkg = {
        ...pkgData,
        private: false,
        sideEffects: false,
        main: main,
        module: module,
        esnext: esnext,
        typings: typings,
      }

      if (originalPkg.publishConfig && originalPkg.publishConfig.access) {
        newPkg.publishConfig = { access: originalPkg.publishConfig.access || 'public' }
      }

      fs.writeFile(path.resolve(distPath, './package.json'), JSON.stringify(newPkg), 'utf8', function (err) {
        if (err) throw err
        log(`package.json was successfully saved to ${distPath}`)
      })

      const orgReadme = path.resolve(packagePath, './README.md')
      const newReadme = path.resolve(distPath, './README.md')
      if (fs.existsSync(orgReadme)) {
        fs.copyFile(orgReadme, newReadme, (err) => {
          if (err) throw err
          log(`README.md was successfully copied to ${distPath}`)
        })
      }
    }

    break
  case 'upgrade-scope': {
    upgradeScope(argv.scope)
    break
  }

  case 'yarn-deduplicate': {
    const lockFile = path.resolve(process.cwd(), './yarn.lock')
    const yarnlock = fs.readFileSync(lockFile, 'utf8')
    const duplicates = getDuplicates() || []

    if (argv.check) {
      if (duplicates.length) {
        error(`${duplicates.length} duplicated package(s) found.`)
        console.log(`Run ${chalk.yellowBright('dfds-script yarn-deduplicate --list')} to list duplicated packages`)
        console.log(`Run ${chalk.yellowBright('dfds-script yarn-deduplicate --fix')} to deduplicate packages`)
        process.exit(1)
      } else {
        log('No duplicated packages found')
      }
    }

    if (argv.list) {
      if (duplicates.length) {
        log(`${duplicates.length} duplicated package(s) found\n${duplicates.map((x) => `  ${x}`).join('\n')}`)
      } else {
        log('No duplicated packages found')
      }
    }

    if (argv.fix) {
      fs.writeFileSync(lockFile, deduplicate.fixDuplicates(yarnlock))

      const yarn = spawn.sync('yarn', {
        shell: true,
        stdio: 'inherit',
      })

      process.exit(yarn.result)
    }

    break
  }

  default: {
    throw new Error(`Unknown command: ${command}`)
  }
}

function getDuplicates() {
  const lockFile = path.resolve(process.cwd(), './yarn.lock')
  const yarnlock = fs.readFileSync(lockFile, 'utf8')
  return deduplicate.listDuplicates(yarnlock)
}

// yarn upgrade --latest --scope @/dfds-ui does not work correctly in workspaces (as of version 1.21.1)
// so this is here to upgrade all package in a scope
function upgradeScope(scope) {
  const run = (cmd) => {
    spawn.sync(cmd, {
      stdio: 'inherit',
      shell: true,
    })
  }

  if (!scope) {
    throw new Error('Please provide a scope to be upgraded')
  }
  if (!scope.startsWith('@')) {
    throw new Error('Incorrect scope format')
  }

  const pkg = JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf8'))

  const deps = Object.keys(pkg.dependencies).filter((dep) => dep.startsWith(`${scope}/`))
  if (deps.length) {
    run(`yarn add ${deps.map((d) => `${d}@latest`).join(' ')}`)
  }

  const devDeps = Object.keys(pkg.devDependencies).filter((dep) => dep.startsWith(`${scope}/`))
  if (devDeps.length) {
    run(`yarn add -D ${deps.map((d) => `${d}@latest`).join(' ')}`)
  }
}
