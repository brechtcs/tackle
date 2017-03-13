#!/usr/bin/node

const fs = require('fs')
const mkdir = require('mkdirp')
const path = require('path')
const xtend = require('xtend')

const config = conf()
const tackle = {}

tackle.etc = function (file) {
  try {
    return fs.readFileSync(path.join(config.etc, file))
  }
  catch (e) {
    throw new Error(e)
  }
}

tackle.lib = function (module) {
  try {
    return require(path.join(config.lib, module))
  }
  catch (e) {
    throw new Error(e)
  }
}

function conf (file) {
  let json = {}

  if (!file) {
    file = path.join(process.cwd(), 'tackle.json')
  }
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file)
    json = JSON.parse(content)
  }

  return {
    etc: json.etc || path.join(process.cwd(), 'etc'),
    lib: json.lib || path.join(process.cwd(), 'lib'),
    src: json.src || path.join(process.cwd(), 'src'),
    web: json.web || path.join(process.cwd(), 'web')
  }
}

function walk (dir) {
  fs.readdirSync(dir).forEach(function (name) {
    const module = path.join(dir, name)

    if (fs.statSync(module).isDirectory()) {
      walk(module)
    }
    else {
      const make = require(module)
      const target = module.replace(config.src, config.web)
      const ctx = {web: write(target)}

      make(xtend(tackle, ctx))
    }
  })
}

function write (file) {
  return function (content, name) {
    let target =  name ? file.replace(/\.js$/, name) : file
    mkdir.sync(path.dirname(target))

    fs.writeFile(target, content, function (err) {
      if (err) {
        console.error('failure ' + target)
      }
      console.info('success ' + target)
    })
  }
}

walk(config.src)
