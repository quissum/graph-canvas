export const compYRatio = (HEIGHT, yMax, yMin) => HEIGHT / (yMax - yMin)

export const compXRatio = (WIDTH, length) => WIDTH / (length - 2)

export function toDate(timestamp, wDay) {
  const options = {
    day: 'numeric',
    month: 'short',
  }
  if (wDay) Object.assign(options, { weekday: 'short' })

  return new Intl.DateTimeFormat('en-UK', options).format(timestamp)
}

export function isOver(mouse, x, length, dWidth) {
  if (!mouse) return
  const width = dWidth / length

  return Math.abs(x - mouse.x) < width / 2
}

export function circle(context, [x, y], color, mode) {
  const CIRCLE_RADIUS = 8
  context.save()
  context.beginPath()
  context.strokeStyle = color
  context.fillStyle = mode ? '#222c37' : '#fff'
  context.arc(x, y, CIRCLE_RADIUS, 0, Math.PI * 2)
  context.fill()
  context.stroke()
  context.closePath()
  context.restore()
}

export function computeBoundaries({ types, columns }) {
  let min
  let max

  columns.forEach(col => {
    if (types[col[0]] !== 'line') return

    if (typeof min !== 'number') min = col[1]
    if (typeof max !== 'number') max = col[1]

    for (let i = 1; i < col.length; i++) {
      if (min > col[i]) min = col[i]
      if (max < col[i]) max = col[i]
    }
  })

  return [min, max]
}

export function line(context, coords, color) {
  context.beginPath()
  context.lineWidth = 4
  context.strokeStyle = color ?? '#000'
  for (const [x, y] of coords) {
    context.lineTo(x, y)
  }
  context.stroke()
  context.closePath()
}

export const css = (el, styles = {}) => Object.assign(el.style, styles)

export function toCoords(xRatio, yRatio, DPI_HEIGHT, PADDING, yMin) {
  return col =>
    col
      .map((y, i) => [
        Math.floor(--i * xRatio),
        Math.floor(DPI_HEIGHT - PADDING - (y - yMin) * yRatio),
      ])
      .filter((_, i) => i !== 0)
}

export function tipLine(context, x, PADDING, DPI_HEIGHT, mode) {
  context.save()
  context.moveTo(x, PADDING / 2)
  context.lineTo(x, DPI_HEIGHT - PADDING)
  context.lineWidth = 1
  context.strokeStyle = mode ? '#0e141a' : '#bbb'
  context.stroke()
  context.restore()
}
