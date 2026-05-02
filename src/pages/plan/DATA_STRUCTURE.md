# 计划系统数据结构说明

## 概述

计划系统包含两种类型的计划：
1. **每日计划（Daily Plan）**：固定模板，来源于配置数据，每日重复执行
2. **阶段性计划（Phase Task）**：项目性任务，有明确的起止时间

## 一、每日计划数据结构

### 1.1 DailyPlanTemplate（每日计划模板）

每日计划的固定模板，由后台配置管理。

```typescript
{
  id: "template_001",
  name: "晨间阅读",
  description: "每天早上阅读技术文章30分钟",
  moduleCategory: "info",
  subCategory: "学习",
  priority: "high",
  estimatedDuration: 30, // 分钟
  isActive: true,
  weekdays: [1, 2, 3, 4, 5], // 周一到周五，可选，不填表示每天
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

**字段说明：**
- `id`: 模板唯一标识
- `name`: 计划名称
- `description`: 详细描述（可选）
- `moduleCategory`: 模块类别（info/invest/operate/blog/project）
- `subCategory`: 子类目（可选）
- `priority`: 优先级（low/medium/high）
- `estimatedDuration`: 预计时长（分钟）
- `isActive`: 是否启用该模板
- `weekdays`: 适用的星期几数组（0=周日，1=周一...6=周六），可选，不填表示每天
- `createdAt/updatedAt`: 创建和更新时间

### 1.2 DailyPlanRecord（每日计划执行记录）

记录每天实际执行情况。

```typescript
{
  id: "record_20240115_001",
  templateId: "template_001",
  date: "2024-01-15", // YYYY-MM-DD
  status: "completed", // pending | in-progress | completed
  progress: 100, // 0-100
  actualDuration: 35, // 分钟，可选
  notes: "今天阅读了React相关文章",
  completedAt: "2024-01-15T08:30:00.000Z",
  createdAt: "2024-01-15T07:00:00.000Z",
  updatedAt: "2024-01-15T08:30:00.000Z"
}
```

**字段说明：**
- `id`: 记录唯一标识
- `templateId`: 关联的模板ID
- `date`: 执行日期（YYYY-MM-DD格式）
- `status`: 完成状态
- `progress`: 完成度（0-100）
- `actualDuration`: 实际花费时长（分钟，可选）
- `notes`: 备注信息（可选）
- `completedAt`: 完成时间（可选）
- `createdAt/updatedAt`: 创建和更新时间

### 1.3 DailyPlan（每日计划完整数据）

前端展示时使用的完整数据结构，包含模板和当日记录。

```typescript
{
  template: {
    // DailyPlanTemplate 对象
  },
  todayRecord: {
    // DailyPlanRecord 对象（如果今天有记录）
  },
  recentRecords: [
    // 最近几天的记录数组（可选，用于展示历史）
  ]
}
```

## 二、阶段性计划数据结构

### 2.1 PhaseTask（阶段性计划）

项目性任务，有明确的起止时间。

```typescript
{
  id: "phase_001",
  moduleCategory: "project",
  name: "重构用户认证系统",
  description: "将现有的JWT认证改为OAuth2.0",
  subCategory: "后端开发",
  progress: 60,
  status: "in-progress",
  plannedStartDate: "2024-01-01",
  plannedEndDate: "2024-01-31",
  actualStartDate: "2024-01-02",
  actualEndDate: undefined,
  plannedTime: "40小时",
  actualTime: "25小时",
  priority: "high",
  tags: ["重构", "认证", "安全"],
  createdAt: "2023-12-20T00:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z"
}
```

**字段说明：**
- `id`: 任务唯一标识
- `moduleCategory`: 模块类别
- `name`: 任务名称
- `description`: 详细描述
- `subCategory`: 子类目
- `progress`: 完成度（0-100）
- `status`: 状态（pending/in-progress/completed）
- `plannedStartDate`: 计划开始日期（YYYY-MM-DD）
- `plannedEndDate`: 计划结束日期（YYYY-MM-DD）
- `actualStartDate`: 实际开始日期（可选）
- `actualEndDate`: 实际结束日期（可选）
- `plannedTime`: 计划总时长（字符串，如"40小时"）
- `actualTime`: 实际总时长（可选）
- `priority`: 优先级（low/medium/high）
- `tags`: 标签数组（可选）
- `createdAt/updatedAt`: 创建和更新时间

## 三、统计数据结构

### 3.1 BaseStatistics（基础统计）

```typescript
{
  total: 100, // 总数
  completed: 60, // 已完成
  inProgress: 30, // 进行中
  pending: 10, // 待开始
  avgProgress: 65 // 平均完成度
}
```

### 3.2 DailyPlanStatistics（每日计划统计）

```typescript
{
  total: 50, // 总记录数
  completed: 40,
  inProgress: 5,
  pending: 5,
  avgProgress: 80,
  completionRate: 80, // 完成率（0-100）
  avgDuration: 32, // 平均时长（分钟）
  activeTemplates: 10 // 启用的模板数
}
```

### 3.3 PhaseTaskStatistics（阶段性计划统计）

```typescript
{
  total: 20,
  completed: 12,
  inProgress: 6,
  pending: 2,
  avgProgress: 70,
  onTimeCompletion: 10, // 按时完成数
  overdue: 2, // 逾期数
  avgDelayDays: 3 // 平均延期天数
}
```

### 3.4 MonthlyStatistics（月度统计）

```typescript
{
  year: 2024,
  month: 1, // 1-12
  dailyPlan: {
    // DailyPlanStatistics 对象
  },
  phaseTask: {
    // PhaseTaskStatistics 对象
  },
  totalTasks: 70, // 总任务数（每日计划记录数 + 阶段性计划数）
  totalCompleted: 52,
  completionRate: 74.3 // 总体完成率
}
```

### 3.5 QuarterlyStatistics（季度统计）

```typescript
{
  year: 2024,
  quarter: 1, // 1-4
  monthlyStats: [
    // MonthlyStatistics[] 该季度各月统计
  ],
  dailyPlan: {
    // DailyPlanStatistics 季度汇总
  },
  phaseTask: {
    // PhaseTaskStatistics 季度汇总
  },
  totalTasks: 210,
  totalCompleted: 156,
  completionRate: 74.3,
  trend: {
    taskGrowth: 15.5, // 任务增长趋势（百分比）
    completionGrowth: 8.2 // 完成率增长趋势（百分比）
  }
}
```

### 3.6 YearlyStatistics（年度统计）

```typescript
{
  year: 2024,
  quarterlyStats: [
    // QuarterlyStatistics[] 该年度各季度统计
  ],
  dailyPlan: {
    // DailyPlanStatistics 年度汇总
  },
  phaseTask: {
    // PhaseTaskStatistics 年度汇总
  },
  totalTasks: 840,
  totalCompleted: 624,
  completionRate: 74.3,
  topCategories: [
    { category: "info", count: 300 },
    { category: "project", count: 250 },
    // ...
  ]
}
```

## 四、配置数据结构

### 4.1 DailyPlanConfig（每日计划配置）

**重要说明：** 每日计划模板数据维护在项目本地文件中，不需要通过 API 获取。

**文件位置：** `data/plan/dailyPlanTemplates.ts`

**数据结构：**

```typescript
// data/plan/dailyPlanTemplates.ts
import type { DailyPlanTemplate } from '@site/src/pages/plan/types'

