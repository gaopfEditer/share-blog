import React, { useState, useRef, useEffect } from 'react'
import { MagicCard } from '@site/src/components/magicui/magic-card'
import { cn } from '@site/src/lib/utils'
import ProgressSlider from '../ProgressSlider'
import SubTaskEditor from '../SubTaskEditor'
import type { Task, SubTask } from '../../types'
import styles from './styles.module.css'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (id: string) => void
  onUpdateProgress?: (id: string, progress: number) => void
  onUpdateSubTasks?: (id: string, subTasks: SubTask[]) => void
  getTaskWithSubTasks?: (id: string) => Promise<SubTask[] | null>
}

const STATUS_MAP = {
  'pending': { label: '待开始', color: '#9ca3af' },
  'in-progress': { label: '进行中', color: '#3b82f6' },
  'completed': { label: '已完成', color: '#10b981' },
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
  onUpdateSubTasks,
  getTaskWithSubTasks,
}: TaskCardProps) {
  const status = STATUS_MAP[task.status]
  const [showSubTaskEditor, setShowSubTaskEditor] = useState(false)
  const [showSubTaskTooltip, setShowSubTaskTooltip] = useState(false)
  const [subTasks, setSubTasks] = useState<SubTask[]>(task.subTasks || [])
  const [loadingSubTasks, setLoadingSubTasks] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // 处理双击事件
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowSubTaskEditor(true)
  }

  // 处理悬浮显示子任务
  useEffect(() => {
    const handleMouseEnter = () => {
      // 如果有 getTaskWithSubTasks 函数，则调用 API 获取子任务
      if (getTaskWithSubTasks) {
        setLoadingSubTasks(true)
        getTaskWithSubTasks(task.id)
          .then((fetchedSubTasks) => {
            if (fetchedSubTasks) {
              setSubTasks(fetchedSubTasks)
              if (fetchedSubTasks.length > 0) {
                setShowSubTaskTooltip(true)
              }
            }
          })
          .catch((error) => {
            console.error('Failed to fetch sub tasks:', error)
            // 如果 API 调用失败，使用本地已有的子任务
            if (task.subTasks && task.subTasks.length > 0) {
              setSubTasks(task.subTasks)
              setShowSubTaskTooltip(true)
            }
          })
          .finally(() => {
            setLoadingSubTasks(false)
          })
      }
      else {
        // 如果没有 getTaskWithSubTasks 函数，使用本地已有的子任务
        if (task.subTasks && task.subTasks.length > 0) {
          setSubTasks(task.subTasks)
          setShowSubTaskTooltip(true)
        }
      }
    }

    const handleMouseLeave = () => {
      setShowSubTaskTooltip(false)
    }

    const card = cardRef.current
    if (card) {
      card.addEventListener('mouseenter', handleMouseEnter)
      card.addEventListener('mouseleave', handleMouseLeave)
      return () => {
        card.removeEventListener('mouseenter', handleMouseEnter)
        card.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
    return undefined
  }, [task.id, task.subTasks, getTaskWithSubTasks])

  // 定位悬浮提示框
  useEffect(() => {
    if (showSubTaskTooltip && cardRef.current && tooltipRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect()
      const tooltip = tooltipRef.current
      tooltip.style.top = `${cardRect.bottom + 8}px`
      tooltip.style.left = `${cardRect.left}px`
    }
  }, [showSubTaskTooltip])

  const handleSaveSubTasks = (subTasks: SubTask[]) => {
    if (onUpdateSubTasks) {
      onUpdateSubTasks(task.id, subTasks)
    }
    setShowSubTaskEditor(false)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const formatDateTime = (dateString: string) => {
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
    <>
      <div
        ref={cardRef}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: 'pointer' }}
      >
        <MagicCard className={cn('card', styles.taskCard)}>
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <h4 className={styles.taskName}>{task.name}</h4>
              <div className={styles.badgeContainer}>
                <span
                  className={styles.statusBadge}
                  style={{ backgroundColor: status.color + '20', color: status.color }}
                >
                  {status.label}
                </span>
                {task.subCategory && (
                  <span className={styles.subCategoryTag}>
                    {task.subCategory}
                  </span>
                )}
              </div>
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

            {task.description && (
              <div className={styles.description}>{task.description}</div>
            )}

            {subTasks.length > 0 && (
              <div className={styles.subTaskIndicator}>
                <span className={styles.subTaskCount}>
                  {subTasks.filter(st => st.completed).length}
                  {' '}
                  /
                  {subTasks.length}
                  {' '}
                  步骤已完成
                </span>
              </div>
            )}

            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>完成度</span>
                <span
                  className={styles.progressPercent}
                  style={{ color: getProgressColor(task.progress) }}
                >
                  {task.progress}
                  %
                </span>
              </div>
              <ProgressSlider
                progress={task.progress}
                onChange={
                  onUpdateProgress
                    ? progress => onUpdateProgress(task.id, progress)
                    : undefined
                }
                getProgressColor={getProgressColor}
              />
            </div>

            <div className={styles.timeInfo}>
              <div className={styles.timeRow}>
                <span className={styles.timeLabel}>计划时间:</span>
                <span className={styles.timeValue}>
                  {task.plannedStartDate && task.plannedEndDate
                    ? `${formatDate(task.plannedStartDate)} ~ ${formatDate(task.plannedEndDate)}`
                    : '-'}
                </span>
              </div>
              {task.actualStartDate && (
                <div className={styles.timeRow}>
                  <span className={styles.timeLabel}>实际开始:</span>
                  <span className={styles.timeValue}>{formatDate(task.actualStartDate)}</span>
                </div>
              )}
              {task.actualEndDate && (
                <div className={styles.timeRow}>
                  <span className={styles.timeLabel}>实际结束:</span>
                  <span className={styles.timeValue}>{formatDate(task.actualEndDate)}</span>
                </div>
              )}
              {task.plannedTime && (
                <div className={styles.timeRow}>
                  <span className={styles.timeLabel}>计划时长:</span>
                  <span className={styles.timeValue}>{task.plannedTime}</span>
                </div>
              )}
              {task.actualTime && (
                <div className={styles.timeRow}>
                  <span className={styles.timeLabel}>实际时长:</span>
                  <span className={styles.timeValue}>{task.actualTime}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.cardFooter}>
            <span className={styles.createdAt}>
              创建于
              {' '}
              {formatDateTime(task.createdAt)}
            </span>
            {task.priority && (
              <span
                className={styles.priorityBadge}
                style={{
                  backgroundColor:
                task.priority === 'high'
                  ? '#ef4444'
                  : task.priority === 'medium'
                    ? '#f59e0b'
                    : '#10b981',
                }}
              >
                {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
              </span>
            )}
          </div>
        </MagicCard>
      </div>

      {/* 悬浮显示子任务 */}
      {showSubTaskTooltip && subTasks.length > 0 && (
        <div ref={tooltipRef} className={styles.subTaskTooltip}>
          <div className={styles.tooltipHeader}>任务细则</div>
          {loadingSubTasks
            ? (
                <div className={styles.tooltipContent}>
                  <div className={styles.loadingText}>加载中...</div>
                </div>
              )
            : (
                <div className={styles.tooltipContent}>
                  {subTasks.map((subTask, index) => (
                    <div key={subTask.id} className={styles.tooltipItem}>
                      <span className={styles.tooltipCheckbox}>
                        {subTask.completed ? '✓' : '○'}
                      </span>
                      <span
                        className={cn(
                          styles.tooltipText,
                          subTask.completed && styles.completed,
                        )}
                      >
                        {index + 1}
                        .
                        {subTask.content}
                      </span>
                    </div>
                  ))}
                </div>
              )}
        </div>
      )}

      {/* 子任务编辑弹窗 */}
      {showSubTaskEditor && (
        <SubTaskEditor
          subTasks={subTasks}
          onSave={handleSaveSubTasks}
          onCancel={() => setShowSubTaskEditor(false)}
        />
      )}
    </>
  )
}
