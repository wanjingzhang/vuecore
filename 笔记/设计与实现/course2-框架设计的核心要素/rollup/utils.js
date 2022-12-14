export function foo(obj) {
  obj && obj.foo;
}

// 这一块就是dead code， 在编译时会被移除
export function bar() {
  console.log();
}

// 1. ESM 静态结构
// 2. 去除副作用
