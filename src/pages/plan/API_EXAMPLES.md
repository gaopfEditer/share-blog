# API 接口示例

本文档提供了计划系统所需的后台 API 接口示例，供后台开发参考。

## 一、每日计划相关接口

### 1.1 每日计划模板配置

**重要说明：** 每日计划模板数据维护在项目本地文件中，不需要通过 API 获取。

**文件位置：** `data/plan/dailyPlanTemplates.ts`

**使用方式：** 前端直接导入该文件获取模板数据

```typescript
import { dailyPlanTemplates, dailyPlanDefaultSettings } from '@site/data/plan/dailyPlanTemplates'
```

**数据结构：**
```typescript
// data/plan/dailyPlanTemplates.ts
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
  defaultDuration: 30,
  autoCreateRecords: true,
}
```

**注意：** 
- 模板数据由开发人员直接在 `data/plan/dailyPlanTemplates.ts` 文件中维护
- 修改模板后需要重新构建项目才能生效
- 模板数据是只读的，用户不能在前端修改模板

### 1.2 获取指定日期的每日计划

```http
GET /api/plans/daily?date=2024-01-15
```

**查询参数：**
- `date`: 日期（YYYY-MM-DD），不传则默认为今天

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "plans": [
      {
        "template": {
          "id": "template_001",
          "name": "晨间阅读",
          "description": "每天早上阅读技术文章30分钟",
          "moduleCategory": "info",
          "subCategory": "学习",
          "priority": "high",
          "estimatedDuration": 30,
          "isActive": true,
          "weekdays": [1, 2, 3, 4, 5],
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        },
        "todayRecord": {
          "id": "record_20240115_001",
          "templateId": "template_001",
          "date": "2024-01-15",
          "status": "completed",
          "progress": 100,
          "actualDuration": 35,
          "notes": "今天阅读了React相关文章",
          "completedAt": "2024-01-15T08:30:00.000Z",
          "createdAt": "2024-01-15T07:00:00.000Z",
          "updatedAt": "2024-01-15T08:30:00.000Z"
        },
        "recentRecords": []
      }
    ],
    "statistics": {
      "total": 10,
      "completed": 8,
      "inProgress": 1,
      "pending": 1,
      "avgProgress": 85,
      "completionRate": 80,
      "avgDuration": 32,
      "activeTemplates": 10
    }
  }
}
```

### 1.3 创建每日计划执行记录

```http
POST /api/plans/daily/records
```

**请求体：**
```json
{
  "templateId": "template_001",
  "date": "2024-01-15",
  "status": "in-progress",
  "progress": 50,
  "actualDuration": 15,
  "notes": "进行中"
}
```

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "record_20240115_001",
    "templateId": "template_001",
    "date": "2024-01-15",
    "status": "in-progress",
    "progress": 50,
    "actualDuration": 15,
    "notes": "进行中",
    "createdAt": "2024-01-15T07:00:00.000Z",
    "updatedAt": "2024-01-15T07:00:00.000Z"
  }
}
```

### 1.4 更新每日计划执行记录

```http
PUT /api/plans/daily/records/:recordId
```

