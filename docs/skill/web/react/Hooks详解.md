---
id: react-hooks-detail
slug: /react-hooks-detail
title: ♥ React Hooks 详解
date: 2022-09-07
authors: gaopfEditer
tags: [react, hooks]
keywords: [react, hooks]
---


# React Hooks 详解


目的：增加代码的可复用性，逻辑性，弥补无状态组件没有生命周期，没有数据管理状态 state 的缺陷。

## 为什么要使用 Hooks？

1. 开发友好，可扩展性强，抽离公共的方法或组件，Hook 使你在无需修改组件结构的情况下复用状态逻辑
2. 函数式编程，将组件中相互关联的部分根据业务逻辑拆分成更小的函数
3. class 更多作为语法糖，没有稳定的提案，且在开发过程中会出现不必要的优化点，Hooks 无需学习复杂的函数式或响应式编程技术

## 3.2.1 常见 Hooks

### 3.2.1.1 useState

```javascript
const [number, setNumber] = useState(0);
```

1. setState 支持 stateless 组件有自己的 state
2. 入参：具体值或一个函数
3. 返回值：数组，第一项是 state 值，第二项负责派发数据更新，组件渲染

注意：setState 会让组件重新执行，所以一般需要配合 useMemo 或 useCallback

```javascript
const DemoState = (props) => {
  /* number为此时state读取值，setNumber为派发更新的函数 */
  const [number, setNumber] = useState(0) /* 0为初始值 */
  return (
    <div>
      <span>{number}</span>
      <button onClick={() => {
        setNumber(number + 1)
        console.log(number) /* 这里的number是不能够即使改变的 */
      }}>
        点击
      </button>
    </div>
  )
}

// 当更新函数之后,state的值是不能即时改变的,只有当下一次上下文执行的随之改变

const a = 1
const DemoState = (props) => {
  /* useState 第一个参数如果是函数则处理复杂的逻辑,返回值为初始值 */
  let [number, setNumber] = useState(() => {
    // number
    return a === 1 ? 1 : 2
  }) /* 1为初始值 */
  return (
    <div>
      <span>{number}</span>
      <button onClick={() => setNumber(number + 1)}></button>
    </div>
  )
}
```

### 3.2.1.2 useEffect

1．使用条件：当组件init、dom render完成、操纵dom、请求数据（如componentDidMount）等；

2．不限制条件，组件每次更新都会触发useEffect --> componentDidUpdate与componentwillreceiveprops;

3．useEffect第一个参数为处理事件，第二个参数接收数组，为限定条件，当数组变化时触发事件，为[]只在组件初始化时触发；

4．useEffect第一个参数有返回时，一般用来消除副作用（如去除定时器、事件绑定等）；

```javascript
// 模拟数据交互
function getUserInfo(a) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: a,
        age: 16,
      })
    }, 500)
  })
}

const Demo = ({ a }) => {
  const [userMessage, setUserMessage] = useState({})
  const [number, setNumber] = useState(0)
  const div = useRef()
  const handleResize = () => {}

  useEffect(() => {
    getUserInfo(a).then(res => {
      setUserMessage(res)
    })
    console.log(div.current) /* div */
    window.addEventListener('resize', handleResize)
    /* 只有当props->a和state->number改变的时候，useEffect副作用函数重新执行，
    如果此时数组为空[]，证明函数只有在初始化的时候执行一次相当于componentDidMount */
  }, [a, number])

  return (
    <div ref={div}>
      <span>{userMessage.name}</span>
      <span>{userMessage.age}</span>
      <div onClick={() => setNumber(1)}>{number}</div>
    </div>
  )
}

const Demo = ({ a }) => {
  const handleResize = () => {}
  useEffect(() => {
    const timer = setInterval(() => console.log(666), 1000)
    window.addEventListener('resize', handleResize)
    /* 此函数用于清除副作用 */
    return function() {
      clearInterval(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [a])
  return <div></div>
}
```

注意：useEffect无法直接使用async await，

```javascript
// Bad
useEffect(async () => {
  /* 请求数据 */
  const res = await getUserInfo(payload)
}, [a, number])

useEffect(() => {
  // declare the async data fetching function
  const fetchData = async () => {
    const data = await fetch('https://xxx.com')
    const json = await data.json()
    return json
  }

  // call the function
  const result = fetchData()
    .catch(console.error)

  // 无效
  setData(result)
}, [])

// 改进版
useEffect(() => {
  const fetchData = async () => {
    const data = await fetch('https://xxx.com')
    const json = await response.json()
    setData(json)
  }

  // call the function
  fetchData()
    // make sure to catch any error
    .catch(console.error)
}, [])
```

