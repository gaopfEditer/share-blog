---
id: react-18-features
slug: /react-18-features
title: ♥ React 18 新特性
date: 2022-09-07
authors: gaopfEditer
tags: [react, features]
keywords: [react, features]
---

# React 18 新特性

## 3.4.1 Automatic Batching

将多个状态更新合并成一个重新渲染以取得更好的性能的一种优化方式；

### V18 前的 Batching

默认不 batching 的场景：

1. promise;
2. setTimeout;
3. 原生事件处理（native event handlers）；

```javascript
function App() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  function handleClick() {
    setCount(c => c + 1); // Does not re-render yet
    setFlag(f => !f); // Does not re-render yet
    // React will only re-render once at the end (that's batching!)
  }

  return (
    <div>
      <button onClick={handleClick}>Next</button>
      <h1 style={{ color: flag ? "blue" : "black" }}>{count}</h1>
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  function handleClick() {
    fetchSomething().then(() => {
      // React 17 and earlier does NOT batch these because
      // they run *after* the event in a callback, not *during* it
      setCount(c => c + 1); // Causes a re-render
      setFlag(f => !f); // Causes a re-render
    });
  }

  return (
    <div>
      <button onClick={handleClick}>Next</button>
      <h1 style={{ color: flag ? "blue" : "black" }}>{count}</h1>
    </div>
  );
}
```

2. V18

所有更新自动batching

```javascript
function App() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  function handleClick() {
    fetchSomething().then(() => {
      // React 18 and later DOES batch these:
      setCount(c => c + 1);
      setFlag(f => !f);
      // React will only re-render once at the end (that's batching!)
    });
  }

  return (
    <div>
      <button onClick={handleClick}>Next</button>
      <h1 style={{ color: flag ? "blue" : "black" }}>{count}</h1>
    </div>
  );
}
```

若不想batching？

```javascript
import { flushSync } from 'react-dom'; // Note: react-dom, not react

function handleClick() {
  flushSync(() => {
    setCounter(c => c + 1);
  });
  // React has updated the DOM by now

  flushSync(() => {
    setFlag(f => !f);
  });
  // React has updated the DOM by now
}
```

batching 对hooks及class的影响

```javascript
handleClick = () => {
  setTimeout(() => {
    this.setState(({ count }) => ({ count: count + 1 })); // V18前{count：1，flag：false} , V18中{count：0，flag：false}，除非使用flushSync
    console.log(this.state);
    this.setState(({ flag }) => ({ flag: !flag }));
  });
};

// 在一些react库中，如react-dom，unstable_batchedUpdates实现类似功能
import { unstable_batchedUpdates } from 'react-dom';

unstable_batchedUpdates(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
});
```

3.4.2. startTransition

可以让我们的页面在多数据更新里保持响应。这个API通过标记某些更新为"transitions"，来提高用户交互；

实际：可以让我们的页面在展示时时刻保持re-render；

Example：我们更新input的value的同时用这个value去更新了一个有30000个item的list。然而这种多数据更新让页面无法及时响应，也让用户输入或者其他用户交互感觉很慢。

Solution:

```javascript
// 紧急的更新：展示用户的输入
setInputValue(e.target.value);

// 非紧急的更新：展示结果
setContent(e.target.value);
```

V18前：update的优先级一样；

V18：支持优先级手动设置；

```javascript
import { startTransition } from 'react';

// Urgent: Show what was typed
setInputValue(input);

// Mark any state updates inside as transitions
startTransition(() => {
  // Transition: Show the results
  setSearchQuery(input);
});

// 等同于
// 先setInputValue(e.target.value)后执行setContent(e.target.value)；
```

react中的update：

- Urgent updates: reflect direct interaction, like typing, clicking, pressing, and so on;
- Transition updates: transition the UI from one view to another;

误区

1. 与setTimeout的区别

直接看起来结果类似：

```javascript
// debounce 和 throttle 经常使用
// Show what you typed
setInputValue(input);

// Show the results
setTimeout(() => {
  setSearchQuery(input);
}, 0);
```

区别：

a. startTransition不会被放到下一次event loop，是同步立即执行的，这也就意味着，比timeout update更早，低端机体验明显；

使用场景

1. slow rendering：re-render需要耗费大量的工作量；
2. slow network：需要较长时间等待response的情况；

3.4.3. 支持React.lazy的SSR架构

SSR场景

react的SSR（server side render）

1. server：获取数据；
2. server：组装返回带有HTML的接口；
3. client：加载JavaScript；
4. client：hydration，将客户端的JS与服务端的HTML结合；

- V18前：按序执行；
- V18：支持拆解应用为独立单元，不影响其他模块；

SSR问题

1. server：获取数据；-->按序执行，必须在服务端返回所有HTML；
2. client：加载JavaScript；-->必须JS加载完成；
3. client：hydration，将客户端的JS与服务端的HTML结合；-->hydrate后才能交互；

流式HTML＆选择性hydrate

1. 流式HTML
2. client进行选择性的hydration：Suspense

