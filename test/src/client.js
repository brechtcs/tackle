const browserify = require('browserify')

module.exports = function (tackle) {
  const entry = tackle.lib('client.js')
  const bs = browserify(entry)
  bs.bundle().pipe(tackle.stream())
}
