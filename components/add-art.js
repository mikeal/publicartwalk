/* globals L, MAP, alert */
const funky = require('funky')
const toBuffer = require('blob-to-buffer')
const artMarker = require('./art-marker')

module.exports = funky`
${(elem, opts) => {
  const marker = opts.marker
  console.log(marker)
  const input = elem.querySelector('input')

  let onImageComplete = (contentType, buffer, base64) => {
    console.log('finished', buffer.length)
    let url = `data:${contentType};base64,${base64}`
    let icon = L.icon({
      iconUrl: url,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      className: 'art-marker'
    })
    let loc = marker.getLatLng()
    let newMarker = L.marker([loc.lat, loc.lng], {icon: icon})
    marker.removeFrom(MAP)

    artMarker({marker: newMarker, buffer, contentType, base64})
    newMarker.fire('click')
  }

  input.onchange = () => {
    let image = input.files[0]
    if (!image.type.startsWith('image')) alert('Not an image.')
    toBuffer(image, (err, buffer) => {
      if (err) throw err
      onImageComplete(image.type, buffer, buffer.toString('base64'))
    })
  }
}}
<add-art-form>
  <input type="file" id="fileInput" name="fileInput" />
</add-art-form>
`