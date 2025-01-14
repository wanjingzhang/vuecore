/**
 * 1. 添加事件的渲染器
 * @param {*} vnode 虚拟DOM
 * @param {*} container DOM容器
 */
function renderer(vnode, container) {
  // 使用 vnode.tag 作为标签名称创建 DOM 元素
  const el = document.createElement(vnode.tag)
  // 遍历 vnode.props 将属性、事件添加到 DOM 元素
  for (const key in vnode.props) {
    if (/^on/.test(key)) {
      // 匹配以on开头内props事件，那么说明它是事件
      // 注册事件到el元素
      el.addEventListener(
        key.substr(2).toLowerCase(), // 截取除了前2个字母的事件名称 onClick ---> click
        vnode.props[key] // 事件处理函数
      )
    }
  }

  // 处理 children
  if (typeof vnode.children === 'string') {
    // 如果 children 是字符串，说明是元素的文本子节点
    el.appendChild(document.createTextNode(vnode.children))
  } else if (Array.isArray(vnode.children)) {
    // 递归地调用 renderer 函数渲染子节点，使用当前元素 el 作为挂载点
    vnode.children.forEach(child => renderer(child, el))
  }

  // 将元素添加到挂载点下
  container.appendChild(el)
}

// 虚拟dom
const vnode = {
  tag: 'div',
  children: [
    {
      tag: 'div',
      children: 'click me',
      props: {
        onClick: () => alert('hello')
      }
    },
    { tag: 'div', children: 'touch me' }
  ]
}

renderer(vnode, document.body)