### 3.2.1.3 useLayoutEffect

渲染更新之前的useEffect

useEffect：组件更新挂载完成→浏览器dom绘制完成→执行useEffect回调；

useLayoutEffect：组件更新挂载完成→执行useLayoutEffect回调→浏览器dom绘制完成；

渲染组件

1．useEffect：闪动；

2．useLayoutEffect：卡顿；

```javascript
const DemoUseLayoutEffect = () => {
  const target = useRef()
  useLayoutEffect(() => {
    /* 我们需要在dom绘制之前，移动dom到制定位置 */
    const { x, y } = getPositon() /* 获取要移动的 x,y坐标 */
    animate(target.current, { x, y })
  }, [])
  return (
    <div>
      <span ref={target} className="animate"></span>
    </div>
  )
}
```

### 3.2.1.4 useRef

用来获取元素、缓存数据；

入参可以作为初始值

```javascript
// 获取元素
const DemoUseRef = () => {
  const dom = useRef(null)
  const handerSubmit = () => {
    /* <div>表单组件</div> dom 节点 */
    console.log(dom.current)
  }
  return (
    <div>
      <div ref={dom}>表单组件</div>
      <button onClick={() => handerSubmit()}>提交</button>
    </div>
  )
}

// 缓存数据，小技巧
// 不同于useState，useRef改变值不会使comp re-render
const currenRef = useRef(InitialData)
currenRef.current = newValue
```

### 3.2.1.5 useContext

用来获取父级组件传递过来的context值，这个当前值就是最近的父级组件Provider的value；

从parent comp获取ctx方式；

1. useContext(Context);
2. Context.Consumer;

```javascript
/* 用useContext方式 */
const DemoContext = () => {
  const value = useContext(Context)
  /* my name is aaa */
  return <div>my name is {value.name}</div>
}

/* 用Context.Consumer 方式 */
const DemoContext1 = () => {
  return (
    <Context.Consumer>
      {/* my name is aaa */}
      {(value) => <div>my name is {value.name}</div>}
    </Context.Consumer>
  )
}

export default () => {
  return (
    <div>
      <Context.Provider value={{ name: 'aaa' }}>
        <DemoContext />
        <DemoContext1 />
      </Context.Provider>
    </div>
  )
}
```

### 3.2.1.6 useReducer

入参：

1．第一个为函数，可以视为reducer，包括state和action，返回值为根据action的不同而改变后的state;

2．第二个为state的初始值；

出参：

1．第一个更新后的state值；

2．第二个是派发更新的dispatch函数；执行dispatch会导致组件re-render；（另一个是useState）

```javascript
const DemoUseReducer = () => {
  /* number为更新后的state值，dispatchNumbner 为当前的派发函数 */
  const [number, dispatchNumbner] = useReducer((state, action) => {
    const { payload, name } = action
    /* return的值为新的state */
    switch (name) {
      case 'a':
        return state + 1
      case 'b':
        return state - 1
      case 'c':
        return payload
    }
    return state
  }, 0)
  return (
    <div>
      当前值：{number}
      {/* 派发更新 */}
      <button onClick={() => dispatchNumbner({ name: 'a' })}>增加</button>
      <button onClick={() => dispatchNumbner({ name: 'b' })}>减少</button>
      <button onClick={() => dispatchNumbner({ name: 'c', payload: 666 })}>
        赋值
      </button>
      {/* 把dispatch 和 state 传递给子组件 */}
      <MyChildren dispatch={dispatchNumbner} State={{ number }} />
    </div>
  )
}
```

业务中经常将 useReducer＋useContext 代替Redux

### 3.2.1.7 useMemo

用来根据useMemo的第二个参数deps（数组）判定是否满足当前的限定条件来决定是否执行第一个cb;

