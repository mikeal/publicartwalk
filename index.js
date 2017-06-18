/* globals L, MAP, localStorage */
const qs = require('querystring')
const bel = require('bel')
const emojione = require('emojione')
const jsonstream2 = require('jsonstream2')
const sodiAuthority = require('sodi-authority')
const websocket = require('websocket-stream')
const methodman = require('methodman')
const blurModal = require('blur-modal')
const addArt = require('./components/add-art')

// plugins
require('leaflet.smooth_marker_bouncing')

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
  let icon = L.icon({
    iconUrl: 'static/crosshair.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  })
  let opts = {draggable: true, opacity: 0.7, icon}
  let marker = L.marker([lat, lng], opts)
  marker.bindPopup(addArt({marker}))
  setTimeout(() => marker.bounce(1), 100)
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

// TODO: detect login and add user options.

const searchParams = qs.parse(window.location.search.slice(1))
let socketurl
if (searchParams.devsocket) {
  socketurl = `ws:localhost:8080`
} else {
  socketurl = `wss:publicartwalk.now.sh`
}

console.log(socketurl)

const connect = (onFinish) => {
  const ws = websocket(socketurl)
  const meth = methodman(ws)
  meth.commands({echo: (txt, cb) => cb(null, txt), ping: cb => cb(null)})
  meth.on('commands', remote => {
    window.REMOTE = remote
    window.REMOTE.meth = meth
    if (onFinish) onFinish()
  })
  meth.on('stream:database', stream => {
    console.log('database')
    let parser = jsonstream2.parse([/./])
    stream.pipe(parser).on('data', obj => {
      console.log(obj)
    })
  })
  ws.on('error', () => connect())
  ws.on('end', () => connect())
}
connect(() => {
  window.document.body.appendChild(addButton)
  REMOTE.bbox(MAP.getBounds().toBBoxString())
})

// let substream = meth.stream()
// // now i can take someStream and .pipe(substream)
// meth.on('stream', (stream, id) => {
//   // I'm being sent a stream.
// })