```javascript
<Layout>
  <NavBar />
  <Sidebar />
  <RightPane>
    <Post />
    <Suspense fallback={<Spinner />}>
      <Comments />
    </Suspense>
  </RightPane>
</Layout>

// HTML返回过来在加载
<div hidden id="comments">
  Comments
  <p>First comment</p>
  <p>Second comment</p>
</div>
<script>
  // This implementation is slightly simplified
  document.getElementById('sections-spinner').replaceChildren(
    document.getElementById('comments')
  );
</script>
```

3. hydration之前要求交互

记录操作行为，并优先执行Urgent comp的hydration；

3.4.4. Concurrent Mode（并发模式）

Concurrent Mode（以下简称CM）

什么是CM和suspense？

在2019年react conf提出了实验性的版本来支持CM和Suspense（可以理解为等待代码加载，且指定加载界面）

- CM:

可帮助应用保持响应，并根据用户的设备性能和网速进行适当的调整。

阻塞渲染：如UI update，需要先执行对应视图操作，如更新DOM；

solution:

a. debounce：输入完成后响应，输入时不会更新；
b. throttle：功率低场景卡顿；

可中断渲染（CM）：

a. CPU-bound update：（例如创建新的DOM节点和运行组件中的代码）：中断当前渲染，切换更高优先级；
b. IO-bound update：（例如从网络加载代码或数据）：response前先在内存进行渲染；

- suspense

以声明的方式来"等待"任何内容，包括数据

```javascript
const resource = fetchProfileData();

function ProfilePage() {
  return (
    <Suspense fallback={<h1>Loading profile...</h1>}>
      <ProfileDetails />
      <Suspense fallback={<h1>Loading posts...</h1>}>
        <ProfileTimeline />
      </Suspense>
    </Suspense>
  );
}

function ProfileDetails() {
  // 尝试读取用户信息，尽管该数据可能尚未加载
  const user = resource.user.read();
  return <h1>{user.name}</h1>;
}

function ProfileTimeline() {
  // 尝试读取博文信息，尽管该部分数据可能尚未加载
  const posts = resource.posts.read();
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.text}</li>
      ))}
    </ul>
  );
}
```

误区：Suspense不是一个数据请求的库，而是一个机制。这个机制是用来给数据请求库向React通信说明某个组件正在读取的数据当前仍不可用

- 什么不是suspense

a. 不是数据获取方式；
b. 不是一个可以直接用于数据获取的客户端；
c. 它不使数据获取与视图层代码耦合；

- Suspense可以做什么

a. 能让数据获取库与React紧密整合；
b. 能让你有针对性地安排加载状态的展示；
c. 能够消除race conditions；

DEMO:

目前fetch data方式：

- Fetch-on-render（渲染之后获取数据，如：在useEffect中fetch）

```javascript
// 在函数组件中：
useEffect(() => {
  fetchSomething();
}, []);

// 或者，在class组件里：
componentDidMount() {
  fetchSomething();
}

function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser().then(u => setUser(u));
  }, []);

  if (user === null) {
    return <p>Loading profile...</p>;
  }
  return (
    <h1>{user.name}</h1>
    <ProfileTimeline />
  );
}

function ProfileTimeline() {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    fetchPosts().then(p => setPosts(p));
  }, []);

  if (posts === null) {
    return <h2>Loading posts...</h2>;
  }
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.text}</li>
      ))}
    </ul>
  );
}
```

- Fetch-then-render（接收到全部数据之后渲染，如：不使用Suspense的Relay）

```javascript
function fetchProfileData() {
  return Promise.all([
    fetchUser(),
    fetchPosts()
  ]).then(([user, posts]) => {
    return { user, posts };
  });
}

// 尽早开始获取数据
const promise = fetchProfileData();

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    promise.then(data => {
      setUser(data.user);
      setPosts(data.posts);
    });
  }, []);

  if (user === null) {
    return <p>Loading profile...</p>;
  }
  return (
    <h1>{user.name}</h1>
    <ProfileTimeline posts={posts} />
  );
}

// 子组件不再触发数据请求
function ProfileTimeline({ posts }) {
  if (posts === null) {
    return <h2>Loading posts...</h2>;
  }
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.text}</li>
      ))}
    </ul>
  );
}
```

<img src="/media/image36.jpg" width="500" height="92" />

·Render-as-you-fetch（获取数据之后渲染，如：使用了Suspense的 Relay）

<img src="/media/image37.jpg" width="13" height="13" />
<img src="/media/image38.jpg" width="19" height="12" />

JavaScript

