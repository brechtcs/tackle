const request = require('request')

module.exports = function extern (tackle) {
  request('http://example.com', function(err, res, body) {
    tackle.write(body, '/index.html')
  })
}
