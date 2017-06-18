const funky = require('funky')
const emojione = require('emojione')
const bel = require('bel')

module.exports = funky`
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
  ${() => bel([emojione.toImage('✖️')])}
</close-button>
`
