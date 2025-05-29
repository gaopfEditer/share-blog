---
id: hooks-4
slug: /hooks-4
title: hooks-4
date: 2022-09-07
authors: gaopfEditer
tags: [react, hook]
keywords: [react, hook]
---

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
