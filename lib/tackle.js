const fs = require('fs')
const path = require('path')
const xtend = require('xtend')
const msg = require('./msg')

function init (config) {
  let conf = load(config)
  let methods = {
    src: resolver(path.join(process.cwd(), 'src')),
    target: resolver(path.join(process.cwd(), 'target'))
  }

  if (conf.folders) {
    Object.keys(conf.folders).forEach(function (folder) {
      if (['stream', 'write', 'fail'].indexOf(folder) === -1) {
        methods[folder] = resolver(conf.folders[folder])
      }
      else {
        throw new Error(msg.illegalFolder(folder))
      }
    })

    delete conf.folders
  }

  return xtend(conf, methods)
}

function load (root) {
  if (!root) {
    root = process.cwd()
  }
  const file = path.join(root, 'package.json')

  if (fs.existsSync(file)) {
    const json = fs.readFileSync(file)
    const pack = JSON.parse(json)
    return pack.tackle ? pack.tackle : {}
  }
  else {
    throw new Error(msg.noConfig)
  }
}

function resolver (base) {
  base = path.resolve(base)

  return function (module) {
    if (module) {
      return path.join(base, module)
    }
    return base
  }
}

module.exports = init()
