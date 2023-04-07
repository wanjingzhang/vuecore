// Nothing
const data = { text: 'hello world' }
function effect() {
  const div = document.createElement('div')
  div.innerHTML = data.text
  document.body.appendChild(div)
}

document.getElementById('button').addEventListener('click', effect)
