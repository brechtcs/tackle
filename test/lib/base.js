const html = require('bel')

module.exports = function (input) {
  return html`<html>
    <body>${input}</body>
  </html>`
}