```javascript
useMemo(() => (
  // selectList 不更新时，不会重新渲染，减少不必要的循环渲染
  <div>
    {selectList.map((i, v) => (
      <span
        className={style.listSpan}
        key={v}
      >
        {i.patentName}
      </span>
    ))}
  </div>
), [selectList])

// listshow，cacheSelectList 不更新时，不会重新渲染子组件
useMemo(() => (
  <Modal
    width={'70%'}
    visible={listshow}
    footer={[
      <Button key="back">取消</Button>,
      <Button
        key="submit"
        type="primary"
      >
        确定
      </Button>
    ]}
    {/* 减少了PatentTable组件的渲染 */}
    <PatentTable
      getList={getList}
      selectList={selectList}
      cacheSelectList={cacheSelectList}
      setCacheSelectList={setCacheSelectList}
    />
  </Modal>
), [listshow, cacheSelectList])

// 减少组件更新导致函数重新声明
const DemoUseMemo = () => {
  /* 用useMemo 包裹之后的log函数可以避免了每次组件更新再重新声明,可以限制执行 */
  const log = useMemo(() => {
    const log = () => {
      console.log(123)
    }
    return log
  }, [])
  return <div onClick={() => newLog()}></div>
}

// 如果没有加相关的更新条件，是获取不到更新之后的state的值的
const DemoUseMemo = () => {
  const [number, setNumber] = useState(0)
  const newLog = useMemo(() => {
    const log = () => {
      /* 点击span之后 打印出来的number 不是实时更新的number值 */
      console.log(number)
    }
    return log
    /* []没有 number */
  }, [])
  return (
    <div>
      <div onClick={() => newLog()}>打印</div>
      <span onClick={() => setNumber(number + 1)}>增加</span>
    </div>
  )
}
```

### 3.2.1.8 useCallback

useMemo返回cb的运行结果；

useCallback返回cb的函数；

```javascript
import React, { useState, useCallback } from 'react'

function Button(props) {
  const { handleClick, children } = props
  console.log('Button render')
  return (
    <button onClick={handleClick}>{children}</button>
  )
}

const MemoizedButton = React.memo(Button)

export default function Index() {
  const [clickCount, increaseCount] = useState(0)

  const handleClick = () => {
    console.log('handleClick')
    increaseCount(clickCount + 1)
  }

  return (
    <div>
      <p>{clickCount}</p>
      <MemoizedButton handleClick={handleClick}>Click</MemoizedButton>
    </div>
  )
}

// MemoizedButton还是重新渲染了
// Index组件state发生变化，导致组件重新渲染；
// 每次渲染导致重新创建内部函数handleClick，
// 进而导致子组件Button也重新渲染。

import React, { useState, useCallback } from 'react'

function Button(props) {
  const { handleClick, children } = props
  console.log('Button render')
  return (
    <button onClick={handleClick}>{children}</button>
  )
}

const MemoizedButton = React.memo(Button)

export default function Index() {
  const [clickCount, increaseCount] = useState(0)
  // 这里使用了`useCallback
  const handleClick = useCallback(() => {
    console.log('handleClick')
    increaseCount(clickCount + 1)
  }, [])

  return (
    <div>
      <p>{clickCount}</p>
      <MemoizedButton handleClick={handleClick}>Click</MemoizedButton>
    </div>
  )
}
```

## 3.2.2 Hooks的一些思考

### 3.2.2.1 所有依赖都必须放在依赖数组中么？

useEffect中，默认有个共识：useEffect中使用到外部变量，都应该放到第二个数组参数中。

```javascript
// 当props.count 和 count 变化时，上报数据
function Demo(props) {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')
  const [a, setA] = useState('')

  useEffect(() => {
    monitor(props.count, count, text, a)
  }, [props.count, count])

  return (
    <div>
      <button
        onClick={() => setCount(count + 1)}
      >
        click
      </button>
      <input value={text} onChange={e => setText(e.target.value)} />
      <input value={a} onChange={e => setA(e.target.value)} />
    </div>
  )
}
```

此时，text和a变量没有放在dps数组中

Solution:

1．不要使用eslint-plugin-react-hooks插件，或者可以选择性忽略该插件的警告；

2．只有一种情况，需要把变量放到deps数组中，那就是当该变量变化时，需要触发useEffect函数执行。而不是因为useEffect中用到了这个变量！

### 3.2.2.2 尽量不要用useCallback

1．useCallback大部分场景没有提升性能

2．useCallback让代码可读性变差

```javascript
Example 1
const someFunc = useCallback(() => {
  doSomething()
}, [])

return <ExpensiveComponent func={someFunc} />

