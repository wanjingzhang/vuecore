// 渲染obj的渲染器
// 渲染函数，传入对象，渲染出数据
function Render(obj, root) {
  let el = document.createElement(obj.tag)
  if (typeof obj.children == 'string') {
    let text = document.createTextNode(obj.children)
    el.appendChild(text)
  } else if (obj.children) {
    obj.children.forEach(child => Render(child, el))
  }
  root.appendChild(el)
}

const obj = {
  tag: 'div',
  children: [{ tag: 'span', children: 'hello world' }]
}

Render(obj, document.body)
