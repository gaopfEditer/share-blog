---
id: hooks-0
slug: /hooks-0
title: hooks-0
date: 2022-09-07
authors: gaopfEditer
tags: [react, hook]
keywords: [react, hook]
---

2．纲要

1．高阶组件的用法及封装

2．Hooks详解

3．异步组件

4．React 18新特性

3．主要内容

3.1．高阶组件用法及封装

高阶组件（HOC）是React中用于复用组件逻辑的一种高级技巧。HOC自身不是React API的一部分，它是一种基于React的组合特性而形成的设计模式。

简单点说，就是组件作为参数，返回值也是组件的函数，它是纯函数，不会修改传入的组件，也不会使用继承来复制其行为。相反，HOC通过将组件包装在容器组件中来组成新组件。HOC是纯函数，没有副作用。

3.1.1．使用HOC的原因

1．抽取重复代码，实现组件复用：相同功能组件复用

2．条件渲染，控制组件的渲染逻辑（渲染劫持）：权限控制。

3．捕获／劫持被处理组件的生命周期，常见场景：组件渲染性能追踪、日志打点。

3.1.2．HOC实现方式

3.1.2.1．属性代理

使用组合的方式，将组件包装在容器上，依赖父子组件的生命周期关系来；

1．返回stateless的函数组件

2．返回class组件

·操作props

```javascript
// 可以通过属性代理，拦截父组件传递过来的porps并进行处理。

// 返回一个无状态的函数组件
function HOC(WrappedComponent) {
  const newProps = { type: 'HOC' }
  return props => <WrappedComponent {...props} {...newProps} />
}

// 返回一个有状态的class 组件
function HOC(WrappedComponent) {
  return class extends React.Component {
    render() {
      const newProps = { type: 'HOC' }
      return <WrappedComponent {...this.props} {...newProps} />
    }
  }
}
```

·抽象state

```javascript
// 通过属性代理无法直接操作原组件的state，可以通过props和cb抽象state
function HOC(WrappedComponent) {
  return class extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        name: ''
      }
      this.onChange = this.onChange.bind(this)
    }

    onChange(event) {
      this.setState({
        name: event.target.value
      })
    }

    render() {
      const newProps = {
        name: {
          value: this.state.name,
          onChange: this.onChange
        }
      }
      return <WrappedComponent {...this.props} {...newProps} />
    }
  }
}

// 使用
@HOC
class Example extends Component {
  render() {
    return <input name="name" {...this.props.name} />
  }
}
```

·通过props实现条件渲染

```javascript
// 通过props来控制是否渲染及传入数据
import * as React from 'react'

function HOC(WrappedComponent) {
  return (props) => (
    <div>
      {props.isShow ? (
        <WrappedComponent {...props} />
      ) : <div>暂无数据</div>}
    </div>
  )
}

export default HOC
```

·其他元素wrapper传入的组件

3.1.2.2．反向继承

使用一个函数接受一个组件作为参数传入，并返回一个继承了该传入组件的类组件，且在返回组件的render()方法中返回super.render()方法

1．允许HOC通过this访问到原组件，可以直接读取和操作原组件的state/ref等；

2．可以通过super.render()获取传入组件的render，可以有选择的渲染劫持；

3．劫持原组件生命周期方法

```javascript
function HOC(WrappedComponent) {
  const didMount = WrappedComponent.prototype.componentDidMount

  // 继承了传入组件
  return class HOC extends WrappedComponent {
    async componentDidMount() {
      // 劫持 WrappedComponent 组件的生命周期
      if (didMount) {
        await didMount.apply(this)
      }
    }

    render() {
      // 使用 super 调用传入组件的 render 方法
      return super.render()
    }
  }
}
```

·读取／操作原组件的state

```javascript
function HOC(WrappedComponent) {
  const didMount = WrappedComponent.prototype.componentDidMount
  // 继承了传入组件
  return class HOC extends WrappedComponent {
    async componentDidMount() {
      if (didMount) {
        await didMount.apply(this)
      }
      // 将 state 中的 number 值修改成 2
      this.setState({ number: 2 })
    }

    render() {
      // 使用 super 调用传入组件的 render 方法
      return super.render()
    }
  }
}
```

·条件渲染

```javascript
const HOC = (WrappedComponent) =>
  class extends WrappedComponent {
    render() {
      if (this.props.isRender) {
        return super.render()
      } else {
        return <div>暂无数据</div>
      }
    }
  }
```

·修改react树

```javascript
// 修改返回render结果
function HigherOrderComponent(WrappedComponent) {
  return class extends WrappedComponent {
    render() {
      const tree = super.render()
      const newProps = {}
      if (tree && tree.type === 'input') {
        newProps.value = 'something here'
      }
      const props = {
        ...tree.props,
        ...newProps
      }
      const newTree = React.cloneElement(tree, props, tree.props.children)
      return newTree
    }
  }
}
```

