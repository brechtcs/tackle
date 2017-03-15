const html = require('bel')
const div = html`<div>Browserified!</div>`

setTimeout(function() {
  document.body.appendChild(div)
}, 2000)
