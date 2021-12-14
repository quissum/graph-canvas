import { checkbox } from './checkbox'
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
const SPEED = 50

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
  let prevVal = []
  let tipData

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
    if (tipData) tip.show(proxy.mouse.tooltip, tipData)
  }
  function mouseleave() {
    proxy.mouse = null
    tip.hide()
  }

  function animation(val) {
    const [min, max] = val.map(computeMinMax)

    function computeMinMax(val, i) {
      const step = (val - prevVal[i]) / SPEED
      let res = proxy.minmax[i]

      if (val > prevVal[i]) {
        if (res < val) {
          res += step
        } else if (res > val) {
          res = val
          prevVal[i] = val
        }
      } else {
        if (res > val) {
          res += step
        } else if (res < val) {
          res = val
          prevVal[i] = val
        }
      }

      return res
    }

    if (proxy.minmax[0] !== min || proxy.minmax[1] !== max)
      proxy.minmax = [min, max]
  }

  function paint() {
    console.log('paint')
    clear()

    //checkbox
    const checkboxEl = checkbox(root, data)
    checkboxEl.forEach(el => el.addEventListener('click', paint))

    function checkboxVal() {
      return checkboxEl.map(el => el.checked)
    }
    //===

    const left = Math.round((data.columns[0].length * proxy.pos[0]) / 100)
    const right = Math.round((data.columns[0].length * proxy.pos[1]) / 100)

    let columnsItem = 0
    const columns = data.columns
      .map((col, i) => {
        if (data.types[col[0]] === 'line' && !checkboxVal()[i - columnsItem])
          return
        if (data.types[col[0]] !== 'line') columnsItem++

        const res = col.slice(left, right)
        if (typeof res[0] !== 'string') res.unshift(col[0])
        return res
      })
      .filter(col => col)

    const [yMin, yMax] = computeBoundaries({ columns, types: data.types })

    if (!prevVal[0]) {
      prevVal = [yMin, yMax]
      proxy.minmax = [yMin, yMax]
    }

    animation([yMin, yMax])

    const yRatio = compYRatio(VIEW_HEIGHT, proxy.minmax[1], proxy.minmax[0])
    const xRatio = compXRatio(VIEW_WIDTH, columns[0].length)
    yAxis(proxy.minmax[0], proxy.minmax[1])

    const yData = columns.filter(col => data.types[col[0]] === 'line')
    const xData = columns.filter(col => data.types[col[0]] !== 'line')[0]

    yData
      .map(toCoords(xRatio, yRatio, DPI_HEIGHT, PADDING, proxy.minmax[0]))
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

  function tipLine(x) {
    context.save()
    context.moveTo(x, PADDING / 2)
    context.lineTo(x, DPI_HEIGHT - PADDING)
    context.lineWidth = 1
    context.strokeStyle = '#bbb'
    context.stroke()
    context.restore()
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
    for (let i = 0; i < xData.length; i++) {
      const x = xRatio * i

      if (i % step === 0 || i === 0) {
        context.fillText(toDate(xData[i + 1]), x, DPI_HEIGHT - 10)
      }

      if (isOver(proxy.mouse, x, xData.length - 1, DPI_WIDTH)) {
        tipLine(x)

        tipData = {
          title: toDate(xData[i + 1]),
          items: yData.map(col => ({
            color: data.colors[col[0]],
            name: data.names[col[0]],
            value: col[i + 1],
          })),
        }
      }
    }

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