const ExpensiveComponent = ({ func }) => {
  return (
    <div onClick={func}>
      hello
    </div>
  )
}

// 必须用React.memo wrapper住子组件，才能避免在参数不变的情况下，不重复渲染
// 所以一般项目中不建议使用useCallback
const ExpensiveComponent = React.memo(({ func }) => {
  return (
    <div onClick={func}>
      hello
    </div>
  )
})

// Example 2
const someFuncA = useCallback((d, g, x, y) => {
  doSomething(a, b, c, d, g, x, y)
}, [a, b, c])

const someFuncB = useCallback(() => {
  someFuncA(d, g, x, y)
}, [someFuncA, d, g, x, y])

useEffect(() => {
  someFuncB()
}, [someFuncB])

// 依赖层层传递，最终要找到哪些出发了useEffect执行，所以直接引用就好
const someFuncA = (d, g, x, y) => {
  doSomething(a, b, c, d, g, x, y)
}

const someFuncB = () => {
  someFuncA(d, g, x, y)
}

useEffect(() => {
  someFuncB()
}, [])
```

### 3.2.2.3 useMemo建议适当使用

在deps不变，且非简单的基础类型运算的情况下建议使用

```javascript
// 没有使用 useMemo
const memoizedValue = computeExpensiveValue(a, b)

// 使用 useMemo
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])

// 如果没有使用 useMemo,computeExpensiveValue 会在每一次渲染
// 如果使用了 useMemo，只有在a和b变化时，才会执行一次computeExpensiveValue。

const a = 1
const b = 2
const c = useMemo(() => a + b, [a, b])
const c = a + b // 内存消耗少
```

### 3.2.2.4 useState的正确使用姿势

1．能用其他状态计算出来就不用单独声明状态。一个state必须不能通过其它state／props 直接计算出来，否则就不用定义state

2．保证数据源唯一，在项目中同一个数据，保证只存储在一个地方

3．useState适当合并

```javascript
// Example 1
const SomeComponent = (props) => {
  const [source, setSource] = useState([
    { type: 'done', value: 1 },
    { type: 'doing', value: 2 },
  ])
  const [doneSource, setDoneSource] = useState([])
  const [doingSource, setDoingSource] = useState([])
  useEffect(() => {
    setDoingSource(source.filter(item => item.type === 'doing'))
    setDoneSource(source.filter(item => item.type === 'done'))
  }, [source])
  return (
    <div>
    </div>
  )
}

const SomeComponent = (props) => {
  const [source, setSource] = useState([
    { type: 'done', value: 1 },
    { type: 'doing', value: 2 },
  ])
  const doneSource = useMemo(() => source.filter(item => item.type === 'done'), [source])
  const doingSource = useMemo(() => source.filter(item => item.type === 'doing'), [source])
  return (
    <div>
    </div>
  )
}

// 避免props层层传递，在CR中很难看清楚
// Example 2
function SearchBox({ data }) {
  const [searchKey, setSearchKey] = useState(getQuery('key'))

  const handleSearchChange = e => {
    const key = e.target.value
    setSearchKey(key)
    history.push(`/movie-list?key=${key}`)
  }

  return (
    <input
      value={searchKey}
      placeholder="Search..."
      onChange={handleSearchChange}
    />
  )
}

function SearchBox({ data }) {
  const searchKey = parse(localtion.search)?.key

  const handleSearchChange = e => {
    const key = e.target.value
    history.push(`/movie-list?key=${key}`)
  }

  return (
    <input
      value={searchKey}
      placeholder="Search..."
      onChange={handleSearchChange}
    />
  )
}

// url params 和 state重复了

// Example 3
const [firstName, setFirstName] = useState()
const [lastName, setLastName] = useState()
const [school, setSchool] = useState()
const [age, setAge] = useState()
const [address, setAddress] = useState()
const [weather, setWeather] = useState()
const [room, setRoom] = useState()

const [userInfo, setUserInfo] = useState({
  firstName,
  lastName,
  school,
  age,
  address
})
const [weather, setWeather] = useState()
const [room, setRoom] = useState()

// 更新一个时
setUserInfo(s => ({
  ...s,
  firstName,
}))
```

## 3.2.3 自定义封装简单的Hooks

注意：自定义Hooks本质上还是实现一个函数，关键在于实现逻辑

一般实现效果如：

```javascript
const [ a[,b,c...] ]=useXXX(arg1[,arg2,...])
```

### 3.2.3.1 setTitle hook

```javascript
import { useEffect} from 'react'

