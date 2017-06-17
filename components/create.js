const funky = require('funky')
const bel = require('bel')
const emojione = require('emojione')

const closeButton = funky`
${(elem, opts) => {
  elem.onclick = () => {
    let parent = elem.parentNode
    while (parent.tagName !== 'ART-DETAILS') parent = parent.parentNode
    parent.hide()
  }
}}
<close-button>
  <style>
    close-button {
      cursor: pointer;
    }
  </style>
  ${bel([emojione.toImage('✖️')])}
</close-button>
`

const saveButton = funky`
${(elem, opts) => {

}}
<button>
  save
</button>
`

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
    <img src="${opts => `data:${opts.contentType};base64,${opts.base64}`}" />
  </main-image>
  <main-content>
    <top-buttons>${saveButton} ${closeButton()}</top-buttons>
    <textarea placeholder='Description (optional)'></textarea>
  </main-content>
</create-art>
`