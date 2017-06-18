/* globals  REMOTE */
const funky = require('funky')
const bel = require('bel')
const emojione = require('emojione')
const blurModal = require('blur-modal')
const sodiAuthority = require('sodi-authority')

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
  ${() => bel([emojione.toImage('✖️')])}
</close-button>
`
const sosModule = require('sos')

const save = (elem, opts) => {

  let grey = () => {
    let img = elem.querySelector('img')
    img.style.opacity = 0.4
    img.style.filter = 'alpha(opacity=40)'
  }

  let _save = () => {
    console.log('saving')
    elem.onclick = null
    elem.ontouchstart = null
    grey()

    // TODO: add loading UI.

    window.requestAnimationFrame(() => {
      let token = sodiAuthority.load('token')
      let sos = sosModule(token.keypair)
      sos.authorities.push(token.signature)

      let image = {data: opts.base64, content_type: opts.contentType}
      let doc = sos.encode({loc: opts.marker.toGeoJSON()})
      // TODO: Pull description
      REMOTE.newArt(doc, image, (err, info) => {
        console.log(err, info)
        // TODO: wait for document to show up from the database.
        elem.parentNode.querySelector('close-button').click()
        opts.marker.remove()
      })
    })
  }

  elem.onclick = _save
  elem.ontouchstart = _save
}

const saveButton = funky`
${save}
<save-button>
  <style>
    save-button {
      cursor: pointer;
    }
  </style>
  ${() => bel([emojione.toImage('💽')])}
</save-button>
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
    <top-buttons>${saveButton} ${closeButton}</top-buttons>
    <textarea placeholder='Description (optional)'></textarea>
  </main-content>
</create-art>
`
