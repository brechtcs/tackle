const request = require('request')

module.exports = function extern (tackle) {
  request('http://source.nope', function(err, res, body) {
    if (err) {
      tackle.fail(err, '/index.html')
    }
    tackle.write(body, '/index.html')
  })
}
