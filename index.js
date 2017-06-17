/* globals L, MAP, localStorage */
const funky = require('funky')
const bel = require('bel')
const emojione = require('emojione')
const sodiAuthority = require('../sodi-authority')
const blurModal = require('blur-modal')
const addArt = require('./components/add-art')

const getToken = () => localStorage.token ? sodiAuthority.load('token') : null

const login = msg => {
  let unblur
  let elem = sodiAuthority.component((err, token) => {
    if (err) throw err
    sodiAuthority.persist('token', token)
    unblur()
  })
  unblur = blurModal(elem)
}

let getMarker = (lat, lng) => {
  let opts = {draggable: true, opacity: 0.7}
  let marker = L.marker([lat, lng], opts)
  marker.bindPopup(addArt({marker}))
  return marker
}

let addButton = bel`
<add-button>
  ${bel([emojione.toImage('➕')])}
</add-button>
`
addButton.onclick = (elem, opts) => {
  if (!getToken()) return login('Before you can add art you must login.')
  let center = MAP.getCenter()
  getMarker(center.lat, center.lng).addTo(MAP)
}

window.document.body.appendChild(addButton)