const useTitle=(title)=>{
  useEffect(() => {
    document.title=title
  }, [title])

  return
}

export default useTitle
```

### 3.2.3.2 update hook

```javascript
import { useState} from 'react'

const useUpdate=() => {
  const [, setFlag] = useState()

  const update = () => {
    setFlag(Date.now())
  }

  return update
}

export default useUpdate
```

### 3.2.3.3 useScroll hook

```javascript
import { useState, useEffect } from 'react'

const useScroll = () => {
  const [scroll, setScroll] = useState({
    scrollX: 0,
    scrollY: 0
  })

  useEffect(() => {
    const handleScroll = () => {
      setScroll({
        scrollX: window.scrollX,
        scrollY: window.scrollY
      })
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return scroll
}

export default useScroll

// 实际使用
const App = () => {
  const { scrollX, scrollY } = useScroll()
  return (
    <div>
      <p>scrollX: {scrollX}</p>
      <p>scrollY: {scrollY}</p>
    </div>
  )
}
```

### 3.2.3.4 useLocalStorage hook

```javascript
import { useState, useEffect } from 'react'

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error(error)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}

export default useLocalStorage

// 实际使用
const App = () => {
  const [name, setName] = useLocalStorage('name', '')
  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Enter your name"
      />
    </div>
  )
}
```

### 3.2.3.5 useDebounce hook

```javascript
import { useState, useEffect } from 'react'

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce

// 实际使用
const App = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  useEffect(() => {
    if (debouncedSearchTerm) {
      // 执行搜索
      console.log('Searching for:', debouncedSearchTerm)
    }
  }, [debouncedSearchTerm])

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
    </div>
  )
}
```

### 3.2.3.6 useThrottle hook

```javascript
import { useState, useEffect } from 'react'

const useThrottle = (value, delay) => {
  const [throttledValue, setThrottledValue] = useState(value)
  const [lastRun, setLastRun] = useState(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      const now = Date.now()
      if (now - lastRun >= delay) {
        setThrottledValue(value)
        setLastRun(now)
      }
    }, delay - (Date.now() - lastRun))

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay, lastRun])

  return throttledValue
}

export default useThrottle

// 实际使用
const App = () => {
  const [scrollY, setScrollY] = useState(0)
  const throttledScrollY = useThrottle(scrollY, 1000)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div>
      <p>Throttled scrollY: {throttledScrollY}</p>
    </div>
  )
}
```

### 3.2.3.7 usePrevious hook

```javascript
import { useRef, useEffect } from 'react'

const usePrevious = value => {
  const ref = useRef()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export default usePrevious

// 实际使用
const App = () => {
  const [count, setCount] = useState(0)
  const previousCount = usePrevious(count)

  return (
    <div>
      <p>Current count: {count}</p>
      <p>Previous count: {previousCount}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}
```

### 3.2.3.8 useClickOutside hook

```javascript
import { useEffect, useRef } from 'react'

const useClickOutside = (handler) => {
  const ref = useRef()

  useEffect(() => {
    const listener = event => {
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }
      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [handler])

  return ref
}

export default useClickOutside

// 实际使用
const App = () => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useClickOutside(() => setIsOpen(false))

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open</button>
      {isOpen && (
        <div ref={ref}>
          <p>Click outside to close</p>
        </div>
      )}
    </div>
  )
}
```

### 3.2.3.9 useHover hook

```javascript
import { useState, useRef, useEffect } from 'react'

const useHover = () => {
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef(null)

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => setIsHovered(false)

  useEffect(() => {
    const node = ref.current
    if (node) {
      node.addEventListener('mouseenter', handleMouseEnter)
      node.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        node.removeEventListener('mouseenter', handleMouseEnter)
        node.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  return [ref, isHovered]
}

export default useHover

// 实际使用
const App = () => {
  const [ref, isHovered] = useHover()

  return (
    <div ref={ref}>
      {isHovered ? 'Hovered!' : 'Hover me'}
    </div>
  )
}
```

### 3.2.3.10 useWindowSize hook

```javascript
import { useState, useEffect } from 'react'

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return windowSize
}

export default useWindowSize

// 实际使用
const App = () => {
  const { width, height } = useWindowSize()

  return (
    <div>
      <p>Window width: {width}</p>
      <p>Window height: {height}</p>
    </div>
  )
}
```

### 3.2.3.11 useKeyPress hook

```javascript
import { useState, useEffect } from 'react'

const useKeyPress = (targetKey) => {
  const [keyPressed, setKeyPressed] = useState(false)

  useEffect(() => {
    const downHandler = ({ key }) => {
      if (key === targetKey) {
        setKeyPressed(true)
      }
    }

    const upHandler = ({ key }) => {
      if (key === targetKey) {
        setKeyPressed(false)
      }
    }

    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)

    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [targetKey])

  return keyPressed
}

export default useKeyPress

// 实际使用
const App = () => {
  const isPressed = useKeyPress('a')

  return (
    <div>
      {isPressed ? 'A key is pressed!' : 'Press A key'}
    </div>
  )
}
```

### 3.2.3.12 useMediaQuery hook

```javascript
import { useState, useEffect } from 'react'

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addListener(listener)

    return () => media.removeListener(listener)
  }, [matches, query])

  return matches
}