**请求体：**
```json
{
  "status": "completed",
  "progress": 100,
  "actualDuration": 35,
  "notes": "已完成",
  "completedAt": "2024-01-15T08:30:00.000Z"
}
```

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "record_20240115_001",
    "templateId": "template_001",
    "date": "2024-01-15",
    "status": "completed",
    "progress": 100,
    "actualDuration": 35,
    "notes": "已完成",
    "completedAt": "2024-01-15T08:30:00.000Z",
    "updatedAt": "2024-01-15T08:30:00.000Z"
  }
}
```

### 1.5 删除每日计划执行记录

```http
DELETE /api/plans/daily/records/:recordId
```

**响应：**
```json
{
  "code": 200,
  "message": "success"
}
```

## 二、阶段性计划相关接口

### 2.1 获取阶段性计划列表

```http
GET /api/plans/phase?status=all&category=info&startDate=2024-01-01&endDate=2024-01-31
```

**查询参数：**
- `status`: 状态筛选（all/pending/in-progress/completed），默认 all
- `category`: 模块类别筛选，可选
- `subCategory`: 子类目筛选，可选
- `startDate`: 开始日期筛选，可选
- `endDate`: 结束日期筛选，可选
- `page`: 页码，默认 1
- `pageSize`: 每页数量，默认 20

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "tasks": [
      {
        "id": "phase_001",
        "moduleCategory": "project",
        "name": "重构用户认证系统",
        "description": "将现有的JWT认证改为OAuth2.0",
        "subCategory": "后端开发",
        "progress": 60,
        "status": "in-progress",
        "plannedStartDate": "2024-01-01",
        "plannedEndDate": "2024-01-31",
        "actualStartDate": "2024-01-02",
        "actualEndDate": null,
        "plannedTime": "40小时",
        "actualTime": "25小时",
        "priority": "high",
        "tags": ["重构", "认证", "安全"],
        "createdAt": "2023-12-20T00:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 50,
      "totalPages": 3
    },
    "statistics": {
      "total": 50,
      "completed": 20,
      "inProgress": 25,
      "pending": 5,
      "avgProgress": 65,
      "onTimeCompletion": 18,
      "overdue": 2,
      "avgDelayDays": 3
    }
  }
}
```

### 2.2 创建阶段性计划

```http
POST /api/plans/phase
```

**请求体：**
```json
{
  "moduleCategory": "project",
  "name": "重构用户认证系统",
  "description": "将现有的JWT认证改为OAuth2.0",
  "subCategory": "后端开发",
  "progress": 0,
  "status": "pending",
  "plannedStartDate": "2024-01-01",
  "plannedEndDate": "2024-01-31",
  "plannedTime": "40小时",
  "priority": "high",
  "tags": ["重构", "认证", "安全"]
}
```

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "phase_001",
    "moduleCategory": "project",
    "name": "重构用户认证系统",
    "description": "将现有的JWT认证改为OAuth2.0",
    "subCategory": "后端开发",
    "progress": 0,
    "status": "pending",
    "plannedStartDate": "2024-01-01",
    "plannedEndDate": "2024-01-31",
    "plannedTime": "40小时",
    "priority": "high",
    "tags": ["重构", "认证", "安全"],
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### 2.3 更新阶段性计划

```http
PUT /api/plans/phase/:taskId
```

**请求体：**
```json
{
  "progress": 60,
  "status": "in-progress",
  "actualStartDate": "2024-01-02",
  "actualTime": "25小时"
}
```

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "phase_001",
    "moduleCategory": "project",
    "name": "重构用户认证系统",
    "description": "将现有的JWT认证改为OAuth2.0",
    "subCategory": "后端开发",
    "progress": 60,
    "status": "in-progress",
    "plannedStartDate": "2024-01-01",
    "plannedEndDate": "2024-01-31",
    "actualStartDate": "2024-01-02",
    "actualEndDate": null,
    "plannedTime": "40小时",
    "actualTime": "25小时",
    "priority": "high",
    "tags": ["重构", "认证", "安全"],
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### 2.4 删除阶段性计划

```http
DELETE /api/plans/phase/:taskId
```

**响应：**
```json
{
  "code": 200,
  "message": "success"
}
```

## 三、统计相关接口

### 3.1 获取月度统计

```http
GET /api/statistics/monthly?year=2024&month=1
```

