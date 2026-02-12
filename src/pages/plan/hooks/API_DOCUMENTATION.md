# 任务计划 API 文档

## 基础路径
- 任务计划：`/admin/task/plan`
- 子任务：`/admin/task/planSub`

**注意**：所有接口都**不需要 token 验证**，可以直接访问。

---

## 一、任务计划 (Task Plan) API

### 1. 新增任务
**接口地址**：`POST /admin/task/plan/add`

**请求参数**：
```json
{
  "moduleCategory": "info",              // 模块分类（可选，字符串，最大50字符）
  "name": "整理信息来源",                  // 名称（必填，字符串）
  "description": "发现社区或平台...",     // 描述（可选，文本）
  "subCategory": "",                      // 子分类（可选，字符串，最大50字符）
  "progress": 0,                          // 进度 0-100（可选，数字，默认0）
  "plannedStartDate": "2026-01-09",       // 计划开始日期（可选，日期格式：YYYY-MM-DD）
  "plannedEndDate": "2026-12-09",         // 计划结束日期（可选，日期格式：YYYY-MM-DD）
  "actualStartDate": "2026-01-10",        // 实际开始日期（可选，日期格式：YYYY-MM-DD）
  "actualEndDate": "",                    // 实际结束日期（可选，日期格式：YYYY-MM-DD）
  "plannedTime": "100",                   // 计划时间（小时）（可选，字符串）
  "actualTime": "",                       // 实际时间（小时）（可选，字符串）
  "priority": "中",                       // 优先级（可选，枚举：'低'|'中'|'高'，默认'中'）
  "tags": [],                             // 标签（可选，字符串数组，JSON格式）
  "status": "待开始"                      // 状态（可选，枚举：'待开始'|'进行中'|'已完成'|'已暂停'|'已取消'，默认'待开始'）
}
```

**返回示例**：
```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "id": 1,
    "moduleCategory": "info",
    "name": "整理信息来源",
    "description": "发现社区或平台...",
    "progress": 0,
    "status": "待开始",
    "createTime": "2026-01-09 14:05:03",
    "updateTime": "2026-01-09 14:05:03"
  }
}
```

---

### 2. 删除任务
**接口地址**：`POST /admin/task/plan/delete`

**请求参数**：
```json
{
  "ids": [1, 2, 3]  // 任务ID数组（必填，数字数组）
}
```

**说明**：删除任务时会自动级联删除关联的子任务。

**返回示例**：
```json
{
  "code": 1000,
  "message": "success"
}
```

---

### 3. 更新任务
**接口地址**：`POST /admin/task/plan/update`

**请求参数**：
```json
{
  "id": 1,                                // 任务ID（必填，数字）
  "moduleCategory": "info",               // 模块分类（可选）
  "name": "整理信息来源",                  // 名称（可选）
  "description": "更新后的描述",           // 描述（可选）
  "subCategory": "",                      // 子分类（可选）
  "progress": 50,                         // 进度（可选）
  "plannedStartDate": "2026-01-09",       // 计划开始日期（可选）
  "plannedEndDate": "2026-12-09",         // 计划结束日期（可选）
  "actualStartDate": "2026-01-10",        // 实际开始日期（可选）
  "actualEndDate": "",                    // 实际结束日期（可选）
  "plannedTime": "100",                   // 计划时间（可选）
  "actualTime": "50",                     // 实际时间（可选）
  "priority": "高",                       // 优先级（可选）
  "tags": ["标签1", "标签2"],             // 标签（可选）
  "status": "进行中"                      // 状态（可选）
}
```

**返回示例**：
```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "id": 1,
    "name": "整理信息来源",
    "progress": 50,
    "status": "进行中",
    "updateTime": "2026-01-10 10:00:00"
  }
}
```

---

### 4. 获取任务详情
**接口地址**：`POST /admin/task/plan/info`

**请求参数**：
```json
{
  "id": 1  // 任务ID（必填，数字）
}
```

