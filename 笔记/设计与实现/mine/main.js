// 渲染obj的渲染器
// 渲染函数，传入对象，渲染出数据
function mountComponent(vnode, container) {
  let subtree = vnode.tag()
  Render(subtree, container)
}

function mountElement(vnode, container) {
  let el = document.createElement(vnode.tag)
  // 添加事件
  for (let key in vnode.props) {
    if (/^on/.test(key)) {
      el.addEventListener(
        key.substring(2, key.length).toLowerCase(),
        vnode.props[key]
      )
    }
  }
  if (typeof vnode.children == 'string') {
    let text = document.createTextNode(vnode.children)
    el.appendChild(text)
  } else if (vnode.children) {
    vnode.children.forEach(child => Render(child, el))
  }
  container.appendChild(el)
}

function Render(vnode, container) {
  // 判断它是组件还是普通元素
  if (typeof vnode.tag == 'string') {
    mountElement(vnode, container)
  } else if (typeof vnode.tag == 'function') {
    mountComponent(vnode, container)
  }
}

function MyComponent() {
  let obj = {
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
  return obj
}

const vnode = {
  tag: MyComponent
}

Render(vnode, document.body)