```javascript
// 同 Fetch-then-render 区别：
// fetch-then-render: 开始获取数据→＞结束获取数据→＞ 开始渲染
// render-as-you-fetch：开始获取数据→＞开始渲染→＞结束获取数据

// 这不是一个 Promise。这是一个支持 Suspense 的特殊对象。
const resource = fetchProfileData();

function ProfilePage() {
  return (
    <Suspense fallback={<h1>Loading profile...</h1>}>
      <ProfileDetails />
      <Suspense fallback={<h1>Loading posts...</h1>}>
        <ProfileTimeline />
      </Suspense>
    </Suspense>
  );
}

function ProfileDetails() {
  // 尝试读取用户信息，尽管信息可能未加载完毕
  const user = resource.user.read();
  return <h1>{user.name}</h1>;
}

function ProfileTimeline() {
  // 尝试读取博文数据，尽管数据可能未加载完毕
  const posts = resource.posts.read();
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.text}</li>
      ))}
    </ul>
  );
}
// 一开始fetch data，渲染 ProfileDetails 和 ProfileTimeline
// 依次渲染可渲染comp，没有可渲染comp，此时fallback，渲染h1

·suspense要求尽早获取数据

```javascript
// 一早就开始数据获取，在渲染之前！
const resource = fetchProfileData();
// ...
function ProfileDetails() {
  // 尝试读取用户信息
  const user = resource.user.read();
  return <h1>{user.name}</h1>;
}
// 若无法保证在init时fetch data，而不是组件render后fetch data，可以根据props获取数据
// 开始获取数据，越快越好
const initialResource = fetchProfileData(0);

function App() {
  const [resource, setResource] = useState(initialResource);
  return (
    <button onClick={() => {
      const nextUserId = getNextId(resource.userId);
      // 再次获取数据：用户点击时
      setResource(fetchProfileData(nextUserId));
    }}>
      Next
    </button>
    <ProfilePage resource={resource} />
  );
}

·如何解决race condition

```javascript
// useEffect race condition
function ProfilePage({ id }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetchUser(id).then(u => setUser(u));
  }, [id]);
  if (user === null) {
    return <p>Loading profile...</p>;
  }
  return (
    <>
      <h1>{user.name}</h1>
      <ProfileTimeline id={id} />
    </>
  );
}

function ProfileTimeline({ id }) {
  const [posts, setPosts] = useState(null);
  useEffect(() => {
    fetchPosts(id).then(p => setPosts(p));
  }, [id]);
  if (posts === null) {
    return <h2>Loading posts...</h2>;
  }
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.text}</li>
      ))}
    </ul>
  );
}
// race condition：快速切换时，某个ProfileTimeline fetch请求延时过高后，旧的response会覆盖新的state
// suspense，开始获取数据→＞开始渲染→＞结束获取数据，获取完数据，立马setState

const initialResource = fetchProfileData(0);

![](/media/image39.jpg){width="0.18055555555555555in"
height="0.18055555555555555in"}

```javascript
function App() {
  const [resource, setResource] = useState(initialResource);
  return (
    <>
      <button onClick={() => {
        const nextUserId = getNextId(resource.userId);
        setResource(fetchProfileData(nextUserId));
      }}>
        Next
      </button>
      <ProfilePage resource={resource} />
    </>
  );
}

function ProfilePage({ resource }) {
  return (
    <Suspense fallback={<h1>Loading profile ...</h1>}>
      <ProfileDetails resource={resource} />
      <Suspense fallback={<h1>Loading posts...</h1>}>
        <ProfileTimeline resource={resource} />
      </Suspense>
    </Suspense>
  );
}

function ProfileDetails({ resource }) {
  const user = resource.user.read();
  return <h1>{user.name}</h1>;
}

function ProfileTimeline({ resource }) {
  const posts = resource.posts.read();
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.text}</li>
      ))}
    </ul>
  );
}
// 原因：
// hooks里，setState需要在合理的时间设置；
// suspense里，获取完数据，立马setState

为什么没有在V18中加上CM和suspense？

> 1．虽然React 18没有将Concurrent Mode（以下简称CM）列为版本18升级的核心特性，但也将其作为可选项集成在18版本中，为什么不作为必选项？

A:

a. CM和suspense更适合针对库作者，日常应用的开发者更多的可以作为借鉴；

b. react当前核心会放在迁移和解决兼容性的问题；

Fragments、Context、Hook开箱即用

concurrent得引入新的语义

![](/media/image40.jpg){width="7.0in" height="0.3888888888888889in"}

```javascript
// legacy 模式：最常见的版本
ReactDOM.render(<App />, rootNode)

// blocking 模式：作为从legacy迁移到cm的版本
ReactDOM.createBlockingRoot(rootNode).render(<App />)

// concurrent 模式：后续CM上stable版本后作为默认方式
ReactDOM.createRoot(rootNode).render(<App />)
```

1．为什么能够在半天内完成V18的升级

> a.React团队对于opt-in（可选）做了足够的兼容，如果不用CM的特性，是不会触发CM的，相当于React团队为你做了兜底；「concurrent rendering will only be enabled for updates triggered by one of the new features.」;
>
> b．18引入了新的Root API ReactDOM.createRoot来与旧的ReactDOM.render区分，使用旧的API会继续在legacy mode（可以理解为传统模式）下运行，用新API，就会跑在＂Concurrency opt-in＂ roots 下；


