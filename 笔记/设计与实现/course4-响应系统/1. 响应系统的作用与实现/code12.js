// watch 屬性：本質利用effect和options.schedule選項
// 存储副作用函数的桶
const bucket = new WeakMap()

// 原始数据
const data = { foo: 1, bar: 2 }
// 对原始数据的代理
const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    // 将副作用函数 activeEffect 添加到存储副作用函数的桶中
    track(target, key)
    // 返回属性值
    return target[key]
  },
  // 拦截设置操作
  set(target, key, newVal) {
    // 设置属性值
    target[key] = newVal
    // 把副作用函数从桶里取出并执行
    trigger(target, key)
  }
})

function track(target, key) {
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)

  const effectsToRun = new Set()
  effects &&
    effects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })
  effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
  // effects && effects.forEach(effectFn => effectFn())
}

// 用一个全局变量存储当前激活的 effect 函数
let activeEffect
// effect 栈
const effectStack = []

function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    // 当调用 effect 注册副作用函数时，将副作用函数复制给 activeEffect
    activeEffect = effectFn
    // 在调用副作用函数之前将当前副作用函数压栈
    effectStack.push(effectFn)
    const res = fn()
    // 在当前副作用函数执行完毕后，将当前副作用函数弹出栈，并还原 activeEffect 为之前的值
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]

    return res
  }
  // 将 options 挂在到 effectFn 上
  effectFn.options = options
  // activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合
  effectFn.deps = []
  // 执行副作用函数
  if (!options.lazy) {
    effectFn()
  }

  return effectFn
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

// =========================

function traverse(value, seen = new Set()) {
  // 如果要读取的数据是原始值，或者已经被读取过了，那么什么都不做
  if (typeof value !== 'object' || value === null || seen.has(value)) return
  // 将数据添加到seen中，代表遍历读取过了，避免循环引用引起的死循环
  seen.add(value)
  // 暂时不考虑数组和其他结构
  // 假设value是一个对象，使用for...in 读取对象的每个值，并递归调用traverse进行处理
  for (const k in value) {
    traverse(value[k], seen)
  }

  return value
}

/**
 *
 * @param {*} source 是响应式数据
 * @param {*} cb 是回调函数
 * @param {*} options
 */
function watch(source, cb, options = {}) {
  let getter
  // 如果watch的第一个参数不再是响应式数据，而是一个getter函数。在getter内部用户可以指定watch依赖哪些响应数据。只有当这些数据发生变化时才会触发回调的执行。
  if (typeof source === 'function') {
    // 如果source时函数，说明用户传递的时getter，所以直接把source赋值给getter
    getter = source
  } else {
    // 否则按照原来的实现 调用traverse递归读取
    getter = () => traverse(source)
  }
  // 保存旧值和新值
  let oldValue, newValue
  const job = () => {
    // 重新执行后获取的是新值
    newValue = effectFn()
    // 将旧值和新值作为回调函数的参数
    cb(oldValue, newValue)
    // 更新旧值，不然下次会获取错误的旧值
    oldValue = newValue
  }

  // ✨使用effect函数调用时开启lazy选项，并把返回值存储在effectFn中以便日后手动调用
  const effectFn = effect(
    // 触发读取操作，从而建立联系
    () => getter(),
    {
      lazy: true,
      scheduler: () => {
        // 当数据发生变化触发回调
        if (options.flush === 'post') {
          const p = Promise.resolve()
          p.then(job)
        } else {
          job()
        }
      }
    }
  )

  if (options.immediate) {
    job()
  } else {
    // 手动调用副作用函数，拿到的就是旧值
    oldValue = effectFn()
  }
}

watch(
  () => obj.foo,
  (newVal, oldVal) => {
    // 数据变化了
    console.log(newVal, oldVal)
  },
  {
    immediate: true,
    flush: 'post'
  }
)

setTimeout(() => {
  obj.foo++
}, 1000)
