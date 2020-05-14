const path = require('path')
const globby = require('globby')
const nodeResolve = require('@rollup/plugin-node-resolve')
const postCss = require('rollup-plugin-postcss')

const CORE_PKG_DIR = 'packages/core'
const BUNDLE_DIRS = [ // TODO: use glob!
  'packages/bundle',
  'packages-premium/bundle'
]


module.exports = [
  ...BUNDLE_DIRS.map(bundleMainConfig),
  localeAllConfig(),
  ...localEachConfigs()
]


function bundleMainConfig(bundleDir) {
  return {
    input: path.join(bundleDir, 'tsc/main.js'),
    output: {
      format: 'iife',
      name: 'FullCalendar',
      dir: path.join(bundleDir, 'dist')
    },
    plugins: [
      nodeResolve(),
      postCss({
        extract: true // to separate file
      })
    ],
    watch: {
      // chokidar: {
      //   awaitWriteFinish: true, // has good defaults
      // },
      // buildDelay: 1000, // doesn't work in rollup v1
      clearScreen: false // because tsc does it
    }
  }
}


function localeAllConfig() {
  return {
    input: path.join(CORE_PKG_DIR, 'locales-all.js'),
    output: BUNDLE_DIRS.map((bundleDir) => ({
      format: 'iife',
      name: 'FullCalendar',
      dir: bundleDir
    })),
    plugins: [
      localeAllWrap()
    ]
  }
}


function localEachConfigs() {
  return globby.sync('locales/*.js', { cwd: CORE_PKG_DIR }).map((localeFile) => ({
    input: path.join(CORE_PKG_DIR, localeFile),
    output: BUNDLE_DIRS.map((bundleDir) => ({
      format: 'iife',
      name: 'FullCalendar',
      dir: bundleDir,
      entryFileNames: localeFile
    })),
    plugins: [
      localeEachWrap()
    ]
  }))
}


function localeAllWrap() {
  return {
    renderChunk(code) {
      return code.replace(/^var FullCalendar = /, 'FullCalendar.globalLocales = ')
    }
  }
}


function localeEachWrap() {
  return {
    renderChunk(code) {
      return code.replace(/^var FullCalendar = /, 'FullCalendar.globalLocales.push')
    }
  }
}