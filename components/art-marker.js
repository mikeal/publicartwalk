/* globals MAP */
const funky = require('funky')
const createComponent = require('./create')
const detailsComponent = require('./details')

const cache = document.querySelector('art-cache')
const mapdiv = document.querySelector('div#map')

const closeany = () => {
  let elems = mapdiv.querySelectorAll('art-details')
  if (elems.length) {
    [].forEach.call(elems, elem => {
      elem.querySelector('close-button').click()
    })
  }
}

const init = (elem, opts) => {
  const show = () => {
    cache.removeChild(elem)
    mapdiv.appendChild(elem)
  }
  const hide = () => {
    mapdiv.removeChild(elem)
    cache.appendChild(elem)
  }

  const clickHandler = () => {
    closeany()
    show()
  }

  opts.marker.on('click', clickHandler)
  opts.marker.addTo(MAP)
  cache.appendChild(elem)
  elem.hide = hide
  elem.show = show
}

const component = funky`
${init}
<art-details>
  ${opts => {
    if (opts.doc) return detailsComponent(opts)
    else return createComponent(opts)
  }}
</art-details>
`

module.exports = component
