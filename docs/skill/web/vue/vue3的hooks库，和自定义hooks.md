

在 Vue 3 的 **Composition API** 时代，"Hooks"（即自定义组合函数，Custom Composables）已经成为组织和复用逻辑的核心方式，类似于 React 的自定义 Hook。社区也涌现了许多优秀的 Vue 3 Hooks 库，极大提升了开发效率。

简单说就是：Vue 3 的 Hooks 让代码复用变得特别简单，不用像 Vue 2 那样用 mixins 那么麻烦。

---

## ✅ 一、推荐的 Vue 3 Hooks 库（第三方）

以下是目前最流行、维护良好、功能丰富的 Vue 3 Hooks 库：

### 1. **[VueUse](https://vueuse.org/)** 🔥（强烈推荐）

> 🌟 **Vue 3 生态中最强大、最全面的 Composables 库**，由 **Anthony Fu（Vue 官方团队成员）** 维护。

#### ✅ 特点：
- 超过 **200+** 个高质量 `composables` - 基本啥都有
- 支持 Vue 3 和 Nuxt 3 - 兼容性好
- 类型推导完美（TypeScript 友好） - 写代码有提示
- 按需引入，Tree-shakable - 打包体积小
- 支持浏览器 API 封装：`useMouse`, `useDark`, `useStorage`, `useBreakpoints`, `useFetch` 等 - 常用功能都封装好了

#### 常用 API 示例：

```js
import { useMouse, useLocalStorage, useDark, useFullscreen } from '@vueuse/core'

const { x, y } = useMouse()
const token = useLocalStorage('token', '')
const isDark = useDark()
const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen()
```

#### 安装：

```bash
npm install @vueuse/core
```

