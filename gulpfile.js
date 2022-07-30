const assert = require('assert')
const { createHash } = require('crypto')
const fetch = require('isomorphic-fetch')
const { createWriteStream, createReadStream, existsSync } = require('fs')
const { parse, join } = require('path')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const { spawn } = require('child_process')
const gulp = require('gulp')

/**
 * @file Gulpfile
 * @description AberothHotkeys build script
 * @author ashnel3
 * @license GPL-3.0
 */

/**
 * @typedef {Object} AhkRequirement - Required AHK library
 * @property {string} name          - Library name
 * @property {string} [checksum]    - SHA1 checksum
 * @property {string} url           - Git Repo url
 */

// Assert platform
assert(process.platform === 'win32', 'Windows 7+ is required!')

// Load env
require('dotenv').config()

const cwd = process.cwd()
const root = parse(cwd).root

const input = './src'
const output = './build'
const lib = './lib'

const ahk = process.env.AHK ?? join(root, 'Program Files/AutoHotkey/AutoHotkey.exe')
const ahk2exe = process.env.AHK2EXE ?? join(root, 'Program Files/AutoHotkey/Compiler/Ahk2Exe.exe')
const iscc = process.env.ISCC ?? join(root, 'Program Files')

/**
 * Required libraries
 * @type {AhkRequirement[]}
 */
const requirements = [
  {
    name: 'Neutron',
    url: 'https://github.com/G33kDude/Neutron.ahk/archive/a1ec4de705b1cc6d73519169d15545b0fe5f3600.zip',
    checksum: '4f85cedcdc34ded9232e3e3b55a5656c07506c0d',
  },
  {
    name: 'cJson',
    url: 'https://github.com/G33kDude/cJson.ahk/archive/18f5a3958af0acc74bc495fcffa21f8947059bfc.zip',
    checksum: 'a1399f91a9485ae73a29a782dbdb9731232a86c2',
  },
  {
    name: 'Yunit',
    url: 'https://github.com/Uberi/Yunit/archive/2354be7adbe3de5cd9f98c4a767d9e6389769ff5.zip',
    checksum: '2017cd7ec3e1178ce57263b97610766180ba0b70',
  },
]

/**
 * Download file
 * @param {string} url  - File url
 * @param {string} dir  - File directory
 * @return {Promise<string>} - File path
 */
const fetchFile = async (url, dir) => {
  const path = join(dir, url.split('/').pop())
  const res = await fetch(url, { headers: { accept: 'application/zip' }, method: 'GET' })
  const stream = createWriteStream(path)
  return await new Promise((resolve, reject) => {
    res.body.pipe(stream)
    res.body.on('error', reject).on('finish', () => resolve(path))
  })
}

/**
 * Rimraf promise
 * @param {string} path - File path
 * @returns {Promise<void>}
 */
const rimrafp = async (path) => {
  return await new Promise((resolve, reject) => {
    rimraf(path, (err) => {
      if (err !== null) reject(err)
      resolve()
    })
  })
}

/**
 * Sha1sum file
 * @param {string} path       - File path
 * @returns {Promise<string>} - File hash
 */
const sha1 = async (path) => {
  return await new Promise((resolve, reject) => {
    const stream = createReadStream(path)
    const shasum = createHash('sha1')
    stream
      .on('data', (chunk) => shasum.update(chunk))
      .on('close', () => resolve(shasum.digest('hex')))
      .on('error', reject)
    stream.pipe(shasum)
  })
}

gulp.task('start', (cb) => {
  spawn(ahk, ['Aberoth.ahk'], {
    cwd: join(cwd, output),
    detached: true,
    stdio: 'ignore',
  }).unref()
  cb()
})

gulp.task('kill', (cb) => {
  spawn('powershell.exe', ['Get-Process', 'AutoHotkey*', '|', 'Stop-Process'], {
    cwd,
    stdio: 'ignore',
  }).on('close', () => cb())
})

gulp.task('clean:out', () => rimrafp(output))

gulp.task('clean:lib', () => rimrafp(lib))

gulp.task('clean:logs', () => rimrafp('./docs'))

gulp.task('build:copy', () => {
  return gulp
    .src(['assets/**/*', 'config/*', '**/*.ahk'], { cwd: input, cwdbase: true })
    .pipe(gulp.dest(output))
})

gulp.task('build:webapp', (cb) => {
  const webpack = require('webpack')
  const config = require(join(cwd, 'webpack.config.js'))
  webpack(config, (err, stats) => {
    console.log(stats.toString({ colors: true }))
    if (err !== null || stats.hasErrors()) {
      return cb(new Error(err.message || err))
    }
    cb()
  })
})

gulp.task('build:ahk2exe', (cb) => {
  spawn(
    ahk2exe,
    ['/in', 'Aberoth.ahk', '/out', 'AberothHotkeys.exe', '/icon', 'assets\\favicon.ico'],
    {
      cwd: output,
    },
  ).on('close', () => cb())
})

gulp.task('build:installer', (cb) => {
  // TODO: InnoSetup installer
  cb()
})

gulp.task('clean', gulp.parallel('clean:out', 'clean:logs'))

gulp.task('build', gulp.parallel('build:webapp', 'build:copy'))

gulp.task(
  'release',
  gulp.series(gulp.parallel('build:webapp', 'build:copy'), 'build:ahk2exe', 'build:installer'),
)

gulp.task('dev', () => {
  return gulp.watch('**/*', { cwd: input, ignoreInitial: false }, gulp.series('kill', 'build', 'start'))
})

gulp.task('install', async () => {
  await mkdirp(lib)
  const decompress = require('decompress')
  console.log('Installing dependencies...')
  for (const req of requirements) {
    const libPath = join(lib, req.name)
    if (!existsSync(libPath)) {
      console.log(`  - Installing: ${req.name}`)
      const archive = await fetchFile(req.url, lib)
      assert(
        (await sha1(archive)) === req.checksum,
        `Warning, dependency ${req.name} failed checksum! "${archive}"`,
      )
      await decompress(archive, libPath, { strip: 1 })
      await rimrafp(archive)
    } else {
      console.log(`  - Skipped: ${req.name}`)
    }
  }
})
