const html = require('bel')

module.exports = function (input) {
  return html`<html>
    <body>
      <main>${input}</main>
      <script src="/client.js"></script
    </body>
  </html>`
}
