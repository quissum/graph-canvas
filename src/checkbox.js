import { css } from './utils'

export function checkbox(root, data) {
  const checkJoined = root.querySelector('#joined')
  const checkLeft = root.querySelector('#left')
  const spanJoined = root.querySelector('[data-el="joinedSpan"]')
  const spanLeft = root.querySelector('[data-el="leftSpan"]')

  const yData = data.columns.filter(col => data.types[col[0]] === 'line')

  style([spanJoined, spanLeft], data, yData)

  return [checkJoined, checkLeft]
}

function style(spans, data, yData) {
  spans.forEach((span, i) => {
    css(span, { 'border-color': data.colors[yData[i][0]] })
  })
}