**查询参数：**
- `year`: 年份（必填）
- `month`: 月份 1-12（必填）

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "statistics": {
      "year": 2024,
      "month": 1,
      "dailyPlan": {
        "total": 300,
        "completed": 240,
        "inProgress": 30,
        "pending": 30,
        "avgProgress": 80,
        "completionRate": 80,
        "avgDuration": 32,
        "activeTemplates": 10
      },
      "phaseTask": {
        "total": 20,
        "completed": 12,
        "inProgress": 6,
        "pending": 2,
        "avgProgress": 70,
        "onTimeCompletion": 10,
        "overdue": 2,
        "avgDelayDays": 3
      },
      "totalTasks": 320,
      "totalCompleted": 252,
      "completionRate": 78.75
    }
  }
}
```

### 3.2 获取季度统计

```http
GET /api/statistics/quarterly?year=2024&quarter=1
```

**查询参数：**
- `year`: 年份（必填）
- `quarter`: 季度 1-4（必填）

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "statistics": {
      "year": 2024,
      "quarter": 1,
      "monthlyStats": [
        {
          "year": 2024,
          "month": 1,
          "dailyPlan": { /* ... */ },
          "phaseTask": { /* ... */ },
          "totalTasks": 320,
          "totalCompleted": 252,
          "completionRate": 78.75
        },
        {
          "year": 2024,
          "month": 2,
          "dailyPlan": { /* ... */ },
          "phaseTask": { /* ... */ },
          "totalTasks": 310,
          "totalCompleted": 248,
          "completionRate": 80
        },
        {
          "year": 2024,
          "month": 3,
          "dailyPlan": { /* ... */ },
          "phaseTask": { /* ... */ },
          "totalTasks": 330,
          "totalCompleted": 264,
          "completionRate": 80
        }
      ],
      "dailyPlan": {
        "total": 900,
        "completed": 720,
        "inProgress": 90,
        "pending": 90,
        "avgProgress": 80,
        "completionRate": 80,
        "avgDuration": 32,
        "activeTemplates": 10
      },
      "phaseTask": {
        "total": 60,
        "completed": 36,
        "inProgress": 18,
        "pending": 6,
        "avgProgress": 70,
        "onTimeCompletion": 30,
        "overdue": 6,
        "avgDelayDays": 3
      },
      "totalTasks": 960,
      "totalCompleted": 756,
      "completionRate": 78.75,
      "trend": {
        "taskGrowth": 3.1,
        "completionGrowth": 1.6
      }
    }
  }
}
```

### 3.3 获取年度统计

```http
GET /api/statistics/yearly?year=2024
```

**查询参数：**
- `year`: 年份（必填）

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "statistics": {
      "year": 2024,
      "quarterlyStats": [
        {
          "year": 2024,
          "quarter": 1,
          "monthlyStats": [ /* ... */ ],
          "dailyPlan": { /* ... */ },
          "phaseTask": { /* ... */ },
          "totalTasks": 960,
          "totalCompleted": 756,
          "completionRate": 78.75,
          "trend": { /* ... */ }
        },
        {
          "year": 2024,
          "quarter": 2,
          /* ... */
        },
        {
          "year": 2024,
          "quarter": 3,
          /* ... */
        },
        {
          "year": 2024,
          "quarter": 4,
          /* ... */
        }
      ],
      "dailyPlan": {
        "total": 3600,
        "completed": 2880,
        "inProgress": 360,
        "pending": 360,
        "avgProgress": 80,
        "completionRate": 80,
        "avgDuration": 32,
        "activeTemplates": 10
      },
      "phaseTask": {
        "total": 240,
        "completed": 144,
        "inProgress": 72,
        "pending": 24,
        "avgProgress": 70,
        "onTimeCompletion": 120,
        "overdue": 24,
        "avgDelayDays": 3
      },
      "totalTasks": 3840,
      "totalCompleted": 3024,
      "completionRate": 78.75,
      "topCategories": [
        { "category": "info", "count": 1200 },
        { "category": "project", "count": 1000 },
        { "category": "blog", "count": 800 },
        { "category": "invest", "count": 600 },
        { "category": "operate", "count": 240 }
      ]
    }
  }
}
```

## 四、错误响应格式

所有接口的错误响应统一格式：

```json
{
  "code": 400,
  "message": "错误描述",
  "data": null
}
```

**常见错误码：**
- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权
- `404`: 资源不存在
- `500`: 服务器内部错误

## 五、注意事项

1. **日期格式**：所有日期字段统一使用 `YYYY-MM-DD` 格式（字符串）
2. **时间格式**：所有时间戳统一使用 ISO 8601 格式（`YYYY-MM-DDTHH:mm:ss.sssZ`）
3. **分页**：列表接口支持分页，默认每页 20 条
4. **筛选**：阶段性计划列表支持多条件组合筛选
5. **统计缓存**：月度、季度、年度统计建议缓存，减少数据库查询压力
6. **权限控制**：所有接口需要用户认证，建议使用 JWT Token

