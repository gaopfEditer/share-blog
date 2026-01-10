// ==================== 计划类型枚举 ====================
export type PlanType = 'daily' | 'phase' // 每日计划 | 阶段性计划

export type TaskStatus = 'pending' | 'in-progress' | 'completed'

// ==================== 每日计划相关 ====================
/**
 * 每日计划配置 - 固定模板，来源于配置数据
 * 每日计划是重复性的、固定的任务模板
 */
export interface DailyPlanTemplate {
  id: string // 模板ID
  name: string // 计划名称
  description?: string // 描述
  moduleCategory: string // 模块类别
  subCategory?: string // 子类目
  priority: 'low' | 'medium' | 'high' // 优先级
  estimatedDuration: number // 预计时长（分钟）
  isActive: boolean // 是否启用
  weekdays?: number[] // 适用的星期几 (0-6, 0=周日, 可选，不填表示每天)
  createdAt: string // 创建时间
  updatedAt: string // 更新时间
}

/**
 * 每日计划执行记录 - 记录每天的实际执行情况
 */
export interface DailyPlanRecord {
  id: string // 记录ID
  templateId: string // 关联的模板ID
  date: string // 执行日期 (YYYY-MM-DD)
  status: TaskStatus // 完成状态
  progress: number // 完成度 (0-100)
  actualDuration?: number // 实际时长（分钟）
  notes?: string // 备注
  completedAt?: string // 完成时间
  createdAt: string // 创建时间
  updatedAt: string // 更新时间
}

/**
 * 每日计划完整数据（模板 + 当日记录）
 */
export interface DailyPlan {
  template: DailyPlanTemplate
  todayRecord?: DailyPlanRecord // 今日记录（如果有）
  recentRecords?: DailyPlanRecord[] // 最近几天的记录（可选，用于展示历史）
}

// ==================== 阶段性计划相关 ====================
/**
 * 阶段性计划 - 现有的计划系统，新建的是阶段性计划
 * 阶段性计划是项目性的、有明确起止时间的任务
 */
/**
 * 任务细则 - 任务的执行步骤
 */
export interface SubTask {
  id: string // 细则ID
  content: string // 细则内容
  completed: boolean // 是否完成
  order: number // 排序顺序
}

export interface PhaseTask {
  id: string
  moduleCategory: string // 模块类别
  name: string // 名称
  description: string // 描述
  subCategory: string // 子类目
  progress: number // 完成度 (0-100)
  status: TaskStatus // 状态
  plannedStartDate: string // 计划开始日期 (YYYY-MM-DD)
  plannedEndDate: string // 计划结束日期 (YYYY-MM-DD)
  actualStartDate?: string // 实际开始日期 (YYYY-MM-DD)
  actualEndDate?: string // 实际结束日期 (YYYY-MM-DD)
  plannedTime: string // 计划时间（总时长，如 "40小时"）
  actualTime?: string // 实际时间（总时长，如 "45小时"）
  priority: 'low' | 'medium' | 'high' // 优先级
  tags?: string[] // 标签
  subTasks?: SubTask[] // 任务细则（执行步骤）
  createdAt: string // 创建时间
  updatedAt: string // 更新时间
}

/**
 * 阶段性计划表单数据
 */
export type PhaseTaskFormData = Omit<
  PhaseTask,
  'id' | 'createdAt' | 'updatedAt'
>

/**
 * 计划执行条目 - 实际执行的耗时和完成内容
 * 相当于计划的细则，结构类似于计划但更细致
 */
export interface ExecutionItem {
  id: string // 执行条目ID
  phaseTaskId: string // 关联的阶段性计划ID
  date: string // 执行日期 (YYYY-MM-DD)
  duration: number // 实际耗时（分钟）
  content: string // 完成内容描述
  status: TaskStatus // 状态
  progress: number // 完成度 (0-100)
  notes?: string // 备注
  createdAt: string // 创建时间
  updatedAt: string // 更新时间
}

/**
 * 计划执行条目表单数据
 */
export type ExecutionItemFormData = Omit<
  ExecutionItem,
  'id' | 'createdAt' | 'updatedAt'
>

