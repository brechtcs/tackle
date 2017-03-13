const html = require('bel')

module.exports = function index (tackle) {
  const base = tackle.lib('base')

  const page = html`<main>
    Hello deeply nested world!
  </main>`

  tackle.web(base(page).toString(), '.html')
}