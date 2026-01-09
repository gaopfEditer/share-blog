# 每日计划模板配置

本目录用于存储每日计划的模板配置数据。

## 文件说明

### `dailyPlanTemplates.ts`

每日计划模板配置文件，包含所有可用的每日计划模板。

**数据结构：**

- `dailyPlanTemplates`: 每日计划模板数组
- `dailyPlanDefaultSettings`: 默认配置设置

## 使用方式

前端代码中直接导入使用：

```typescript
import { dailyPlanTemplates, dailyPlanDefaultSettings } from '@site/data/plan/dailyPlanTemplates'
```

## 维护说明

1. **添加新模板**：在 `dailyPlanTemplates` 数组中添加新的模板对象
2. **修改模板**：直接编辑对应的模板对象
3. **禁用模板**：将模板的 `isActive` 字段设置为 `false`
4. **修改后**：需要重新构建项目才能生效

## 模板字段说明

- `id`: 模板唯一标识（必填）
- `name`: 计划名称（必填）
- `description`: 详细描述（可选）
- `moduleCategory`: 模块类别（info/invest/operate/blog/project）
- `subCategory`: 子类目（可选）
- `priority`: 优先级（low/medium/high）
- `estimatedDuration`: 预计时长（分钟）
- `isActive`: 是否启用该模板
- `weekdays`: 适用的星期几数组（0=周日，1=周一...6=周六），不设置表示每天
- `createdAt/updatedAt`: 创建和更新时间

## 示例

```typescript
{
  id: 'template_001',
  name: '晨间阅读',
  description: '每天早上阅读技术文章30分钟',
  moduleCategory: 'info',
  subCategory: '学习',
  priority: 'high',
  estimatedDuration: 30,
  isActive: true,
  weekdays: [1, 2, 3, 4, 5], // 周一到周五
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}
```

