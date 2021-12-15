import { css } from './utils'

export function checkbox(root, data) {
  const checkEl = Array.from(root.querySelectorAll('[data-el="checkbox"]'))
  const checkSpan = root.querySelectorAll('[data-el="checkSpan"]')
  const yData = data.columns.filter(col => data.types[col[0]] === 'line')

  style(checkSpan, data, yData)

  return [checkEl, checkEl.map(el => el.checked)]
}

function style(spans, data, yData) {
  spans.forEach((span, i) => {
    css(span, { 'border-color': data.colors[yData[i][0]] })
  })
}
