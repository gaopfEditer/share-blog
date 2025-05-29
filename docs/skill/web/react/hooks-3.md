---
id: hooks-3
slug: /hooks-3
title: hooks-3
date: 2022-09-07
authors: gaopfEditer
tags: [react, hook]
keywords: [react, hook]
---

3.4.1. Automatic batching

将多个状态更新合并成一个重新渲染以取得更好的性能的一种优化方式；

1．V18前

默认不batching的场景：

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