3.1.3．属性代理和反向继承对比

> 1．属性代理：从"组合"角度出发，有利于从外部操作wrappedComp，可以操作props，或者在wrappedComp外加一些拦截器（如条件渲染等）；
>
> 2．反向继承：从"继承"角度出发，从内部操作wrappedComp，可以操作组件内部的state，生命周期和render等，功能能加强大；

3.1.4．举个栗子

·页面复用（属性代理）

```javascript
// views/PageA.js
import React from 'react'
import fetchMovieListByType from '../lib/utils'
import MovieList from '../components/MovieList'

class PageA extends React.Component {
  state = {
    movieList: []
  }

  async componentDidMount() {
    const movieList = await fetchMovieListByType('comedy')
    this.setState({
      movieList
    })
  }

  render() {
    return <MovieList data={this.state.movieList} emptyTips="暂无喜剧" />
  }
}

export default PageA

// views/PageB.js
import React from 'react'
import fetchMovieListByType from '../lib/utils'
import MovieList from '../components/MovieList'

class PageB extends React.Component {
  state = {
    movieList: []
  }

  async componentDidMount() {
    const movieList = await fetchMovieListByType('action')
    this.setState({
      movieList
    })
  }

  render() {
    return <MovieList data={this.state.movieList} emptyTips="暂无动作片" />
  }
}

export default PageB

// 冗余代码过多
// HOC
import React from 'react'

const withFetchingHOC = (WrappedComponent, fetchingMethod, defaultProps) => {
  return class extends React.Component {
    async componentDidMount() {
      const data = await fetchingMethod()
      this.setState({
        data
      })
    }

    render() {
      return (
        <WrappedComponent
          data={this.state.data}
          {...defaultProps}
          {...this.props}
        />
      )
    }
  }
}

// 使用：
// views/PageA.js
import React from 'react'
import withFetchingHOC from '../hoc/withFetchingHOC'
import fetchMovieListByType from '../lib/utils'
import MovieList from '../components/MovieList'

const defaultProps = { emptyTips: '暂无喜剧' }

export default withFetchingHOC(MovieList, fetchMovieListByType('comedy'), defaultProps)

// views/PageB.js
import React from 'react'
import withFetchingHOC from '../hoc/withFetchingHOC'
import fetchMovieListByType from '../lib/utils'
import MovieList from '../components/MovieList'

const defaultProps = { emptyTips: '暂无动作片' }

export default withFetchingHOC(MovieList, fetchMovieListByType('action'), defaultProps)

// views/Page0thers.js
import React from 'react'
import withFetchingHOC from '../hoc/withFetchingHOC'
import fetchMovieListByType from '../lib/utils'
import MovieList from '../components/MovieList'

const defaultProps = { emptyTips: '暂无其他类型' }

export default withFetchingHOC(MovieList, fetchMovieListByType('some-other-type'), defaultProps)
```

更符合里氏代换原则（Liskov Substitution Principle LSP），任何基类可以出现的地方，子类一定可以出现。LSP是继承复用的基石，只有当衍生类可以替换掉基类，软件单位的功能不受到影响时，基类才能真正被复用，而衍生类也能够在基类的基础上增加新的行为

·权限控制（属性代理）

```javascript
import React from 'react'
import { whiteListAuth } from '../lib/utils' // 鉴权方法

function AuthWrapper(WrappedComponent) {
  return class AuthWrappedComponent extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        permissionDenied: -1
      }
    }

    async componentDidMount() {
      try {
        await whiteListAuth() // 请求鉴权接口
        this.setState({
          permissionDenied: 0
        })
      } catch (err) {
        this.setState({
          permissionDenied: 1
        })
      }
    }

    render() {
      if (this.state.permissionDenied === -1) {
        return null // 鉴权接口请求未完成
      }
      if (this.state.permissionDenied) {
        return <div>功能即将上线，敬请期待～</div>
      }
      return <WrappedComponent {...this.props} />
    }
  }
}

export default AuthWrapper
```

·组件渲染性能（反向继承）

如何计算一个组件render期间的渲染耗时？

```javascript
import React from 'react'
// Home 组件
class Home extends React.Component {
  render() {
    return (<h1>Hello World.</h1>)
  }
}

// HOC
function withTiming(WrappedComponent) {
  let start, end
  return class extends WrappedComponent {
    constructor(props) {
      super(props)
      start = 0
      end = 0
    }
    componentWillMount() {
      if (super.componentWillMount) {
        super.componentWillMount()
      }
      start = +Date.now()
    }
    componentDidMount() {
      if (super.componentDidMount) {
        super.componentDidMount()
      }
      end = +Date.now()
      console.error(`${WrappedComponent.name}组件渲染时间为${end - start}ms`)
    }
    render() {
      return super.render()
    }
  }
}

export default withTiming(Home)
```
