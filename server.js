const overlap = require('bounding-box-overlap-test')
const websocket = require('websocket-stream')
const methodman = require('methodman')
const jsonstream2 = require('jsonstream2')
const corsify = require('corsify')
const events = require('events')
const http = require('http')
const request = require('request')
const sos = require('sos')()
const sodiAuthority = require('sodi-authority')

const defaultdb = 'https://mikeal.cloudant.com/dropub-audio'
const dburl = process.env.PAW_COUCHDB || defaultdb
const storage = require('./lib/storage')(dburl)

const changes = new events.EventEmitter()

storage.feed.on('change', change => {
  console.log('change', change.id)
  changes.emit(change.id, change.doc)
})

const validAuthority = signature => {
  for (var i = 0; i < sodiAuthority.knownKeys.length; i++) {
    let key = sodiAuthority.knownKeys[i]
    if (signature.publicKey === key.key) {
      if (key.expiration > Date.now()) {
        return true
      }
    }
  }
  return false
}

const queryPoints = (bbox, cb) => {
  let params = `bbox=${bbox}&include_docs=true`
  let url = `${dburl}/_design/geospatial/_geo/allgeo?${params}`
  request(url, {json: true}, (err, resp, results) => {
    if (err) return cb(err)
    let status = resp.statusCode
    if (status !== 200) return cb(new Error(`Code not 200, ${status}`))
    cb(null, results)
  })
}

const onWebsocketStream = stream => {
  let rpc = {}
  let databaseStream = jsonstream2.stringify()
  let sent = new Map()
  let write = obj => {
    if (sent.has(obj._id)) {
      if (sent.get(obj._id) === obj._rev) return
    } else {
      changes.on(obj._id, change => {
        // TODO: sent changes
      })
    }
    sent.set(obj._id, obj._rev)
    databaseStream.write(obj)
  }

  rpc.bbox = (bbox) => {
    queryPoints(bbox, (err, results) => {
      if (err) return
      results.rows.forEach(row => write(row.doc))
    })
  }

  rpc.newArt = (doc, image, cb) => {
    let authSignature = doc.signature.authorities[0]
    if (doc.from.data.hex !== authSignature.message.publicKey) {
      return cb(new Error('Authority signature does not match signing key.'))
    }
    if (!validAuthority(authSignature)) {
      return cb(new Error('Invalid signature authority.'))
    }
    doc = sos.decode(doc)
    console.log(doc)
    if (!doc.loc) {
      return cb(new Error('Document missing location data.'))
    }
    if (!image.content_type || !image.data) {
      return cb(new Error('Document missing image data.'))
    }

    let user = authSignature.message.user
    doc.creator = {type: user.type, login: user.login, avatar: user.avatar}
    doc._attachments = { image }
    doc.created = Date.now()
    storage.db.post(doc, cb)
  }
  rpc.ping = cb => cb(null)

  var meth = methodman(stream)
  meth.commands(rpc, 'base')
  databaseStream.pipe(meth.stream('database'))

  let clean = () => sent.forEach((v, id) => changes.removeListener(id, write))
  stream.on('error', clean)
  stream.on('end', clean)
}

const cors = corsify({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization'
})

const handler = (req, res) => {}
const app = http.createServer(cors(handler))
websocket.createServer({server: app}, onWebsocketStream)
app.listen(8080)
