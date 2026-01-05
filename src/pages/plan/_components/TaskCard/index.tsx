import React from 'react'
import { MagicCard } from '@site/src/components/magicui/magic-card'
import { cn } from '@site/src/lib/utils'
import type { Task } from '../../types'
import styles from './styles.module.css'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (id: string) => void
  onUpdateProgress?: (id: string, progress: number) => void
}

const STATUS_MAP = {
  pending: { label: '待开始', color: '#9ca3af' },
  'in-progress': { label: '进行中', color: '#3b82f6' },
  completed: { label: '已完成', color: '#10b981' },
}

const MODULE_CATEGORY_MAP: Record<string, string> = {
  info: '信息',
  invest: '投资',
  operate: '运营',
  blog: '杂谈',
  project: '项目',
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onUpdateProgress,
}: TaskCardProps) {
  const status = STATUS_MAP[task.status]

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getProgressColor = (progress: number) => {
    if (progress === 100) return '#10b981'
    if (progress >= 50) return '#3b82f6'
    return '#f59e0b'
  }

  return (
    <MagicCard className={cn('card', styles.taskCard)}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <h4 className={styles.taskName}>{task.name}</h4>
          <span
            className={styles.statusBadge}
            style={{ backgroundColor: status.color + '20', color: status.color }}
          >
            {status.label}
          </span>
        </div>
        <div className={styles.headerRight}>
          {onEdit && (
            <button
              className={cn('button button--sm button--secondary', styles.actionButton)}
              onClick={() => onEdit(task)}
            >
              编辑
            </button>
          )}
          {onDelete && (
            <button
              className={cn('button button--sm button--danger', styles.actionButton)}
              onClick={() => onDelete(task.id)}
            >
              删除
            </button>
          )}
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>模块类别:</span>
          <span className={styles.metaValue}>
            {MODULE_CATEGORY_MAP[task.moduleCategory] || task.moduleCategory}
          </span>
        </div>

        {task.subCategory && (
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>子类目:</span>
            <span className={styles.metaValue}>{task.subCategory}</span>
          </div>
        )}

        {task.description && (
          <div className={styles.description}>{task.description}</div>
        )}

        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>完成度</span>
            <span
              className={styles.progressPercent}
              style={{ color: getProgressColor(task.progress) }}
            >
              {task.progress}%
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${task.progress}%`,
                backgroundColor: getProgressColor(task.progress),
              }}
            />
          </div>
          {onUpdateProgress && (
            <input
              type="range"
              min="0"
              max="100"
              value={task.progress}
              onChange={e =>
                onUpdateProgress(task.id, parseInt(e.target.value))
              }
              className={styles.progressSlider}
            />
          )}
        </div>

        <div className={styles.timeInfo}>
          {task.plannedTime && (
            <div className={styles.timeRow}>
              <span className={styles.timeLabel}>计划时间:</span>
              <span className={styles.timeValue}>{formatDate(task.plannedTime)}</span>
            </div>
          )}
          {task.actualTime && (
            <div className={styles.timeRow}>
              <span className={styles.timeLabel}>实际时间:</span>
              <span className={styles.timeValue}>{formatDate(task.actualTime)}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.createdAt}>
          创建于 {formatDate(task.createdAt)}
        </span>
      </div>
    </MagicCard>
  )
}

