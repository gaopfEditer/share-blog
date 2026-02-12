import { useState, useEffect, useCallback } from 'react'
import React from 'react'
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'
import { translate } from '@docusaurus/Translate'
import MyLayout from '@site/src/theme/MyLayout'
import type { Task } from '../types'

// 开发环境使用本地代理服务器，生产环境直接使用后端 API
// 注意：开发环境需要先运行 `npm run start:proxy` 启动代理服务器
// 生产环境需要后端配置 CORS 允许 https://gaopf.top 访问
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:9000/dev' // 开发环境：使用本地代理服务器
  : 'https://ffz.c.gaopf.top/api' // 生产环境：直接使用后端 API（需要后端配置 CORS）

// ==================== API 响应类型 ====================
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface ApiTask {
  id: number
  moduleCategory?: string
  name: string
  description?: string
  subCategory?: string
  progress: number
  plannedStartDate?: string
  plannedEndDate?: string
  actualStartDate?: string
  actualEndDate?: string
  plannedTime?: string
  actualTime?: string
  priority?: '低' | '中' | '高'
  tags?: string[]
  status?: '待开始' | '进行中' | '已完成' | '已暂停' | '已取消'
  createTime: string
  updateTime: string
}

interface ApiTaskListResponse {
  list?: ApiTask[]
  pagination?: {
    page: number
    size: number
    total: number
  }
}

interface ApiSubTask {
  id: number
  planId: number
  content: string
  completed: number // 0-未完成，1-已完成
  order: number
}

interface ApiTaskWithSubTasks {
  id: number
  name: string
  description?: string
  status?: '待开始' | '进行中' | '已完成' | '已暂停' | '已取消'
  progress: number
  subTasks?: ApiSubTask[]
}

// ==================== 字段转换函数 ====================
// API status -> 前端 status
function convertApiStatusToFrontend(apiStatus?: string): 'pending' | 'in-progress' | 'completed' {
  const statusMap: Record<string, 'pending' | 'in-progress' | 'completed'> = {
    待开始: 'pending',
    进行中: 'in-progress',
    已完成: 'completed',
    已暂停: 'pending',
    已取消: 'pending',
  }
  return statusMap[apiStatus || ''] || 'pending'
}

// 前端 status -> API status
function convertFrontendStatusToApi(status: 'pending' | 'in-progress' | 'completed'): '待开始' | '进行中' | '已完成' {
  const statusMap: Record<string, '待开始' | '进行中' | '已完成'> = {
    'pending': '待开始',
    'in-progress': '进行中',
    'completed': '已完成',
  }
  return statusMap[status] || '待开始'
}

// API priority -> 前端 priority
function convertApiPriorityToFrontend(apiPriority?: string): 'low' | 'medium' | 'high' {
  const priorityMap: Record<string, 'low' | 'medium' | 'high'> = {
    低: 'low',
    中: 'medium',
    高: 'high',
  }
  return priorityMap[apiPriority || ''] || 'medium'
}

// 前端 priority -> API priority
function convertFrontendPriorityToApi(priority: 'low' | 'medium' | 'high'): '低' | '中' | '高' {
  const priorityMap: Record<string, '低' | '中' | '高'> = {
    low: '低',
    medium: '中',
    high: '高',
  }
  return priorityMap[priority] || '中'
}

// 时间格式转换：API "2026-01-09 14:05:03" -> ISO string
function convertApiTimeToISO(apiTime: string): string {
  if (!apiTime) return new Date().toISOString()
  // 将 "2026-01-09 14:05:03" 转换为 ISO 格式
  return new Date(apiTime.replace(' ', 'T')).toISOString()
}

