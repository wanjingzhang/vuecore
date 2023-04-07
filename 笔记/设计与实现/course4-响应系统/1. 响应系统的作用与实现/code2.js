// 存储副作用函数的桶
const bucket = new Set()

// 原始数据
const data = { text: 'hello world' }
// 对原始数据的代理
const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    // 将副作用函数 effect 添加到存储副作用函数的桶中
    console.log('get', target, key)
    bucket.add(effect)
    // 返回属性值
    return target[key]
  },
  // 拦截设置操作
  set(target, key, newVal) {
    console.log('set', target, key, newVal)
    // 设置属性值
    target[key] = newVal
    // 把副作用函数从桶里取出并执行
    bucket.forEach(fn => fn())
  }
})

function effect() {
  console.log('effect', data.text)
  document.body.innerText = obj.text
}

console.log(obj.text)
// set 触发effect方法，effect内部获取时触发了 get。effect 获取了最新的text，更新body的视图
obj.text = 'abc'
