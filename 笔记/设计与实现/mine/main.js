// 渲染obj的渲染器
// 渲染函数，传入对象，渲染出数据
function Render(obj, root) {
  let el = document.createElement(obj.tag)
  // 添加事件
  for (let key in obj.props) {
    if (/^on/.test(key)) {
      el.addEventListener(
        key.substring(2, key.length).toLowerCase(),
        obj.props[key]
      )
    }
  }
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
  children: [
    {
      tag: 'span',
      children: 'hello world',
      props: {
        onClick: () => {
          alert('hello')
        }
      }
    }
  ]
}

Render(obj, document.body)