export const dailyPlanTemplates: DailyPlanTemplate[] = [
  {
    id: 'template_001',
    name: '晨间阅读',
    description: '每天早上阅读技术文章30分钟',
    moduleCategory: 'info',
    subCategory: '学习',
    priority: 'high',
    estimatedDuration: 30,
    isActive: true,
    weekdays: [1, 2, 3, 4, 5], // 周一到周五，不设置则表示每天
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  // ... 更多模板
]

export const dailyPlanDefaultSettings = {
  defaultPriority: 'medium',
  defaultDuration: 30, // 默认时长（分钟）
  autoCreateRecords: true, // 是否自动创建每日记录
}
```

**使用方式：**

前端直接导入该文件获取模板数据：

```typescript
import { dailyPlanTemplates, dailyPlanDefaultSettings } from '@site/data/plan/dailyPlanTemplates'
```

**维护说明：**
- 模板数据由开发人员直接在 `data/plan/dailyPlanTemplates.ts` 文件中维护
- 修改模板后需要重新构建项目才能生效
- 模板数据是只读的，用户不能在前端修改模板

## 五、API 响应数据结构

### 5.1 获取每日计划列表

```typescript
GET /api/plans/daily?date=2024-01-15

Response: {
  plans: DailyPlan[],
  statistics: DailyPlanStatistics
}
```

### 5.2 获取阶段性计划列表

```typescript
GET /api/plans/phase?status=all&category=info

Response: {
  tasks: PhaseTask[],
  statistics: PhaseTaskStatistics
}
```

### 5.3 获取月度统计

```typescript
GET /api/statistics/monthly?year=2024&month=1

Response: {
  statistics: MonthlyStatistics
}
```

### 5.4 获取季度统计

```typescript
GET /api/statistics/quarterly?year=2024&quarter=1

Response: {
  statistics: QuarterlyStatistics
}
```

### 5.5 获取年度统计

```typescript
GET /api/statistics/yearly?year=2024

Response: {
  statistics: YearlyStatistics
}
```

## 六、数据关系图

```
DailyPlanTemplate (模板)
    ↓ (1对多)
DailyPlanRecord (执行记录)
    ↓ (组合)
DailyPlan (完整数据)

PhaseTask (阶段性计划)

统计维度：
- DailyPlanStatistics (每日计划统计)
- PhaseTaskStatistics (阶段性计划统计)
- MonthlyStatistics (月度统计，包含上述两种)
- QuarterlyStatistics (季度统计，包含月度统计)
- YearlyStatistics (年度统计，包含季度统计)
```

## 七、使用建议

1. **每日计划**：
   - 模板由后台配置，前端只读
   - 每日记录由用户创建或系统自动创建
   - 支持按日期查询历史记录

2. **阶段性计划**：
   - 用户可创建、编辑、删除
   - 支持按状态、类别、时间范围筛选
   - 支持进度更新和状态变更

3. **统计**：
   - 支持实时统计和按时间段统计
   - 月度、季度、年度统计可缓存
   - 支持趋势分析

## 八、数据库设计建议

### 表结构建议：

1. **daily_plan_templates** - 每日计划模板表
2. **daily_plan_records** - 每日计划执行记录表
3. **phase_tasks** - 阶段性计划表
4. **statistics_monthly** - 月度统计表（可缓存）
5. **statistics_quarterly** - 季度统计表（可缓存）
6. **statistics_yearly** - 年度统计表（可缓存）

### 索引建议：

- `daily_plan_records`: 索引 `(template_id, date)`
- `phase_tasks`: 索引 `(status, module_category, planned_start_date)`
- `statistics_monthly`: 索引 `(year, month)`
- `statistics_quarterly`: 索引 `(year, quarter)`
- `statistics_yearly`: 索引 `(year)`

