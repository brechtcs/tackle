#!/usr/bin/node

const del = require('del')
const freeze = require('deep-freeze-node')
const fs = require('fs')
const mkdir = require('mkdirp')
const path = require('path')
const xtend = require('xtend')

const msg = require('./lib/msg')
const tackle = require('./lib/tackle')

function clean (dir) {
  msg.info(msg.cleanFolder(dir))
  return del([dir + '/**'])
}

function walk (dir) {
  fs.readdirSync(dir).forEach(function (name) {
    const entry = path.join(dir, name)

    if (fs.statSync(entry).isDirectory()) {
      walk(entry)
    }
    else {
      const target = entry.replace(tackle.src(), tackle.target())

      try {
        const make = require(entry)
        const methods = {
          stream: stream(target),
          write: write(target),
          fail: fail(target)
        }

        msg.info(msg.parseJs(entry))
        make(freeze(xtend(tackle, methods)))
      }
      catch (e) {
        if (/\.js$/.test(entry)) {
          throw new Error(e)
        }
        else {
          msg.info(msg.fileCopy(entry))

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
      msg.err(msg.fileError(target, e.toString))
    }).on('close', function () {
      msg.info(msg.fileDone(target))
    })
  }
}

function write (file) {
  return function (content, name) {
    let target = rename(file, name)
    mkdir.sync(path.dirname(target))

    fs.writeFile(target, content, function (e) {
      if (e) {
        msg.err(msg.fileError(target, e.toString()))
      }
      msg.info(msg.fileDone(target))
    })
  }
}

function rename (file, name) {
  return name ? file.replace(/\.js$/, name) : file
}

function fail (file) {
  return function (e, name) {
    msg.err(msg.fileError(rename(file, name), e.toString()))
  }
}

clean(tackle.target()).then(() => walk(tackle.src()))
