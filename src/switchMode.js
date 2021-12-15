const body = document.querySelector('body')
const value = mode => `Switch to ${mode ? 'Day' : 'Night'} Mode`
const labelMode = body.querySelector('label[for="switchMode"]')

export function changeMode(mode) {
  if (mode) body.classList = 'night'
  else body.classList = ''
  labelMode.innerHTML = value(mode)
  return mode
}
