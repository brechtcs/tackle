const fs = require('fs')
const html = require('bel')

module.exports = function multiple (tackle) {
  const base = require(tackle.lib('base'))

  fs.readFile(tackle.etc('posts.json'), function(e, posts) {
    if (e) {
      tackle.fail(e, '/')
    }

    JSON.parse(posts).forEach(function (post, number) {
      const page = html`<main>
        ${post}
      </main>`

      tackle.write(base(page).toString(), `/${number}/index.html`)
    })
  })
}
