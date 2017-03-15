#!/usr/bin/node

const fs = require('fs')
const mkdir = require('mkdirp')
const path = require('path')
const xtend = require('xtend')

const tackle = {}

tackle.conf = conf()

tackle.etc = function (file) {
  try {
    return fs.readFileSync(path.join(tackle.conf.etc, file))
  }
  catch (e) {
    throw new Error(e)
  }
}

tackle.lib = function (module) {
  try {
    return require(path.join(tackle.conf.lib, module))
  }
  catch (e) {
    throw new Error(e)
  }
}

function conf (file) {
  let config = {}

  if (!file) {
    file = path.join(process.cwd(), 'tackle.json')
  }
  if (fs.existsSync(file)) {
    const json = fs.readFileSync(file)
    config = JSON.parse(json)
  }

  return xtend({
    etc: path.join(process.cwd(), 'etc'),
    lib: path.join(process.cwd(), 'lib'),
    src: path.join(process.cwd(), 'src'),
    web: path.join(process.cwd(), 'web')
  }, config)
}

function walk (dir) {
  fs.readdirSync(dir).forEach(function (name) {
    const entry = path.join(dir, name)

    if (fs.statSync(entry).isDirectory()) {
      walk(entry)
    }
    else {
      try {
        const make = require(entry)
        const target = entry.replace(tackle.conf.src, tackle.conf.web)
        const methods = {
          stream: stream(target),
          write: write(target),
          fail: fail(target)
        }

        make(xtend(tackle, methods))
      }
      catch (e) {
        const target = entry.replace(tackle.conf.src, tackle.conf.web)
        const source = fs.createReadStream(entry)
        const dest = stream(target)(null)

        source.pipe(dest)
      }
    }
  })
}

function stream (file) {
  return function (name) {
    let target = rename(file, name)
    mkdir.sync(path.dirname(target))

    return fs.createWriteStream(target).on('error', function (err) {
      console.error('failure ' + target)
      //TODO: verbose option
    }).on('close', function () {
      console.info('success ' + target)
    })
  }
}

function write (file) {
  return function (content, name) {
    let target = rename(file, name)
    mkdir.sync(path.dirname(target))

    fs.writeFile(target, content, function (err) {
      if (err) {
        console.error('failure ' + target)
        //TODO: verbose option
      }
      console.info('success ' + target)
    })
  }
}

function fail (file) {
  return function (err, name) {
    console.error('failure ' + rename(file, name))
    //TODO: verbose option
  }
}

function rename (file, name) {
  return name ? file.replace(/\.js$/, name) : file
}

walk(tackle.conf.src)