// ISO string -> API 时间格式 "YYYY-MM-DD HH:mm:ss"
function convertISOToApiTime(isoTime: string): string {
  if (!isoTime) return ''
  const date = new Date(isoTime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// API Task -> 前端 Task
function convertApiTaskToFrontend(apiTask: ApiTask): Task {
  return {
    id: String(apiTask.id),
    moduleCategory: apiTask.moduleCategory || '',
    name: apiTask.name,
    description: apiTask.description || '',
    subCategory: apiTask.subCategory || '',
    progress: apiTask.progress || 0,
    status: convertApiStatusToFrontend(apiTask.status),
    plannedStartDate: apiTask.plannedStartDate || '',
    plannedEndDate: apiTask.plannedEndDate || '',
    actualStartDate: apiTask.actualStartDate,
    actualEndDate: apiTask.actualEndDate,
    plannedTime: apiTask.plannedTime || '',
    actualTime: apiTask.actualTime,
    priority: convertApiPriorityToFrontend(apiTask.priority),
    tags: apiTask.tags || [],
    createdAt: convertApiTimeToISO(apiTask.createTime),
    updatedAt: convertApiTimeToISO(apiTask.updateTime),
  }
}

// 前端 Task -> API Task (用于新增/更新)
function convertFrontendTaskToApi(task: Partial<Task>): Partial<ApiTask> {
  const apiTask: Partial<ApiTask> = {}

  if (task.id) {
    apiTask.id = Number(task.id)
  }
  if (task.moduleCategory !== undefined) {
    apiTask.moduleCategory = task.moduleCategory
  }
  if (task.name !== undefined) {
    apiTask.name = task.name
  }
  if (task.description !== undefined) {
    apiTask.description = task.description
  }
  if (task.subCategory !== undefined) {
    apiTask.subCategory = task.subCategory
  }
  if (task.progress !== undefined) {
    apiTask.progress = task.progress
  }
  if (task.status !== undefined) {
    apiTask.status = convertFrontendStatusToApi(task.status)
  }
  if (task.plannedStartDate !== undefined) {
    apiTask.plannedStartDate = task.plannedStartDate
  }
  if (task.plannedEndDate !== undefined) {
    apiTask.plannedEndDate = task.plannedEndDate
  }
  if (task.actualStartDate !== undefined) {
    apiTask.actualStartDate = task.actualStartDate
  }
  if (task.actualEndDate !== undefined) {
    apiTask.actualEndDate = task.actualEndDate
  }
  if (task.plannedTime !== undefined) {
    apiTask.plannedTime = task.plannedTime
  }
  if (task.actualTime !== undefined) {
    apiTask.actualTime = task.actualTime
  }
  if (task.priority !== undefined) {
    apiTask.priority = convertFrontendPriorityToApi(task.priority)
  }
  if (task.tags !== undefined) {
    apiTask.tags = task.tags
  }

  return apiTask
}

// API SubTask -> 前端 SubTask
function convertApiSubTaskToFrontend(apiSubTask: ApiSubTask): import('../types').SubTask {
  return {
    id: String(apiSubTask.id),
    content: apiSubTask.content,
    completed: apiSubTask.completed === 1,
    order: apiSubTask.order,
  }
}

// ==================== API 调用函数 ====================
// 获取任务列表
async function fetchTasks(): Promise<Task[]> {
  if (!ExecutionEnvironment.canUseDOM) {
    return []
  }

  try {
    const response = await fetch(`${API_BASE_URL}/admin/task/plan/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    const result: ApiResponse<ApiTask[] | ApiTaskListResponse> = await response.json()

    if (result.code === 1000 && result.data) {
      // 处理两种可能的返回格式
      let apiTasks: ApiTask[] = []
      if (Array.isArray(result.data)) {
        apiTasks = result.data
      }
      else if (!Array.isArray(result.data) && result.data.list) {
        apiTasks = result.data.list
      }

      return apiTasks.map(convertApiTaskToFrontend)
    }

    console.error('Failed to fetch tasks:', result.message)
    return []
  }
  catch (error) {
    console.error('Failed to fetch tasks:', error)
    return []
  }
}

// 新增任务
async function createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task | null> {
  if (!ExecutionEnvironment.canUseDOM) {
    return null
  }

  try {
    const apiData = convertFrontendTaskToApi(taskData)

    const response = await fetch(`${API_BASE_URL}/admin/task/plan/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    })

    const result: ApiResponse<ApiTask> = await response.json()

    if (result.code === 1000 && result.data) {
      return convertApiTaskToFrontend(result.data)
    }

    console.error('Failed to create task:', result.message)
    return null
  }
  catch (error) {
    console.error('Failed to create task:', error)
    return null
  }
}

// 更新任务
async function updateTaskById(id: string, taskData: Partial<Task>): Promise<Task | null> {
  if (!ExecutionEnvironment.canUseDOM) {
    return null
  }

  try {
    const apiData = convertFrontendTaskToApi({ ...taskData, id })

    const response = await fetch(`${API_BASE_URL}/admin/task/plan/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    })

    const result: ApiResponse<ApiTask> = await response.json()

    if (result.code === 1000 && result.data) {
      return convertApiTaskToFrontend(result.data)
    }

    console.error('Failed to update task:', result.message)
    return null
  }
  catch (error) {
    console.error('Failed to update task:', error)
    return null
  }
}

// 删除任务
async function deleteTaskById(id: string): Promise<boolean> {
  if (!ExecutionEnvironment.canUseDOM) {
    return false
  }

  try {
    const response = await fetch(`${API_BASE_URL}/admin/task/plan/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: [Number(id)] }),
    })

    const result: ApiResponse<void> = await response.json()

    if (result.code === 1000) {
      return true
    }

    console.error('Failed to delete task:', result.message)
    return false
  }
  catch (error) {
    console.error('Failed to delete task:', error)
    return false
  }
}

