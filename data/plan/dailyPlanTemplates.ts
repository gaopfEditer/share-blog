import type { DailyPlanTemplate } from '@site/src/pages/plan/types'

/**
 * 每日计划模板配置
 * 这些模板是固定的，由后台维护在 data/plan/dailyPlanTemplates.ts 文件中
 * 前端通过导入此文件获取模板数据
 */
export const dailyPlanTemplates: DailyPlanTemplate[] = [
  {
    id: 'template_001',
    name: '每日计划',
    description: '每天早上制定计划，重点在于规划清楚。开拓一个新类别时先建立模板，然后每天执行和补充细节，阶段性调整该类别需要投入的时间和产出',
    moduleCategory: 'info',
    subCategory: '计划',
    priority: 'high',
    estimatedDuration: 10,
    isActive: true,
    weekdays: [1, 2, 3, 4, 5], // 周一到周五
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'template_002',
    name: '信息获取分门别类',
    description: '每天获取信息，分门别类，保持信息的质量，重点在于广开言路，不局限于当下，特别是在ai能做完成很多实践的时候',
    moduleCategory: 'project',
    subCategory: '开发',
    priority: 'high',
    estimatedDuration: 20,
    isActive: true,
    weekdays: [1, 2, 3, 4, 5, 6, 7], // 周一到周五
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'template_003',
    name: '切换状态',
    description: '每隔几个小时切换',
    moduleCategory: 'operate',
    subCategory: '健康',
    priority: 'medium',
    estimatedDuration: 30,
    isActive: true,
    // 不设置 weekdays，表示每天
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'template_004',
    name: '写博客',
    description: '每周写一篇技术博客',
    moduleCategory: 'blog',
    subCategory: '写作',
    priority: 'medium',
    estimatedDuration: 30,
    isActive: true,
    weekdays: [1, 3, 5, 7], // 周六
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'template_005',
    name: '每晚复盘',
    description: '每天晚上复盘一天的工作和生活，重点在于输出案例，减少后续的重复',
    moduleCategory: 'invest',
    subCategory: '工作',
    priority: 'high',
    estimatedDuration: 10,
    isActive: true,
    weekdays: [1, 2, 3, 4, 5, 6, 7], // 周一到周五
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
]

/**
 * 每日计划默认配置
 */
export const dailyPlanDefaultSettings = {
  defaultPriority: 'medium' as const,
  defaultDuration: 15, // 默认时长（分钟）
  autoCreateRecords: true, // 是否自动创建每日记录
}
