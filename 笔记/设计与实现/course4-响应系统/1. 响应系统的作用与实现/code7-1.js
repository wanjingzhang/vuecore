const set1 = new Set([1]) // 死循环
set1.forEach(item => {
  set1.delete(1)
  set1.add(1)
  console.log(888)
})

const set = new Set([1])
const newSet = new Set(set) // 避免无限循环
newSet.forEach(item => {
  set.delete(1)
  set.add(1)
  console.log(999)
})
