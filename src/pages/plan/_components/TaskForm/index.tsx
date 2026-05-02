import React, { useState, FormEvent } from 'react'
import { cn } from '@site/src/lib/utils'
import type { TaskFormData } from '../../types'
import styles from './styles.module.css'

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void
  onCancel?: () => void
  initialData?: Partial<TaskFormData>
  submitText?: string
}

const MODULE_CATEGORIES = [
  { label: '信息', value: 'info' },
  { label: '投资', value: 'invest' },
  { label: '运营', value: 'operate' },
  { label: '杂谈', value: 'blog' },
  { label: '项目', value: 'project' },
]

export default function TaskForm({
  onSubmit,
  onCancel,
  initialData,
  submitText = '创建任务',
}: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    moduleCategory: initialData?.moduleCategory || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    subCategory: initialData?.subCategory || '',
    progress: initialData?.progress || 0,
    plannedStartDate: initialData?.plannedStartDate || '',
    plannedEndDate: initialData?.plannedEndDate || '',
    actualStartDate: initialData?.actualStartDate || '',
    actualEndDate: initialData?.actualEndDate || '',
    plannedTime: initialData?.plannedTime || '',
    actualTime: initialData?.actualTime || '',
    priority: initialData?.priority || 'medium',
    tags: initialData?.tags || [],
    status: initialData?.status || 'pending',
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(formData)
    // 重置表单
    setFormData({
      moduleCategory: '',
      name: '',
      description: '',
      subCategory: '',
      progress: 0,
      plannedStartDate: '',
      plannedEndDate: '',
      actualStartDate: '',
      actualEndDate: '',
      plannedTime: '',
      actualTime: '',
      priority: 'medium',
      tags: [],
      status: 'pending',
    })
  }

  const handleChange = (
    field: keyof TaskFormData,
    value: string | number,
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className={styles.taskForm}>
      <div className={styles.formRow}>
        <label className={styles.label}>
          模块类别
          {' '}
          <span className={styles.required}>*</span>
        </label>
        <select
          className={styles.input}
          value={formData.moduleCategory}
          onChange={e => handleChange('moduleCategory', e.target.value)}
          required
        >
          <option value="">请选择模块类别</option>
          {MODULE_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formRow}>
        <label className={styles.label}>
          任务名称
          {' '}
          <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={styles.input}
          value={formData.name}
          onChange={e => handleChange('name', e.target.value)}
          placeholder="请输入任务名称"
          required
        />
      </div>

      <div className={styles.formRow}>
        <label className={styles.label}>描述</label>
        <textarea
          className={cn(styles.input, styles.textarea)}
          value={formData.description}
          onChange={e => handleChange('description', e.target.value)}
          placeholder="请输入任务描述"
          rows={3}
        />
      </div>

      <div className={styles.formRow}>
        <label className={styles.label}>子类目</label>
        <input
          type="text"
          className={styles.input}
          value={formData.subCategory}
          onChange={e => handleChange('subCategory', e.target.value)}
          placeholder="请输入子类目（可动态创建）"
        />
        <small className={styles.hint}>
          子类目可以自由输入，将自动创建并挂载到当前模块类目下
        </small>
      </div>

      <div className={styles.formRow}>
        <label className={styles.label}>
          完成度
          {' '}
          <span className={styles.required}>*</span>
        </label>
        <div className={styles.progressContainer}>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.progress}
            onChange={e => handleChange('progress', parseInt(e.target.value))}
            className={styles.range}
          />
          <span className={styles.progressValue}>
            {formData.progress}
            %
          </span>
        </div>
      </div>

      <div className={styles.formRow}>
        <label className={styles.label}>状态</label>
        <select
          className={styles.input}
          value={formData.status}
          onChange={e => handleChange('status', e.target.value)}
        >
          <option value="pending">待开始</option>
          <option value="in-progress">进行中</option>
          <option value="completed">已完成</option>
        </select>
      </div>

      <div className={styles.formRow}>
        <label className={styles.label}>计划开始日期</label>
        <input
          type="date"
          className={styles.input}
          value={formData.plannedStartDate}
          onChange={e => handleChange('plannedStartDate', e.target.value)}
          required
        />
      </div>

      <div className={styles.formRow}>
        <label className={styles.label}>计划结束日期</label>
        <input
          type="date"
          className={styles.input}
          value={formData.plannedEndDate}
          onChange={e => handleChange('plannedEndDate', e.target.value)}
          required
        />
      </div>

      <div className={styles.formRow}>
        <label className={styles.label}>实际开始日期</label>
        <input
          type="date"
          className={styles.input}
          value={formData.actualStartDate || ''}
          onChange={e => handleChange('actualStartDate', e.target.value)}
        />
      </div>

      <div className={styles.formRow}>
        <label className={styles.label}>实际结束日期</label>
        <input
          type="date"
          className={styles.input}
          value={formData.actualEndDate || ''}
          onChange={e => handleChange('actualEndDate', e.target.value)}
        />
      </div>

      <div className={styles.formRow}>
        <label className={styles.label}>计划时间（总时长）</label>
        <input
          type="text"
          className={styles.input}
          value={formData.plannedTime}
          onChange={e => handleChange('plannedTime', e.target.value)}
          placeholder="如：40小时"
        />
      </div>

      <div className={styles.formRow}>
        <label className={styles.label}>实际时间（总时长）</label>
        <input
          type="text"
          className={styles.input}
          value={formData.actualTime || ''}
          onChange={e => handleChange('actualTime', e.target.value)}
          placeholder="如：45小时"
        />
      </div>

      <div className={styles.formRow}>
        <label className={styles.label}>优先级</label>
        <select
          className={styles.input}
          value={formData.priority}
          onChange={e => handleChange('priority', e.target.value)}
        >
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
        </select>
      </div>

      <div className={styles.formActions}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={cn('button button--secondary', styles.cancelButton)}
          >
            取消
          </button>
        )}
        <button
          type="submit"
          className={cn('button button--primary', styles.submitButton)}
        >
          {submitText}
        </button>
      </div>
    </form>
  )
}
