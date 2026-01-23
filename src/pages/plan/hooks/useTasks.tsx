import { useState, useEffect, useCallback } from 'react'
import React from 'react'
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'
import { translate } from '@docusaurus/Translate'
import MyLayout from '@site/src/theme/MyLayout'
import type { Task } from '../types'

const STORAGE_KEY = 'plan-tasks'

// 从 localStorage 读取任务列表
function loadTasksFromStorage(): Task[] {
  if (!ExecutionEnvironment.canUseDOM) {
    return []
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }
  catch (error) {
    console.error('Failed to load tasks from storage:', error)
    return []
  }
}

// 保存任务列表到 localStorage
function saveTasksToStorage(tasks: Task[]): void {
  if (!ExecutionEnvironment.canUseDOM) {
    return
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }
  catch (error) {
    console.error('Failed to save tasks to storage:', error)
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])

  // 初始化时从 localStorage 加载任务
  useEffect(() => {
    setTasks(loadTasksFromStorage())
  }, [])

  // 添加任务
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTasks((prev) => {
      const updated = [...prev, newTask]
      saveTasksToStorage(updated)
      return updated
    })
    return newTask
  }, [])

  // 更新任务
  const updateTask = useCallback((id: string, taskData: Partial<Task>) => {
    setTasks((prev) => {
      const updated = prev.map(task =>
        task.id === id
          ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
          : task,
      )
      saveTasksToStorage(updated)
      return updated
    })
  }, [])

  // 删除任务
  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const updated = prev.filter(task => task.id !== id)
      saveTasksToStorage(updated)
      return updated
    })
  }, [])

  // 按模块类别分组
  const tasksByCategory = useCallback(() => {
    const grouped: Record<string, Task[]> = {}
    tasks.forEach((task) => {
      if (!grouped[task.moduleCategory]) {
        grouped[task.moduleCategory] = []
      }
      grouped[task.moduleCategory].push(task)
    })
    return grouped
  }, [tasks])

  // 按模块类别 -> 子类目层级分组
  const tasksByModuleAndSubCategory = useCallback(() => {
    const grouped: Record<string, Record<string, Task[]>> = {}
    tasks.forEach((task) => {
      if (!grouped[task.moduleCategory]) {
        grouped[task.moduleCategory] = {}
      }
      // 如果没有子类目，使用 '未分类' 作为默认值
      const subCategory = task.subCategory || '未分类'
      if (!grouped[task.moduleCategory][subCategory]) {
        grouped[task.moduleCategory][subCategory] = []
      }
      grouped[task.moduleCategory][subCategory].push(task)
    })
    return grouped
  }, [tasks])

  // 按创建时间排序（最新的在前）
  const tasksSortedByTime = useCallback(() => {
    return [...tasks].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      return timeB - timeA // 降序，最新的在前
    })
  }, [tasks])

  // 获取所有子类目列表
  const getAllSubCategories = useCallback(() => {
    const subCategories = new Set<string>()
    tasks.forEach((task) => {
      if (task.subCategory) {
        subCategories.add(task.subCategory)
      }
    })
    return Array.from(subCategories).sort()
  }, [tasks])

  // 统计信息
  const statistics = useCallback(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const inProgress = tasks.filter(t => t.status === 'in-progress').length
    const pending = tasks.filter(t => t.status === 'pending').length
    const avgProgress = total > 0
      ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / total)
      : 0

    return {
      total,
      completed,
      inProgress,
      pending,
      avgProgress,
    }
  }, [tasks])

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    tasksByCategory,
    tasksByModuleAndSubCategory,
    tasksSortedByTime,
    getAllSubCategories,
    statistics,
  }
}

// ==================== 页面组件 ====================
const TITLE = translate({
  id: 'theme.plan.hooks.useTasks.title',
  message: 'useTasks Hook',
})

const DESCRIPTION = translate({
  id: 'theme.plan.hooks.useTasks.description',
  message: '任务管理的 React Hook',
})

export default function UseTasksPage(): React.ReactElement {
  return (
    <MyLayout title={TITLE} description={DESCRIPTION} maxWidth={1280}>
      <main className="margin-vert--lg">
        <section className="text-center">
          <h2>{TITLE}</h2>
          <p>{DESCRIPTION}</p>
          <p className="margin-top--md">
            此页面包含 useTasks Hook 的实现。
            该 Hook 用于管理阶段性计划任务的状态和操作。
          </p>
        </section>
      </main>
    </MyLayout>
  )
}