**返回示例**：
```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "id": 1,
    "moduleCategory": "info",
    "name": "整理信息来源",
    "description": "发现社区或平台...",
    "subCategory": "",
    "progress": 0,
    "plannedStartDate": "2026-01-09",
    "plannedEndDate": "2026-12-09",
    "actualStartDate": "2026-01-10",
    "actualEndDate": null,
    "plannedTime": "100",
    "actualTime": "",
    "priority": "中",
    "tags": [],
    "status": "待开始",
    "createTime": "2026-01-09 14:05:03",
    "updateTime": "2026-01-10 02:57:22",
    "tenantId": null
  }
}
```

---

### 5. 获取任务列表（不分页）
**接口地址**：`POST /admin/task/plan/list`

**请求参数**：
```json
{
  "status": "待开始"  // 状态筛选（可选，枚举：'待开始'|'进行中'|'已完成'|'已暂停'|'已取消'）
}
```

**返回示例**：
```json
{
  "code": 1000,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "整理信息来源",
      "status": "待开始",
      "progress": 0,
      "createTime": "2026-01-09 14:05:03"
    }
  ]
}
```

---

### 6. 分页查询任务
**接口地址**：`POST /admin/task/plan/page`

**请求参数**：
```json
{
  "keyWord": "整理",                      // 关键词模糊搜索（可选，字符串，搜索字段：name、description）
  "status": "待开始",                     // 状态筛选（可选，枚举）
  "priority": "中",                       // 优先级筛选（可选，枚举：'低'|'中'|'高'）
  "moduleCategory": "info",               // 模块分类筛选（可选，字符串）
  "name": "整理",                         // 名称模糊搜索（可选，字符串）
  "page": 1,                              // 页码（可选，数字，默认1）
  "size": 10,                             // 每页数量（可选，数字，默认10）
  "sort": "desc",                         // 排序方向（可选，'asc'|'desc'，默认'desc'）
  "order": "createTime"                   // 排序字段（可选，字符串，默认'createTime'）
}
```

**返回示例**：
```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "整理信息来源",
        "status": "待开始",
        "progress": 0,
        "createTime": "2026-01-09 14:05:03"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 10,
      "total": 1
    }
  }
}
```

---

### 7. 获取任务详情（包含子任务）
**接口地址**：`POST /admin/task/plan/infoWithSub`

**请求参数**：
```json
{
  "id": 1  // 任务ID（必填，数字）
}
```

**返回示例**：
```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "id": 1,
    "name": "整理信息来源",
    "description": "发现社区或平台...",
    "status": "待开始",
    "progress": 0,
    "subTasks": [
      {
        "id": 1,
        "planId": 1,
        "content": "技术博客-主要找产品运营创意方向...",
        "completed": 0,
        "order": 0
      },
      {
        "id": 2,
        "planId": 1,
        "content": "tg群组-技术资源、运营资源等",
        "completed": 0,
        "order": 1
      }
    ]
  }
}
```

---

### 8. 保存任务（包含子任务）
**接口地址**：`POST /admin/task/plan/saveWithSub`

**请求参数**：
```json
{
  "id": 1,                                // 任务ID（可选，有ID为更新，无ID为新增）
  "moduleCategory": "info",               // 模块分类（可选）
  "name": "整理信息来源",                  // 名称（必填）
  "description": "发现社区或平台...",     // 描述（可选）
  "subCategory": "",                      // 子分类（可选）
  "progress": 0,                          // 进度（可选）
  "plannedStartDate": "2026-01-09",       // 计划开始日期（可选）
  "plannedEndDate": "2026-12-09",         // 计划结束日期（可选）
  "actualStartDate": "2026-01-10",        // 实际开始日期（可选）
  "actualEndDate": "",                    // 实际结束日期（可选）
  "plannedTime": "100",                   // 计划时间（可选）
  "actualTime": "",                       // 实际时间（可选）
  "priority": "中",                       // 优先级（可选）
  "tags": [],                             // 标签（可选）
  "status": "待开始",                     // 状态（可选）
  "subTasks": [                           // 子任务数组（可选）
    {
      "content": "技术博客-主要找产品运营创意方向...",  // 内容（必填）
      "completed": false,                  // 是否完成（可选，布尔值，默认false）
      "order": 0                           // 排序（可选，数字，默认按数组索引）
    },
    {
      "content": "tg群组-技术资源、运营资源等",
      "completed": false,
      "order": 1
    }
  ]
}
```

