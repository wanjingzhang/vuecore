let obj1 = {}
let obj2 = {}

const map1 = new WeakMap()
map1.set(obj1, 1)

const map2 = new Map()
map2.set(obj2, 2)

obj1 = null
obj2 = null

console.log(map1.get(obj1)) // undefined
console.log(map2.get(obj2)) // undefined

// 为什么要用WeakMap
// 他的key是弱引用，当key引用的对象存在时才会有意义，如果key不存在了，那么他可以被垃圾回收站回收

const map = new Map()
const weakmap = new WeakMap()
;(function () {
  const foo = { foo: 1 }
  const bar = { bar: 2 }
  map.set(foo, 1)
  weakmap.set(bar, 2)
})()

console.log(map.get({ foo: 1 }))
console.log(weakmap.get({ bar: 2 }))
