import React from 'react'
import { cn } from '@site/src/lib/utils'
import styles from './styles.module.css'

interface DashboardProps {
  statistics: {
    total: number
    completed: number
    inProgress: number
    pending: number
    avgProgress: number
  }
}

export default function Dashboard({ statistics }: DashboardProps) {
  const stats = [
    {
      label: '总任务数',
      value: statistics.total,
      color: '#3b82f6',
    },
    {
      label: '已完成',
      value: statistics.completed,
      color: '#10b981',
    },
    {
      label: '进行中',
      value: statistics.inProgress,
      color: '#f59e0b',
    },
    {
      label: '待开始',
      value: statistics.pending,
      color: '#9ca3af',
    },
    {
      label: '平均完成度',
      value: `${statistics.avgProgress}%`,
      color: '#8b5cf6',
    },
  ]

  return (
    <div className={styles.dashboard}>
      <h3 className={styles.dashboardTitle}>任务统计</h3>
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: stat.color + '20' }}
            >
              <div
                className={styles.statIconInner}
                style={{ backgroundColor: stat.color }}
              />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue} style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
