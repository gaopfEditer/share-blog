---
id: vue-reactive-tick-nexttick
slug: /vue-reactive-tick-nexttick
title: Vue2的tick和nexttick
date: 2020-10-23
authors: gaopfEditer
tags: [vue, nexttick]
keywords: [vue, nexttick]
---

vue的tick执行原理

```javascript
// 模拟Vue的更新机制
let updateQueue = []
let isFlushing = false

function queueUpdate(updateFn) {
  updateQueue.push(updateFn)
  
  if (!isFlushing) {
    isFlushing = true
    // 在下一个微任务中执行所有更新
    Promise.resolve().then(() => {
      updateQueue.forEach(fn => fn())
      updateQueue = []
      isFlushing = false
    })
  }
}

// 由于把实际的更新渲染放到异步任务，则上下文的同步数据修改，如修改100次数据会拿到data的结果进行更新
```

那么如何衔接vue数据修改，到界面更新，到nextTick

```javascript
// 模拟Vue的简化版本
let updateQueue = []  // 更新队列
let nextTickQueue = []  // nextTick回调队列
let isFlushing = false  // 是否正在刷新

// 模拟数据响应式更新
let data = { count: 0 }
let domElement = { textContent: '0' }

// 1. 数据修改时触发
function setData(key, value) {
  console.log(`[数据修改] ${key} = ${value}`)
  
  // 修改数据
  data[key] = value
  
  // 将更新操作加入队列
  updateQueue.push(() => {
    console.log(`[DOM更新] 更新元素内容为 ${value}`)
    domElement.textContent = value.toString()
  })
  
  // 触发更新flush（异步）
  if (!isFlushing) {
    isFlushing = true
    Promise.resolve().then(flushUpdates)
  }
}

// 2. Vue的更新周期 - flush阶段
function flushUpdates() {
  console.log('[更新周期开始] 执行DOM更新')
  
  // 执行所有DOM更新操作
  updateQueue.forEach(update => update())
  updateQueue = []
  
  console.log('[更新周期结束] DOM更新完成')
  
  // DOM更新完成后，执行所有nextTick回调
  console.log('[开始执行nextTick回调]')
  nextTickQueue.forEach(callback => callback())
  nextTickQueue = []
  
  isFlushing = false
  console.log('[nextTick回调执行完毕]')
}

// 3. nextTick实现
function nextTick(callback) {
  console.log('[注册nextTick回调]')
  nextTickQueue.push(callback)
}

// ===== 使用示例 =====
console.log('=== 开始测试 ===')

// 快速修改数据100次
for (let i = 0; i < 3; i++) {
  setData('count', i)
}

// 注册nextTick回调
nextTick(() => {
  console.log('[用户回调] 在nextTick中获取DOM:', domElement.textContent)
})

nextTick(() => {
  console.log('[用户回调] 第二个nextTick回调')
})

console.log('=== 同步代码结束 ===')



=== 开始测试 ===
[数据修改] count = 0
[数据修改] count = 1
[数据修改] count = 2
[注册nextTick回调]
[注册nextTick回调]
=== 同步代码结束 ===
[更新周期开始] 执行DOM更新
[DOM更新] 更新元素内容为 0
[DOM更新] 更新元素内容为 1
[DOM更新] 更新元素内容为 2
[更新周期结束] DOM更新完成
[开始执行nextTick回调]
[用户回调] 在nextTick中获取DOM: 2
[用户回调] 第二个nextTick回调
[nextTick回调执行完毕]


```

nextTick原理

```javascript

// nextTick核心实现
export function nextTick(cb, ctx) {
  let _resolve
  
  // 将回调函数加入队列
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  
  // 如果还没有开始flush，则启动异步任务
  if (!pending) {
    pending = true
    if (useMacroTask) {
      macroTimerFunc()
    } else {
      microTimerFunc()
    }
  }
  
  // 支持Promise形式调用
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}

```