export default useMediaQuery

// 实际使用
const App = () => {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const isMobile = useMediaQuery('(max-width: 767px)')

  return (
    <div>
      {isDesktop && <p>Desktop view</p>}
      {isTablet && <p>Tablet view</p>}
      {isMobile && <p>Mobile view</p>}
    </div>
  )
}
```

### 3.2.3.13 useOnScreen hook

```javascript
import { useState, useEffect, useRef } from 'react'

const useOnScreen = (options) => {
  const [isIntersecting, setIntersecting] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting)
    }, options)

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [options])

  return [ref, isIntersecting]
}

export default useOnScreen

// 实际使用
const App = () => {
  const [ref, isIntersecting] = useOnScreen({
    threshold: 0.5
  })

  return (
    <div>
      <div ref={ref}>
        {isIntersecting ? 'Element is on screen' : 'Element is off screen'}
      </div>
    </div>
  )
}
```

### 3.2.3.14 useGeolocation hook

```javascript
import { useState, useEffect } from 'react'

const useGeolocation = () => {
  const [state, setState] = useState({
    loading: true,
    accuracy: null,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    latitude: null,
    longitude: null,
    speed: null,
    timestamp: null,
    error: null
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported'
      }))
      return
    }

    const successHandler = (position) => {
      const {
        coords: {
          accuracy,
          altitude,
          altitudeAccuracy,
          heading,
          latitude,
          longitude,
          speed
        },
        timestamp
      } = position

      setState({
        loading: false,
        accuracy,
        altitude,
        altitudeAccuracy,
        heading,
        latitude,
        longitude,
        speed,
        timestamp,
        error: null
      })
    }

    const errorHandler = (error) => {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }

    const id = navigator.geolocation.watchPosition(
      successHandler,
      errorHandler,
      options
    )

    return () => {
      navigator.geolocation.clearWatch(id)
    }
  }, [])

  return state
}

export default useGeolocation

// 实际使用
const App = () => {
  const {
    loading,
    error,
    latitude,
    longitude
  } = useGeolocation()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <p>Latitude: {latitude}</p>
      <p>Longitude: {longitude}</p>
    </div>
  )
}
```

### 3.2.3.15 useLocalStorage hook

```javascript
import { useState, useEffect } from 'react'

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error(error)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}

export default useLocalStorage

// 实际使用
const App = () => {
  const [name, setName] = useLocalStorage('name', '')

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Enter your name"
      />
    </div>
  )
}
```

### 3.2.3.16 useSessionStorage hook

```javascript
import { useState, useEffect } from 'react'

const useSessionStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error(error)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}

export default useSessionStorage

// 实际使用
const App = () => {
  const [name, setName] = useSessionStorage('name', '')

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Enter your name"
      />
    </div>
  )
}
```

### 3.2.3.17 useCookie hook

```javascript
import { useState, useEffect } from 'react'

const useCookie = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${key}=`))
        ?.split('=')[1]
      return item ? JSON.parse(decodeURIComponent(item)) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      document.cookie = `${key}=${encodeURIComponent(
        JSON.stringify(storedValue)
      )}; path=/`
    } catch (error) {
      console.error(error)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}

export default useCookie

// 实际使用
const App = () => {
  const [name, setName] = useCookie('name', '')

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Enter your name"
      />
    </div>
  )
}
```

