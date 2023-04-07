// computed 屬性
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

  // 執行副作用函數
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

/**
 *
 * @param {*} fn 傳遞給effect的fn參數才是effect副作用函數
 * @param {*} options
 * @returns
 */
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
    // 返回副作用的執行結果
    return res
  }
  // 将 options 挂在到 effectFn 上
  effectFn.options = options
  // activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合
  effectFn.deps = []
  // 执行副作用函数
  if (!options.lazy) {
    // 只有lazy=false時才會立即執行
    effectFn()
  }
  // 將副作用函數 作爲返回值
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

function computed(getter) {
  // 用來緩存上一次的值
  let value
  // 標志是否需要重新計算值，true賍，需要計算
  let dirty = true

  // 副作用方法執行時，返回了副作用函數，這樣我們就可手動執行副作用函數。
  const effectFn = effect(getter, {
    // getter: ()=> obj.foo + obj.bar
    lazy: true,
    scheduler() {
      if (!dirty) {
        // 儅obj.foo|obj.bar被修改了，那麽就在調度器中將其設置為賍
        dirty = true
        trigger(obj, 'value')
      }
    }
  })

  const obj = {
    get value() {
      // 只有賍才計算，并將返回值放入到緩存中
      // 只會在第一次訪問進行真正的計算，以後無論訪問多少次都會直接讀取緩存中的value值
      if (dirty) {
        // 手動執行副作用函數
        value = effectFn()
        // 將dirty設置成false，下一次直接使用 緩存中value的值
        dirty = false
      }
      // 儅讀取value時，手動調用track函數進行追蹤，解決修改obj屬性不回收的問題
      track(obj, 'value')
      return value
    }
  }

  return obj
}

// 使用computed創建一個計算屬性
const sumRes = computed(() => obj.foo + obj.bar)

console.log(sumRes.value)
console.log(sumRes.value)

obj.foo++

console.log(sumRes.value)

effect(() => {
  console.log(sumRes.value)
})

obj.foo++
