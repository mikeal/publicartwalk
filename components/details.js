const funky = require('funky')
// const bel = require('bel')
// const emojione = require('emojione')
const closeButton = require('./close-button')

module.exports = funky`
<create-art>
  <style>
    create-art main-content textarea {
      width: 100%;
      border: none;
      height: 75px;
      resize: none;
    }
  </style>
  <main-image>
    <img src="${opts => `${window.COUCHDB}/${opts.doc._id}/image`}" />
  </main-image>
  <main-content>
    <top-buttons>${closeButton}</top-buttons>
    <art-description>${opts => opts.description || ''}</art-description>
  </main-content>
</create-art>
`
