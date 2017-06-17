/* globals FileReader */
const funky = require('../../funky')
const bel = require('bel')
const toBuffer = require('blob-to-buffer')

const filler = str => bel`<span class="filler">${str}</span>`

const editableField = funky`
<editable-field>
  <style>
    editable-field span.filler {
      color: grey;
    }
  </style>
  <div contenteditable=true>${opts => opts.fill ? filler(opts.fill) : ''}</div>
</editable-field>
`

module.exports = funky`
${(elem, opts) => {
  const marker = opts.marker
  console.log(marker)
  const input = elem.querySelector('input')

  let onImageComplete = (buffer, base64) => {
    console.log('finished', buffer.length)
  }

  input.onchange = () => {
    console.log(input.files)
    let image = input.files[0]
    toBuffer(image, (err, buffer) => {
      if (err) throw err
      onImageComplete(buffer, buffer.toString('base64'))
    })
  }
}}
<add-art-form>
  <input type="file" id="fileInput" name="fileInput" />
</add-art-form>
`