👉 官网：[https://vueuse.org](https://vueuse.org)

---

### 2. **[oh-vue-icons](https://github.com/antfu/oh-vue-icons)**（配套图标库，非 hooks，但常搭配使用）

> 虽不是 hooks 库，但由同一位作者开发，常与 VueUse 搭配使用。

---

### 3. **其他可选库（按需了解）**

| 库名 | 说明 |
|------|------|
| `vue-composable` | 早期的 Composables 库，功能较少，VueUse 出现后逐渐被替代 |
| `@vueuse/router` | VueUse 的扩展，封装了 Vue Router 相关逻辑（如 `useRouteParams`） |
| `@vueuse/head` | SEO 标题/元信息管理（类似 vue-meta） |

> 💡 推荐只使用 **VueUse** 即可满足 90% 以上需求。 - 一个库就够了，不用装太多

---

## ✅ 二、如何编写自己的 Custom Hooks（自定义 Composables）

你可以将常用逻辑封装成自己的 `useXxx` 函数，放在 `composables/` 目录下。

说白了就是：把常用的逻辑抽出来，下次直接用，不用重复写。

### 示例 1：`useLocalStorage`（带响应式 + 监听外部变化） - 这个最常用

```js
// composables/useLocalStorage.js
import { ref, watch, onMounted, onUnmounted } from 'vue'

export function useLocalStorage(key, defaultValue = '') {
  const value = ref(JSON.parse(localStorage.getItem(key) || 'null') ?? defaultValue)

  // 同步到 localStorage
  watch(value, (val) => {
    localStorage.setItem(key, JSON.stringify(val))
  }, { deep: true })

  // 监听其他标签页的 localStorage 变化
  const handler = (e) => {
    if (e.key === key) {
      const newVal = e.newValue ? JSON.parse(e.newValue) : defaultValue
      value.value = newVal
    }
  }

  onMounted(() => {
    window.addEventListener('storage', handler)
  })

  onUnmounted(() => {
    window.removeEventListener('storage', handler)
  })

  return {
    value,
    setValue: (newValue) => {
      value.value = newValue
    }
  }
}
```

### 使用：

```js
import { useLocalStorage } from '@/composables/useLocalStorage'

const { value: username, setValue } = useLocalStorage('username', 'guest')
```

---

### 示例 2：`useApiFetch`（封装请求 + loading + error） - 接口请求必备

```js
// composables/useApiFetch.js
import { ref } from 'vue'
import axios from 'axios'

export function useApiFetch(url) {
  const data = ref(null)
  const loading = ref(true)
  const error = ref(null)

  async function fetch() {
    loading.value = true
    error.value = null
    try {
      const res = await axios.get(url)
      data.value = res.data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // 自动请求
  fetch()

  return { data, loading, error, refetch: fetch }
}
```

使用：

```js
const { data, loading, error } = useApiFetch('/api/user')
```

---

### 示例 3：`useForm`（表单管理） - 表单验证神器

```js
// composables/useForm.js
import { ref, computed } from 'vue'

export function useForm(initialData) {
  const form = ref({ ...initialData })
  const errors = ref({})

  const hasError = computed(() => Object.keys(errors.value).length > 0)

  function setField(key, value) {
    form.value[key] = value
    delete errors.value[key]
  }

  function validate(rules) {
    let valid = true
    for (const [key, rule] of Object.entries(rules)) {
      if (rule.required && !form.value[key]) {
        errors.value[key] = rule.message || '必填'
        valid = false
      }
    }
    return valid
  }

  return {
    form,
    errors,
    hasError,
    setField,
    validate
  }
}
```

---

## ✅ 三、最佳实践建议

| 实践 | 建议 |
|------|------|
| ✅ 命名规范 | 以 `use` 开头，如 `useModal`, `useAuth`, `useDrag` - 大家都这么写 |
| ✅ 目录结构 | 创建 `composables/` 目录统一管理 - 别乱放 |
| ✅ 返回响应式数据 | 使用 `ref`, `reactive`, `computed` - 这样才能响应式 |
| ✅ 清理副作用 | `onMounted`, `onUnmounted` 中处理事件监听、定时器等 - 内存泄漏要避免 |
| ✅ 支持参数和默认值 | 提高复用性 - 灵活一点 |
| ✅ 类型提示 | 使用 TypeScript 更佳 - 有提示写代码快 |

---

## ✅ 四、VueUse 常用 Hooks 分类推荐

| 类别 | 推荐 API |
|------|---------|
| **状态** | `useStorage`, `useSessionStorage`, `usePreferredDark` - 本地存储相关 |
| **DOM** | `useMouse`, `useScroll`, `useElementSize`, `useIntersectionObserver` - 鼠标滚动等 |
| **设备** | `useBreakpoints`, `useDeviceOrientation`, `useGeolocation` - 设备信息 |
| **网络** | `useFetch`, `useOnline`, `useWebSocket` - 网络请求 |
| **动画** | `useTimeout`, `useInterval`, `useTransition` - 定时器和动画 |
| **媒体** | `useMediaControls`, `useAudio`, `useVideo` - 音视频控制 |
| **路由** | `useRoute`, `useRouter`, `useRouteParams`（来自 `@vueuse/router`） - 路由相关 |

---

## ✅ 总结

| 内容 | 推荐 |
|------|------|
| 🔝 最佳 Hooks 库 | ✅ **[VueUse](https://vueuse.org)** - 官方推荐 |
| 🔧 自定义 Hooks | ✅ 封装 `useXxx` 到 `composables/` 目录 - 统一管理 |
| 🧩 常见封装 | `useLocalStorage`, `useFetch`, `useForm`, `useModal` - 这些最常用 |
| 🛠️ 开发建议 | 使用 TypeScript + 解构返回 + 清理副作用 - 代码质量高 |

> 💬 **一句话总结**：  
> **Vue 3 的 `composables` + `VueUse` = 开发效率飞升，逻辑复用从未如此简单！**

简单说就是：有了 VueUse，写代码就像搭积木一样简单，不用重复造轮子。

