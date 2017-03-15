#!/usr/bin/node

const del = require('del')
const fs = require('fs')
const mkdir = require('mkdirp')
const path = require('path')
const xtend = require('xtend')

const msg = {
  cleanFolder: (content) => "cleaning " + content,
  fileDone: (content) => "done " + content,
  fileError: (content) => "failed " + content,
  noConfig: "Couldn't find `tackle.json` config file",
  parseJs: (content) => "parsing " + content
}

const tackle = {}
tackle.conf = config()
tackle.etc = (file) => path.join(tackle.conf.etc, file)
tackle.lib = (file) => path.join(tackle.conf.lib, file)

function config (file) {
  let conf = {}

  if (!file) {
    file = path.join(process.cwd(), 'tackle.json')
  }
  if (fs.existsSync(file)) {
    const json = fs.readFileSync(file)
    conf = JSON.parse(json)
  }
  else {
    throw new Error(msg.noConfig)
  }

  return xtend({
    etc: path.join(process.cwd(), 'etc'),
    lib: path.join(process.cwd(), 'lib'),
    src: path.join(process.cwd(), 'src'),
    web: path.join(process.cwd(), 'web')
  }, conf)
}

function clean (dir) {
  console.info(msg.cleanFolder(dir))
  return del([dir + '/**'])
}

function walk (dir) {
  fs.readdirSync(dir).forEach(function (name) {
    const entry = path.join(dir, name)

    if (fs.statSync(entry).isDirectory()) {
      walk(entry)
    }
    else {
      const target = entry.replace(tackle.conf.src, tackle.conf.web)

      try {
        const make = require(entry)
        const methods = {
          stream: stream(target),
          write: write(target),
          fail: fail(target)
        }

        console.info(msg.parseJs(entry))
        make(xtend(tackle, methods))
      }
      catch (e) {
        if (/\.js$/.test(entry)) {
          console.error(msg.fileError(`${target} (${e.toString()})`))
        }
        else {
          console.info('copying ' + entry)

          const source = fs.createReadStream(entry)
          const dest = stream(target)(null)
          source.pipe(dest)
        }
      }
    }
  })
}

function stream (file) {
  return function (name) {
    let target = rename(file, name)
    mkdir.sync(path.dirname(target))

    return fs.createWriteStream(target).on('error', function (e) {
      console.error(msg.fileError(`${target} (${e.toString()})`))
    }).on('close', function () {
      console.info(msg.fileDone(target))
    })
  }
}

function write (file) {
  return function (content, name) {
    let target = rename(file, name)
    mkdir.sync(path.dirname(target))

    fs.writeFile(target, content, function (e) {
      if (e) {
        console.error(msg.fileError(`${target} (${e.toString()})`))
      }
      console.info(msg.fileDone(target))
    })
  }
}

function rename (file, name) {
  return name ? file.replace(/\.js$/, name) : file
}

function fail (file) {
  return function (e, name) {
    console.error(msg.fileError(`${target} (${e.toString()})`))
  }
}

clean(tackle.conf.web).then(() => walk(tackle.conf.src))