// 获取任务详情（包含子任务）
async function fetchTaskWithSubTasks(id: string): Promise<import('../types').SubTask[] | null> {
  if (!ExecutionEnvironment.canUseDOM) {
    return null
  }

  try {
    const response = await fetch(`${API_BASE_URL}/admin/task/plan/infoWithSub`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: Number(id) }),
    })

    const result: ApiResponse<ApiTaskWithSubTasks> = await response.json()

    if (result.code === 1000 && result.data && result.data.subTasks) {
      return result.data.subTasks.map(convertApiSubTaskToFrontend)
    }

    console.error('Failed to fetch task with sub tasks:', result.message)
    return null
  }
  catch (error) {
    console.error('Failed to fetch task with sub tasks:', error)
    return null
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)

  // 初始化时从 API 加载任务
  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true)
      try {
        const fetchedTasks = await fetchTasks()
        setTasks(fetchedTasks)
      }
      catch (error) {
        console.error('Failed to load tasks:', error)
      }
      finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [])

  // 添加任务
  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask = await createTask(taskData)
    if (newTask) {
      setTasks(prev => [...prev, newTask])
      return newTask
    }
    throw new Error('Failed to create task')
  }, [])

  // 更新任务
  const updateTask = useCallback(async (id: string, taskData: Partial<Task>) => {
    const updatedTask = await updateTaskById(id, taskData)
    if (updatedTask) {
      setTasks(prev =>
        prev.map(task => (task.id === id ? updatedTask : task)),
      )
      return updatedTask
    }
    throw new Error('Failed to update task')
  }, [])

  // 删除任务
  const deleteTask = useCallback(async (id: string) => {
    const success = await deleteTaskById(id)
    if (success) {
      setTasks(prev => prev.filter(task => task.id !== id))
    }
    else {
      throw new Error('Failed to delete task')
    }
  }, [])

  // 按模块类别分组
  const tasksByCategory = useCallback(() => {
    const grouped: Record<string, Task[]> = {}
    tasks.forEach((task) => {
      const category = task.moduleCategory || ''
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(task)
    })
    return grouped
  }, [tasks])

  // 按模块类别 -> 子类目层级分组
  const tasksByModuleAndSubCategory = useCallback(() => {
    const grouped: Record<string, Record<string, Task[]>> = {}
    tasks.forEach((task) => {
      const category = task.moduleCategory || ''
      if (!grouped[category]) {
        grouped[category] = {}
      }
      // 如果没有子类目，使用 '未分类' 作为默认值
      const subCategory = task.subCategory || '未分类'
      if (!grouped[category][subCategory]) {
        grouped[category][subCategory] = []
      }
      grouped[category][subCategory].push(task)
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

  // 获取任务详情（包含子任务）
  const getTaskWithSubTasks = useCallback(async (id: string) => {
    return await fetchTaskWithSubTasks(id)
  }, [])

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    getTaskWithSubTasks,
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
