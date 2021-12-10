import {
  computeBoundaries,
  compXRatio,
  compYRatio,
  css,
  line,
  toCoords,
} from './utils'

const HEIGHT = 40
const DPI_HEIGHT = HEIGHT * 2
function noop() {}

export function sliderChart(root, data, WIDTH) {
  const DPI_WIDTH = WIDTH * 2
  const MIN_WIDTH = WIDTH * 0.05

  const canvas = root.querySelector('canvas')
  const context = canvas.getContext('2d')
  let nextFn = noop
  canvas.width = DPI_WIDTH
  canvas.height = DPI_HEIGHT
  css(canvas, { width: WIDTH + 'px', height: HEIGHT + 'px' })

  const $left = root.querySelector('[data-el="left"]')
  const $window = root.querySelector('[data-el="window"]')
  const $right = root.querySelector('[data-el="right"]')

  root.addEventListener('mousedown', mousedown)
  document.addEventListener('mouseup', mouseup)

  function mousedown(event) {
    const type = event.target.dataset.type
    css($window, { cursor: 'move' })
    const dimensions = {
      left: parseInt($window.style.left),
      right: parseInt($window.style.right),
      width: parseInt($window.style.width),
    }

    function next() {
      nextFn(getPosition())
    }

    if (type === 'window') {
      const startX = event.pageX

      document.onmousemove = e => {
        const delta = startX - e.pageX
        if (delta === 0) return

        const left = dimensions.left - delta
        const right = dimensions.right + delta
        setPosition(left, right)
        next()
      }
    } else if (type === 'left' || type === 'right') {
      const startX = event.pageX

      document.onmousemove = e => {
        const delta = startX - e.pageX
        if (delta === 0) return
        let left
        let right

        if (type === 'left') {
          left = dimensions.left - delta
          right = dimensions.right
        } else {
          left = dimensions.left
          right = dimensions.right + delta
        }
        setPosition(left, right)
        next()
      }
    }
  }

  function mouseup() {
    document.onmousemove = null
    css($window, { cursor: 'default' })
  }

  const defaultWidth = WIDTH * 0.3
  setPosition(0, WIDTH - defaultWidth)

  function setPosition(left, right) {
    const w = WIDTH - right - left

    if (w < MIN_WIDTH) {
      css($window, { width: MIN_WIDTH + 'px' })
      return
    }
    if (left < 0) {
      css($window, { left: '0px' })
      css($left, { width: '0px' })
      return
    }
    if (right < 0) {
      css($window, { right: '0px' })
      css($right, { width: '0px' })
      return
    }

    css($window, {
      left: left + 'px',
      right: right + 'px',
      width: w + 'px',
    })
    css($left, {
      width: left + 'px',
    })
    css($right, {
      width: right + 'px',
    })
  }

  function getPosition() {
    const left = parseInt($left.style.width)
    const right = WIDTH - parseInt($right.style.width)

    return [(left * 100) / WIDTH, (right * 100) / WIDTH]
  }

  //Painting line
  const [yMin, yMax] = computeBoundaries(data)
  const yRatio = compYRatio(DPI_HEIGHT, yMax, yMin)
  const xRatio = compXRatio(DPI_WIDTH, data.columns[0].length)
  const yData = data.columns.filter(col => data.types[col[0]] === 'line')

  yData
    .map(toCoords(xRatio, yRatio, DPI_HEIGHT, 0, yMin))
    .forEach((coords, i) => {
      const color = data.colors[yData[i][0]]
      line(context, coords, color)
    })

  return {
    subscribe(fn) {
      nextFn = fn
      fn(getPosition())
    },
  }
}
