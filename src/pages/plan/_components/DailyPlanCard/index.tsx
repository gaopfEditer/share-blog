import React from 'react'
import { MagicCard } from '@site/src/components/magicui/magic-card'
import { cn } from '@site/src/lib/utils'
import ProgressSlider from '../ProgressSlider'
import type { DailyPlan } from '../../types'
import styles from './styles.module.css'

interface DailyPlanCardProps {
  plan: DailyPlan
  onUpdate?: (
    recordId: string,
    data: Partial<{
      status: string
      progress: number
      actualDuration?: number
      notes?: string
    }>,
  ) => void
}

const STATUS_MAP = {
  'pending': { label: '待开始', color: '#9ca3af' },
  'in-progress': { label: '进行中', color: '#3b82f6' },
  'completed': { label: '已完成', color: '#10b981' },
}

const PRIORITY_MAP = {
  low: { label: '低', color: '#10b981' },
  medium: { label: '中', color: '#f59e0b' },
  high: { label: '高', color: '#ef4444' },
}

export default function DailyPlanCard({ plan, onUpdate }: DailyPlanCardProps) {
  const { template, todayRecord } = plan
  const status = todayRecord
    ? STATUS_MAP[todayRecord.status]
    : STATUS_MAP.pending
  const priority = PRIORITY_MAP[template.priority]

  const progress = todayRecord?.progress || 0

  const getProgressColor = (progress: number) => {
    if (progress === 100) return '#10b981'
    if (progress >= 50) return '#3b82f6'
    return '#f59e0b'
  }

  const handleProgressChange = (newProgress: number) => {
    if (!todayRecord && onUpdate) {
      // 创建新记录
      onUpdate('', {
        status: newProgress === 100 ? 'completed' : newProgress > 0 ? 'in-progress' : 'pending',
        progress: newProgress,
      })
    }
    else if (todayRecord && onUpdate) {
      // 更新现有记录
      onUpdate(todayRecord.id, {
        status: newProgress === 100 ? 'completed' : newProgress > 0 ? 'in-progress' : 'pending',
        progress: newProgress,
      })
    }
  }

  return (
    <MagicCard className={cn('card', styles.dailyPlanCard)}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <h4 className={styles.planName}>{template.name}</h4>
          <div className={styles.badgeContainer}>
            <span
              className={styles.statusBadge}
              style={{ backgroundColor: status.color + '20', color: status.color }}
            >
              {status.label}
            </span>
            <span
              className={styles.priorityBadge}
              style={{ backgroundColor: priority.color + '20', color: priority.color }}
            >
              {priority.label}
            </span>
            {template.subCategory && (
              <span className={styles.subCategoryTag}>
                {template.subCategory}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.cardBody}>
        {template.description && (
          <div className={styles.description}>{template.description}</div>
        )}

        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>预计时长:</span>
          <span className={styles.metaValue}>
            {template.estimatedDuration}
            分钟
          </span>
        </div>

        {todayRecord?.actualDuration && (
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>实际时长:</span>
            <span className={styles.metaValue}>
              {todayRecord.actualDuration}
              分钟
            </span>
          </div>
        )}

        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>完成度</span>
            <span
              className={styles.progressPercent}
              style={{ color: getProgressColor(progress) }}
            >
              {progress}
              %
            </span>
          </div>
          <ProgressSlider
            progress={progress}
            onChange={onUpdate ? handleProgressChange : undefined}
            getProgressColor={getProgressColor}
          />
        </div>

        {todayRecord?.notes && (
          <div className={styles.notes}>
            <span className={styles.notesLabel}>备注:</span>
            <span className={styles.notesValue}>{todayRecord.notes}</span>
          </div>
        )}
      </div>
    </MagicCard>
  )
}