**说明**：
- 如果传入 `id`，则为更新操作，会先删除旧的子任务，再保存新的子任务
- 如果不传 `id`，则为新增操作
- `subTasks` 中的 `id` 字段会被忽略，系统会自动生成

**返回示例**：
```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "id": 1,
    "name": "整理信息来源",
    "status": "待开始",
    "subTasks": [
      {
        "id": 1,
        "planId": 1,
        "content": "技术博客-主要找产品运营创意方向...",
        "completed": 0,
        "order": 0
      }
    ]
  }
}
```

---

## 二、子任务 (Task Plan Sub) API

### 1. 新增子任务
**接口地址**：`POST /admin/task/planSub/add`

**请求参数**：
```json
{
  "planId": 1,                            // 任务计划ID（必填，数字）
  "content": "技术博客-主要找产品运营创意方向...",  // 内容（必填，文本）
  "completed": 0,                         // 是否完成（可选，数字：0-未完成，1-已完成，默认0）
  "order": 0                              // 排序（可选，数字，默认0）
}
```

**返回示例**：
```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "id": 1,
    "planId": 1,
    "content": "技术博客-主要找产品运营创意方向...",
    "completed": 0,
    "order": 0,
    "createTime": "2026-01-09 14:05:03"
  }
}
```

---

### 2. 删除子任务
**接口地址**：`POST /admin/task/planSub/delete`

**请求参数**：
```json
{
  "ids": [1, 2, 3]  // 子任务ID数组（必填，数字数组）
}
```

**返回示例**：
```json
{
  "code": 1000,
  "message": "success"
}
```

---

### 3. 更新子任务
**接口地址**：`POST /admin/task/planSub/update`

**请求参数**：
```json
{
  "id": 1,                                // 子任务ID（必填，数字）
  "planId": 1,                            // 任务计划ID（可选，数字）
  "content": "更新后的内容",               // 内容（可选，文本）
  "completed": 1,                         // 是否完成（可选，数字：0|1）
  "order": 2                              // 排序（可选，数字）
}
```

**返回示例**：
```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "id": 1,
    "planId": 1,
    "content": "更新后的内容",
    "completed": 1,
    "order": 2,
    "updateTime": "2026-01-10 10:00:00"
  }
}
```

---

### 4. 获取子任务详情
**接口地址**：`POST /admin/task/planSub/info`

**请求参数**：
```json
{
  "id": 1  // 子任务ID（必填，数字）
}
```

**返回示例**：
```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "id": 1,
    "planId": 1,
    "content": "技术博客-主要找产品运营创意方向...",
    "completed": 0,
    "order": 0,
    "createTime": "2026-01-09 14:05:03",
    "updateTime": "2026-01-09 14:05:03"
  }
}
```

---

### 5. 获取子任务列表（不分页）
**接口地址**：`POST /admin/task/planSub/list`

**请求参数**：
```json
{
  "planId": 1  // 任务计划ID（可选，数字，用于筛选特定任务的子任务）
}
```

**返回示例**：
```json
{
  "code": 1000,
  "message": "success",
  "data": [
    {
      "id": 1,
      "planId": 1,
      "content": "技术博客-主要找产品运营创意方向...",
      "completed": 0,
      "order": 0
    },
    {
      "id": 2,
      "planId": 1,
      "content": "tg群组-技术资源、运营资源等",
      "completed": 0,
      "order": 1
    }
  ]
}
```

---

### 6. 分页查询子任务
**接口地址**：`POST /admin/task/planSub/page`

**请求参数**：
```json
{
  "planId": 1,                            // 任务计划ID筛选（可选，数字）
  "completed": 0,                         // 完成状态筛选（可选，数字：0|1）
  "page": 1,                              // 页码（可选，数字，默认1）
  "size": 10,                             // 每页数量（可选，数字，默认10）
  "sort": "asc",                          // 排序方向（可选，'asc'|'desc'，默认'asc'）
  "order": "order"                        // 排序字段（可选，字符串，默认'order'）
}
```

