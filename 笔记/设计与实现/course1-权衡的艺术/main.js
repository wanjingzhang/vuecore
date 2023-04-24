// render 方法把对象渲染到了document中，赞👍

function Render(obj, root) {
  const el = document.createElement(obj.tag)
  if (typeof obj.children === 'string') {
    const text = document.createTextNode(obj.children)
    el.appendChild(text)
  } else if (obj.children) {
    // array，递归调用 Render，使用 el 作为 root 参数
    obj.children.forEach(child => Render(child, el))
  }

  // 将元素添加到 root
  root.appendChild(el)
}

const obj = {
  tag: 'div',
  children: [{ tag: 'span', children: 'hello world' }]
}
// 渲染到 body 下
Render(obj, document.body)
