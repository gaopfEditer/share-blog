---
id: hooks-1
slug: /hooks-1
title: hooks-1
date: 2022-09-07
authors: gaopfEditer
tags: [react, hook]
keywords: [react, hook]
---

3.2．Hooks详解

Hooks是react16.8以后新增的钩子API；

目的：增加代码的可复用性，逻辑性，弥补无状态组件没有生命周期，没有数据管理状态state的缺陷。

为什么要使用Hooks？

1．开发友好，可扩展性强，抽离公共的方法或组件，Hook使你在无需修改组件结构的情况下复用状态逻辑；

2．函数式编程，将组件中相互关联的部分根据业务逻辑拆分成更小的函数；

3．class更多作为语法糖，没有稳定的提案，且在开发过程中会出现不必要的优化点，Hooks无需学习复杂的函数式或响应式编程技术；

3.2.1．常见Hooks

3.2.1.1.useState

```javascript
const [number, setNumber] = useState(0);
```

1．setState支持stateless组件有自己的state；

2．入参：具体值或一个函数；

3．返回值：数组，第一项是state值，第二项负责派发数据更新，组件渲染；

注意：setState会让组件重新执行，所以一般需要配合useMemo或useCallback；

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

3.2.1.2.useEffect

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

3.2.1.3.useLayoutEffect

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

3.2.1.4.useRef

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

3.2.1.5.useContext

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

3.2.1.6.useReducer

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

3.2.1.7.useMemo

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

3.2.1.8.useCallback

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

3.2.2．Hooks实战

3.2.2.1．所有依赖都必须放在依赖数组中么？

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

3.2.2.2．尽量不要用useCallback

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

3.2.2.3．useMemo建议适当使用

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

3.2.2.4．useState的正确使用姿势

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

3.2.3．自定义Hooks

注意：自定义Hooks本质上还是实现一个函数，关键在于实现逻辑

一般实现效果如：

```javascript
const [ a[,b,c...] ]=useXXX(arg1[,arg2,...])
```

3.2.3.1.setTitle hook

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

3.2.3.2. update hook

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
