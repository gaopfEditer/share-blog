// 任务类型定义
export interface Task {
  id: string
  moduleCategory: string // 模块类别
  name: string // 名称
  description: string // 描述
  subCategory: string // 子类目
  progress: number // 完成度 (0-100)
  plannedTime: string // 计划时间
  actualTime: string // 实际时间
  createdAt: string // 创建时间
  updatedAt: string // 更新时间
  status: 'pending' | 'in-progress' | 'completed' // 状态
}

export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>

