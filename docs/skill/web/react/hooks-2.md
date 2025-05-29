---
id: hooks-2
slug: /hooks-2
title: hooks-2
date: 2022-09-07
authors: gaopfEditer
tags: [react, hook]
keywords: [react, hook]
---

3.2.3.3. useScroll hook

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

3.2.3.4. useLocalStorage hook

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

3.2.3.5. useDebounce hook

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

3.2.3.6. useThrottle hook

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

3.2.3.7. usePrevious hook

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

3.2.3.8. useClickOutside hook

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

3.2.3.9. useHover hook

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

3.2.3.10. useWindowSize hook

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

3.2.3.11. useKeyPress hook

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

3.2.3.12. useMediaQuery hook

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

3.2.3.13. useOnScreen hook

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

3.2.3.14. useGeolocation hook

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

3.2.3.15. useLocalStorage hook

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

3.2.3.16. useSessionStorage hook

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

3.2.3.17. useCookie hook

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

3.2.3.18. useFetch hook

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

3.2.3.19. useScript hook

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

3.2.3.20. useEventListener hook

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

3.2.3.21. useWhyDidYouUpdate hook

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

3.2.3.22. useUpdateEffect hook

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

3.2.3.23. useIsFirstRender hook

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

3.2.3.24. useUpdateLayoutEffect hook

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

3.2.3.25. useIsMounted hook

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

3.2.3.26. useIsomorphicLayoutEffect hook

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

3.2.3.27. useDeepCompareEffect hook

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

3.2.3.28. useShallowCompareEffect hook

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

3.2.3.29. useCustomCompareEffect hook

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

3.2.3.30. useAsync hook

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
