// 为什么要用WeakMap
// 他的key是弱引用，当key引用的对象存在时才会有意义，如果key不存在了，那么他可以被垃圾回收站回收

// 强引用
// let foo = { foo: 1 }
// let arr = [foo, 'other']
// foo = null
// arr[0] = null
// console.log(arr)

// 弱引用
// let a = { name: 'celine', age: 18 }
// let weakmap = new WeakMap()
// weakmap.set(a, new Array(10 * 1024 * 1024))
// console.log(weakmap)
// a = null
// console.log(weakmap)

// chrome => element => performance monitor => js heap size
const buttonNode = document.querySelector('#button')
let key = { name: 'celine', age: 20 }
let map = new WeakMap()
map.set(key, new Array(10 * 1024 * 1024))
console.log(map)
buttonNode.addEventListener('click', () => {
  key = null
  console.log(map)
})

//清理之後大概過了2分鐘，垃圾回收執行了! js heap size!
