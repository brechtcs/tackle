const html = require('bel')

module.exports = function multiple (tackle) {
  const base = tackle.lib('base')
  const posts = tackle.etc('posts.json')

  JSON.parse(posts).forEach(function (post, number) {
    const page = html`<main>
      ${post}
    </main>`

    tackle.web(base(page).toString(), `/${number}/index.html`)
  })
}