/**
 * 阶段性计划完整数据（包含执行条目）
 */
export interface PhaseTaskWithExecutions extends PhaseTask {
  executionItems?: ExecutionItem[] // 执行条目列表
}

// ==================== 统计相关 ====================
/**
 * 基础统计信息
 */
export interface BaseStatistics {
  total: number // 总数
  completed: number // 已完成
  inProgress: number // 进行中
  pending: number // 待开始
  avgProgress: number // 平均完成度
}

/**
 * 每日计划统计
 */
export interface DailyPlanStatistics extends BaseStatistics {
  completionRate: number // 完成率 (0-100)
  avgDuration: number // 平均时长（分钟）
  activeTemplates: number // 启用的模板数
}

/**
 * 阶段性计划统计
 */
export interface PhaseTaskStatistics extends BaseStatistics {
  onTimeCompletion: number // 按时完成数
  overdue: number // 逾期数
  avgDelayDays: number // 平均延期天数
}

/**
 * 月度统计
 */
export interface MonthlyStatistics {
  year: number // 年份
  month: number // 月份 (1-12)
  dailyPlan: DailyPlanStatistics // 每日计划统计
  phaseTask: PhaseTaskStatistics // 阶段性计划统计
  totalTasks: number // 总任务数（每日计划记录数 + 阶段性计划数）
  totalCompleted: number // 总完成数
  completionRate: number // 总体完成率
}

/**
 * 季度统计
 */
export interface QuarterlyStatistics {
  year: number // 年份
  quarter: number // 季度 (1-4)
  monthlyStats: MonthlyStatistics[] // 该季度各月统计
  dailyPlan: DailyPlanStatistics // 季度每日计划统计（汇总）
  phaseTask: PhaseTaskStatistics // 季度阶段性计划统计（汇总）
  totalTasks: number // 总任务数
  totalCompleted: number // 总完成数
  completionRate: number // 总体完成率
  trend: {
    // 趋势分析
    taskGrowth: number // 任务增长趋势（百分比）
    completionGrowth: number // 完成率增长趋势（百分比）
  }
}

/**
 * 年度统计
 */
export interface YearlyStatistics {
  year: number // 年份
  quarterlyStats: QuarterlyStatistics[] // 该年度各季度统计
  dailyPlan: DailyPlanStatistics // 年度每日计划统计（汇总）
  phaseTask: PhaseTaskStatistics // 年度阶段性计划统计（汇总）
  totalTasks: number // 总任务数
  totalCompleted: number // 总完成数
  completionRate: number // 总体完成率
  topCategories: Array<{
    // 热门类目
    category: string
    count: number
  }>
}

// ==================== 配置相关 ====================
/**
 * 每日计划配置数据（从后台获取）
 */
export interface DailyPlanConfig {
  templates: DailyPlanTemplate[]
  defaultSettings: {
    defaultPriority: 'low' | 'medium' | 'high'
    defaultDuration: number // 默认时长（分钟）
    autoCreateRecords: boolean // 是否自动创建每日记录
  }
}

// ==================== API 响应类型 ====================
/**
 * 获取每日计划列表响应
 */
export interface DailyPlanListResponse {
  plans: DailyPlan[]
  statistics: DailyPlanStatistics
}

/**
 * 获取阶段性计划列表响应
 */
export interface PhaseTaskListResponse {
  tasks: PhaseTask[]
  statistics: PhaseTaskStatistics
}

/**
 * 获取月度统计响应
 */
export interface MonthlyStatisticsResponse {
  statistics: MonthlyStatistics
}

/**
 * 获取季度统计响应
 */
export interface QuarterlyStatisticsResponse {
  statistics: QuarterlyStatistics
}

/**
 * 获取年度统计响应
 */
export interface YearlyStatisticsResponse {
  statistics: YearlyStatistics
}

// ==================== 向后兼容 ====================
/**
 * @deprecated 使用 PhaseTask 替代
 * 保留此类型以保持向后兼容
 */
export type Task = PhaseTask

/**
 * @deprecated 使用 PhaseTaskFormData 替代
 * 保留此类型以保持向后兼容
 */
export type TaskFormData = PhaseTaskFormData
