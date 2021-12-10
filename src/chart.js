import { sliderChart } from './slider'
import { tooltip } from './tooltip'
import {
  circle,
  computeBoundaries,
  css,
  isOver,
  line,
  toDate,
  toCoords,
  compXRatio,
  compYRatio,
} from './utils'

const WIDTH = 600
const HEIGHT = 200
const PADDING = 40
const DPI_WIDTH = WIDTH * 2
const DPI_HEIGHT = HEIGHT * 2
const VIEW_HEIGHT = DPI_HEIGHT - PADDING * 2
const VIEW_WIDTH = DPI_WIDTH
const ROWS_COUNT = 5

export function chart(root, data) {
  const canvas = root.querySelector('[data-el="main"]')
  const tip = tooltip(root.querySelector('[data-el="tooltip"]'))
  const slider = sliderChart(
    root.querySelector('[data-el="slider"]'),
    data,
    WIDTH
  )
  const context = canvas.getContext('2d')

  canvas.width = DPI_WIDTH
  canvas.height = DPI_HEIGHT
  css(canvas, { width: WIDTH + 'px', height: HEIGHT + 'px' })
  let raf

  const proxy = new Proxy(
    {},
    {
      set(...args) {
        const result = Reflect.set(...args)
        raf = requestAnimationFrame(paint)
        return result
      },
    }
  )

  slider.subscribe(pos => {
    proxy.pos = pos
  })

  canvas.addEventListener('mousemove', mousemove)
  canvas.addEventListener('mouseleave', mouseleave)

  function mousemove({ clientX, clientY }) {
    const { left, top } = canvas.getBoundingClientRect()
    proxy.mouse = {
      x: (clientX - left) * 2,
      tooltip: {
        left: clientX - left,
        top: clientY - top,
      },
    }
  }
  function mouseleave() {
    proxy.mouse = null
    tip.hide()
  }

  function paint() {
    clear()

    const left = Math.round((data.columns[0].length * proxy.pos[0]) / 100)
    const right = Math.round((data.columns[0].length * proxy.pos[1]) / 100)
    const columns = data.columns.map(col => {
      const res = col.slice(left, right)
      if (typeof res[0] !== 'string') res.unshift(col[0])
      return res
    })

    const [yMin, yMax] = computeBoundaries({ columns, types: data.types })
    const yRatio = compYRatio(VIEW_HEIGHT, yMax, yMin)
    const xRatio = compXRatio(VIEW_WIDTH, columns[0].length)
    yAxis(yMin, yMax)

    const yData = columns.filter(col => data.types[col[0]] === 'line')
    const xData = columns.filter(col => data.types[col[0]] !== 'line')[0]

    yData
      .map(toCoords(xRatio, yRatio, DPI_HEIGHT, PADDING, yMin))
      .forEach((coords, i) => {
        const color = data.colors[yData[i][0]]
        line(context, coords, color)

        for (const [x, y] of coords) {
          if (isOver(proxy.mouse, x, coords.length, DPI_WIDTH)) {
            circle(context, [x, y], color)
          }
        }
      })

    xAxis(xData, xRatio, yData)
  }

  function clear() {
    context.clearRect(0, 0, DPI_WIDTH, DPI_HEIGHT)
  }

  function yAxis(yMin, yMax) {
    const step = VIEW_HEIGHT / ROWS_COUNT
    const textStep = (yMax - yMin) / ROWS_COUNT

    context.beginPath()
    context.lineWidth = 1
    context.strokeStyle = '#bbb'
    context.font = 'normal 20px Helvetica,sans-serif'
    context.fillStyle = '#96a2aa'

    for (let i = 1; i <= ROWS_COUNT; i++) {
      const y = step * i
      const text = Math.round(yMax - textStep * i)
      context.fillText(text, 5, y + PADDING - 10)

      context.moveTo(0, y + PADDING)
      context.lineTo(DPI_WIDTH, y + PADDING)
    }

    context.stroke()
    context.closePath()
  }

  function xAxis(xData, xRatio, yData) {
    const colsCount = 6
    const step = Math.round(xData.length / colsCount)

    context.beginPath()
    for (let i = 1; i < xData.length; i++) {
      const x = xRatio * i
      if ((i - 1) % step === 0) {
        context.fillText(toDate(xData[i]), x, DPI_HEIGHT - 10)
      }

      if (isOver(proxy.mouse, x, xData.length, DPI_WIDTH)) {
        context.save()
        context.moveTo(x, PADDING / 2)
        context.lineTo(x, DPI_HEIGHT - PADDING)
        context.restore()

        tip.show(proxy.mouse.tooltip, {
          title: toDate(xData[i]),
          items: yData.map(col => ({
            color: data.colors[col[0]],
            name: data.names[col[0]],
            value: col[i + 1],
          })),
        })
      }
    }
    context.lineWidth = 1
    context.strokeStyle = '#bbb'
    context.stroke()
    context.closePath()
  }

  return {
    init() {
      paint()
    },
    destroy() {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('mousemove', mousemove)
      canvas.removeEventListener('mouseleave', mouseleave)
    },
  }
}