### 3.2.3.18 useFetch hook

```javascript
import { useState, useEffect } from 'react'

const useFetch = (url, options = {}) => {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url, options)
        const data = await response.json()
        setState({
          loading: false,
          error: null,
          data
        })
      } catch (error) {
        setState({
          loading: false,
          error,
          data: null
        })
      }
    }

    fetchData()
  }, [url, JSON.stringify(options)])

  return state
}

export default useFetch

// 实际使用
const App = () => {
  const { loading, error, data } = useFetch('https://api.example.com/data')

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
```

### 3.2.3.19 useScript hook

```javascript
import { useState, useEffect } from 'react'

const useScript = (src) => {
  const [state, setState] = useState({
    loaded: false,
    error: null
  })

  useEffect(() => {
    const script = document.createElement('script')
    script.src = src
    script.async = true

    const onLoad = () => {
      setState({
        loaded: true,
        error: null
      })
    }

    const onError = () => {
      setState({
        loaded: false,
        error: new Error(`Failed to load script: ${src}`)
      })
    }

    script.addEventListener('load', onLoad)
    script.addEventListener('error', onError)

    document.body.appendChild(script)

    return () => {
      script.removeEventListener('load', onLoad)
      script.removeEventListener('error', onError)
      document.body.removeChild(script)
    }
  }, [src])

  return state
}

export default useScript

// 实际使用
const App = () => {
  const { loaded, error } = useScript('https://example.com/script.js')

  if (error) return <div>Error: {error.message}</div>
  if (!loaded) return <div>Loading...</div>

  return <div>Script loaded successfully!</div>
}
```

### 3.2.3.20 useEventListener hook

```javascript
import { useEffect, useRef } from 'react'

const useEventListener = (eventName, handler, element = window) => {
  const savedHandler = useRef()

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const isSupported = element && element.addEventListener
    if (!isSupported) return

    const eventListener = event => savedHandler.current(event)
    element.addEventListener(eventName, eventListener)

    return () => {
      element.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element])
}

export default useEventListener

// 实际使用
const App = () => {
  const [coords, setCoords] = useState({ x: 0, y: 0 })

  const handler = useCallback(
    ({ clientX, clientY }) => {
      setCoords({ x: clientX, y: clientY })
    },
    []
  )

  useEventListener('mousemove', handler)

  return (
    <div>
      <p>
        Mouse coordinates: {coords.x}, {coords.y}
      </p>
    </div>
  )
}
```

### 3.2.3.21 useWhyDidYouUpdate hook

```javascript
import { useEffect, useRef } from 'react'

const useWhyDidYouUpdate = (name, props) => {
  const previousProps = useRef()

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props })
      const changesObj = {}

      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changesObj[key] = {
            from: previousProps.current[key],
            to: props[key]
          }
        }
      })

      if (Object.keys(changesObj).length) {
        console.log('[why-did-you-update]', name, changesObj)
      }
    }

    previousProps.current = props
  })
}

export default useWhyDidYouUpdate

// 实际使用
const Demo = ({ count }) => {
  useWhyDidYouUpdate('Demo', { count })

  return <div>{count}</div>
}
```

### 3.2.3.22 useUpdateEffect hook

```javascript
import { useEffect, useRef } from 'react'

const useUpdateEffect = (effect, deps) => {
  const isFirstMount = useRef(true)

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    return effect()
  }, deps)
}

export default useUpdateEffect

// 实际使用
const App = () => {
  const [count, setCount] = useState(0)

  useUpdateEffect(() => {
    console.log('count updated:', count)
  }, [count])

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}
```

### 3.2.3.23 useIsFirstRender hook

```javascript
import { useRef, useEffect } from 'react'

const useIsFirstRender = () => {
  const isFirst = useRef(true)

  useEffect(() => {
    isFirst.current = false
  }, [])

  return isFirst.current
}

export default useIsFirstRender

// 实际使用
const App = () => {
  const isFirstRender = useIsFirstRender()

  return (
    <div>
      {isFirstRender ? 'First render' : 'Not first render'}
    </div>
  )
}
```

### 3.2.3.24 useUpdateLayoutEffect hook

