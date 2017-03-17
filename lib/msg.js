module.exports = {
  cleanFolder: (path) => "remove " + pretty(path),
  fileCopy: (path) => "copy " + pretty(path),
  fileDone: (path) => "success " + pretty(path),
  fileError: (path, err) => "error " + pretty(path) + ' (' + err + ')',
  illegalFolder: (content) => 'Folder name not allowed: ' + content,
  noConfig: (content) => "Couldn't find config at" + content,
  parseJs: (path) => "parse " + pretty(path)
}

module.exports.info = function info (msg) {
  console.info(msg)
}

module.exports.err = function err (msg) {
  console.error(msg)
}

function pretty (path) {
  return path.replace(process.cwd(), '.')
}