**返回示例**：
```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "planId": 1,
        "content": "技术博客-主要找产品运营创意方向...",
        "completed": 0,
        "order": 0
      }
    ],
    "pagination": {
      "page": 1,
      "size": 10,
      "total": 1
    }
  }
}
```

---

### 7. 切换完成状态
**接口地址**：`POST /admin/task/planSub/toggleComplete`

**请求参数**：
```json
{
  "id": 1  // 子任务ID（必填，数字）
}
```

**说明**：切换子任务的完成状态，如果当前是未完成(0)，则切换为已完成(1)，反之亦然。

**返回示例**：
```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "id": 1,
    "planId": 1,
    "content": "技术博客-主要找产品运营创意方向...",
    "completed": 1,  // 状态已切换
    "order": 0,
    "updateTime": "2026-01-10 10:00:00"
  }
}
```

---

### 8. 批量更新排序
**接口地址**：`POST /admin/task/planSub/updateOrder`

**请求参数**：
```json
{
  "items": [                              // 排序项数组（必填，数组）
    {
      "id": 1,                            // 子任务ID（必填，数字）
      "order": 0                          // 新排序值（必填，数字）
    },
    {
      "id": 2,
      "order": 1
    },
    {
      "id": 3,
      "order": 2
    }
  ]
}
```

**说明**：批量更新多个子任务的排序值。

**返回示例**：
```json
{
  "code": 1000,
  "message": "success"
}
```

---

## 三、字段说明

### 任务计划字段

| 字段名 | 类型 | 说明 | 可选值 |
|--------|------|------|--------|
| id | number | 任务ID（自增） | - |
| moduleCategory | string | 模块分类 | 任意字符串，最大50字符 |
| name | string | 名称 | 必填 |
| description | text | 描述 | 可选 |
| subCategory | string | 子分类 | 任意字符串，最大50字符 |
| progress | number | 进度 | 0-100，默认0 |
| plannedStartDate | date | 计划开始日期 | YYYY-MM-DD格式 |
| plannedEndDate | date | 计划结束日期 | YYYY-MM-DD格式 |
| actualStartDate | date | 实际开始日期 | YYYY-MM-DD格式 |
| actualEndDate | date | 实际结束日期 | YYYY-MM-DD格式 |
| plannedTime | string | 计划时间（小时） | 任意字符串 |
| actualTime | string | 实际时间（小时） | 任意字符串 |
| priority | string | 优先级 | '低'、'中'、'高' |
| tags | array | 标签 | 字符串数组，JSON格式 |
| status | string | 状态 | '待开始'、'进行中'、'已完成'、'已暂停'、'已取消' |
| createTime | string | 创建时间 | 自动生成 |
| updateTime | string | 更新时间 | 自动更新 |
| tenantId | number | 租户ID | 可选 |

### 子任务字段

| 字段名 | 类型 | 说明 | 可选值 |
|--------|------|------|--------|
| id | number | 子任务ID（自增） | - |
| planId | number | 任务计划ID | 必填，关联task_plan.id |
| content | text | 内容 | 必填 |
| completed | number | 是否完成 | 0-未完成，1-已完成，默认0 |
| order | number | 排序 | 数字，默认0 |
| createTime | string | 创建时间 | 自动生成 |
| updateTime | string | 更新时间 | 自动更新 |
| tenantId | number | 租户ID | 可选 |

---

## 四、注意事项

1. **所有接口都不需要 token 验证**，可以直接访问
2. **日期格式**：使用 `YYYY-MM-DD` 格式（如：`2026-01-09`）
3. **时间格式**：数据库存储为 `YYYY-MM-DD HH:mm:ss` 格式
4. **JSON字段**：`tags` 字段需要传递JSON数组格式（如：`["标签1", "标签2"]`）
5. **级联删除**：删除任务时，会自动删除关联的所有子任务
6. **排序**：子任务默认按 `order` 字段升序排列
7. **分页**：`page` 接口默认按创建时间降序排列，`list` 接口也按创建时间降序排列