```javascript
import { useLayoutEffect, useRef } from 'react'

const useUpdateLayoutEffect = (effect, deps) => {
  const isFirstMount = useRef(true)

  useLayoutEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    return effect()
  }, deps)
}

export default useUpdateLayoutEffect

// 实际使用
const App = () => {
  const [count, setCount] = useState(0)

  useUpdateLayoutEffect(() => {
    console.log('count updated:', count)
  }, [count])

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}
```

### 3.2.3.25 useIsMounted hook

```javascript
import { useRef, useEffect } from 'react'

const useIsMounted = () => {
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  return isMounted.current
}

export default useIsMounted

// 实际使用
const App = () => {
  const isMounted = useIsMounted()

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetch('https://api.example.com/data')
      if (isMounted) {
        // 只在组件挂载时更新状态
        setData(data)
      }
    }

    fetchData()
  }, [])

  return <div>{/* ... */}</div>
}
```

### 3.2.3.26 useIsomorphicLayoutEffect hook

```javascript
import { useEffect, useLayoutEffect } from 'react'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

export default useIsomorphicLayoutEffect

// 实际使用
const App = () => {
  useIsomorphicLayoutEffect(() => {
    // 在服务端和客户端都能正常工作
    console.log('Layout effect')
  }, [])

  return <div>{/* ... */}</div>
}
```

### 3.2.3.27 useDeepCompareEffect hook

```javascript
import { useEffect, useRef } from 'react'
import isEqual from 'lodash/isEqual'

const useDeepCompareEffect = (effect, deps) => {
  const ref = useRef()

  if (!ref.current || !isEqual(deps, ref.current)) {
    ref.current = deps
  }

  useEffect(effect, ref.current)
}

export default useDeepCompareEffect

// 实际使用
const App = () => {
  const [obj, setObj] = useState({ count: 0 })

  useDeepCompareEffect(() => {
    console.log('obj changed:', obj)
  }, [obj])

  return (
    <div>
      <button
        onClick={() => setObj(prev => ({ ...prev, count: prev.count + 1 }))}
      >
        Increment
      </button>
    </div>
  )
}
```

### 3.2.3.28 useShallowCompareEffect hook

```javascript
import { useEffect, useRef } from 'react'
import isEqual from 'lodash/isEqual'

const useShallowCompareEffect = (effect, deps) => {
  const ref = useRef()

  if (!ref.current || !isEqual(deps, ref.current)) {
    ref.current = deps
  }

  useEffect(effect, ref.current)
}

export default useShallowCompareEffect

// 实际使用
const App = () => {
  const [obj, setObj] = useState({ count: 0 })

  useShallowCompareEffect(() => {
    console.log('obj changed:', obj)
  }, [obj])

  return (
    <div>
      <button
        onClick={() => setObj(prev => ({ ...prev, count: prev.count + 1 }))}
      >
        Increment
      </button>
    </div>
  )
}
```

### 3.2.3.29 useCustomCompareEffect hook

```javascript
import { useEffect, useRef } from 'react'

const useCustomCompareEffect = (effect, deps, compare) => {
  const ref = useRef()

  if (!ref.current || !compare(deps, ref.current)) {
    ref.current = deps
  }

  useEffect(effect, ref.current)
}

export default useCustomCompareEffect

// 实际使用
const App = () => {
  const [obj, setObj] = useState({ count: 0 })

  useCustomCompareEffect(
    () => {
      console.log('obj changed:', obj)
    },
    [obj],
    (prev, next) => prev.count === next.count
  )

  return (
    <div>
      <button
        onClick={() => setObj(prev => ({ ...prev, count: prev.count + 1 }))}
      >
        Increment
      </button>
    </div>
  )
}
```

### 3.2.3.30 useAsync hook

```javascript
import { useState, useCallback } from 'react'

const useAsync = (asyncFunction) => {
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null
  })

  const execute = useCallback(async (...params) => {
    setState({ loading: true, error: null, data: null })

    try {
      const data = await asyncFunction(...params)
      setState({ loading: false, error: null, data })
      return data
    } catch (error) {
      setState({ loading: false, error, data: null })
      throw error
    }
  }, [asyncFunction])

  return { ...state, execute }
}

export default useAsync

// 实际使用
const App = () => {
  const { loading, error, data, execute } = useAsync(async () => {
    const response = await fetch('https://api.example.com/data')
    return response.json()
  })

  useEffect(() => {
    execute()
  }, [execute])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!data) return null

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
```
