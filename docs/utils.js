export function compYRatio(HEIGHT, yMax, yMin) {
  return HEIGHT / (yMax - yMin)
}
export function compXRatio(WIDTH, length) {
  return WIDTH / (length - 2)
}

export function toDate(timestamp) {
  const shortMonth = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  const data = new Date(timestamp)
  return `${shortMonth[data.getMonth()]} ${data.getDate()}`
}

export function isOver(mouse, x, length, dWidth) {
  if (!mouse) return
  const width = dWidth / length

  return Math.abs(x - mouse.x) < width / 2
}

export function circle(context, [x, y], color) {
  const CIRCLE_RADIUS = 8
  context.save()
  context.beginPath()
  context.strokeStyle = color
  context.fillStyle = '#fff'
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

export function css(el, styles = {}) {
  return Object.assign(el.style, styles)
}

export function toCoords(xRatio, yRatio, DPI_HEIGHT, PADDING, yMin) {
  return col =>
    col
      .map((y, i) => [
        Math.floor(--i * xRatio),
        Math.floor(DPI_HEIGHT - PADDING - (y - yMin) * yRatio),
      ])
      .filter((_, i) => i !== 0)
}
