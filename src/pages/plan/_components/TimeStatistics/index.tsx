import React, { useState } from 'react'
import { cn } from '@site/src/lib/utils'
import type { PhaseTask } from '../../types'
import styles from './styles.module.css'

interface TimeStatisticsProps {
  tasks: PhaseTask[]
  onFilteredTasksChange?: (filteredTasks: PhaseTask[]) => void
}

type TimeDimension = 'month' | 'quarter' | 'year'

export default function TimeStatistics({
  tasks,
  onFilteredTasksChange,
}: TimeStatisticsProps) {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const currentQuarter = Math.floor((currentMonth - 1) / 3) + 1

  const [dimension, setDimension] = useState<TimeDimension>('year')
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all')
  const [selectedQuarter, setSelectedQuarter] = useState<number | 'all'>('all')

  // 获取年份列表：从2026年开始到最新的一年
  const getYears = () => {
    const years: number[] = []
    const startYear = 2026
    for (let year = currentYear; year >= startYear; year--) {
      years.push(year)
    }
    return years
  }

  // 获取月份列表：从1月到当月
  const getMonths = () => {
    const months: number[] = []
    const maxMonth = selectedYear === currentYear ? currentMonth : 12
    for (let month = 1; month <= maxMonth; month++) {
      months.push(month)
    }
    return months
  }

  // 获取季度列表：从一季度到当前季度
  const getQuarters = () => {
    const quarters: number[] = []
    const maxQuarter = selectedYear === currentYear ? currentQuarter : 4
    for (let quarter = 1; quarter <= maxQuarter; quarter++) {
      quarters.push(quarter)
    }
    return quarters
  }

  // 根据选择的时间维度筛选任务
  const getFilteredTasks = (): PhaseTask[] => {
    let filtered = tasks

    // 先按年份筛选
    const yearStart = new Date(selectedYear, 0, 1)
    const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59)
    filtered = filtered.filter((task) => {
      const taskStart = new Date(task.plannedStartDate)
      return taskStart >= yearStart && taskStart <= yearEnd
    })

    // 如果选择了季度，进一步筛选
    if (selectedQuarter !== 'all') {
      const quarterStartMonth = ((selectedQuarter as number) - 1) * 3 + 1
      const quarterEndMonth = (selectedQuarter as number) * 3
      const quarterStart = new Date(selectedYear, quarterStartMonth - 1, 1)
      const quarterEnd = new Date(selectedYear, quarterEndMonth, 0, 23, 59, 59)
      filtered = filtered.filter((task) => {
        const taskStart = new Date(task.plannedStartDate)
        return taskStart >= quarterStart && taskStart <= quarterEnd
      })
    }

    // 如果选择了月份，进一步筛选
    if (selectedMonth !== 'all') {
      const monthStart = new Date(selectedYear, (selectedMonth as number) - 1, 1)
      const monthEnd = new Date(
        selectedYear,
        selectedMonth as number,
        0,
        23,
        59,
        59,
      )
      filtered = filtered.filter((task) => {
        const taskStart = new Date(task.plannedStartDate)
        return taskStart >= monthStart && taskStart <= monthEnd
      })
    }

    return filtered
  }

  // 计算月度统计
  const getMonthlyStatistics = (year: number, month: number | 'all') => {
    let monthTasks = tasks

    if (month === 'all') {
      // 如果选择All，统计整年
      const startDate = new Date(year, 0, 1)
      const endDate = new Date(year, 11, 31, 23, 59, 59)
      monthTasks = tasks.filter((task) => {
        const taskStart = new Date(task.plannedStartDate)
        return taskStart >= startDate && taskStart <= endDate
      })
    }
    else {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59)
      monthTasks = tasks.filter((task) => {
        const taskStart = new Date(task.plannedStartDate)
        return taskStart >= startDate && taskStart <= endDate
      })
    }

    const total = monthTasks.length
    const completed = monthTasks.filter(t => t.status === 'completed').length
    const inProgress = monthTasks.filter(t => t.status === 'in-progress').length
    const pending = monthTasks.filter(t => t.status === 'pending').length
    const avgProgress
      = total > 0
        ? Math.round(monthTasks.reduce((sum, t) => sum + t.progress, 0) / total)
        : 0

    // 计算按时完成和逾期
    const onTimeCompletion = monthTasks.filter((task) => {
      if (task.status !== 'completed') return false
      if (!task.actualEndDate || !task.plannedEndDate) return false
      return new Date(task.actualEndDate) <= new Date(task.plannedEndDate)
    }).length

    const overdue = monthTasks.filter((task) => {
      if (task.status === 'completed') return false
      if (!task.plannedEndDate) return false
      return new Date(task.plannedEndDate) < new Date()
    }).length

    return {
      total,
      completed,
      inProgress,
      pending,
      avgProgress,
      onTimeCompletion,
      overdue,
    }
  }

  // 计算季度统计
  const getQuarterlyStatistics = (year: number, quarter: number | 'all') => {
    let quarterTasks = tasks

    if (quarter === 'all') {
      // 如果选择All，统计整年
      const startDate = new Date(year, 0, 1)
      const endDate = new Date(year, 11, 31, 23, 59, 59)
      quarterTasks = tasks.filter((task) => {
        const taskStart = new Date(task.plannedStartDate)
        return taskStart >= startDate && taskStart <= endDate
      })
    }
    else {
      const startMonth = (quarter - 1) * 3 + 1
      const endMonth = quarter * 3
      const startDate = new Date(year, startMonth - 1, 1)
      const endDate = new Date(year, endMonth, 0, 23, 59, 59)
      quarterTasks = tasks.filter((task) => {
        const taskStart = new Date(task.plannedStartDate)
        return taskStart >= startDate && taskStart <= endDate
      })
    }

    const total = quarterTasks.length
    const completed = quarterTasks.filter(t => t.status === 'completed').length
    const inProgress = quarterTasks.filter(t => t.status === 'in-progress').length
    const pending = quarterTasks.filter(t => t.status === 'pending').length
    const avgProgress
      = total > 0
        ? Math.round(quarterTasks.reduce((sum, t) => sum + t.progress, 0) / total)
        : 0

    const onTimeCompletion = quarterTasks.filter((task) => {
      if (task.status !== 'completed') return false
      if (!task.actualEndDate || !task.plannedEndDate) return false
      return new Date(task.actualEndDate) <= new Date(task.plannedEndDate)
    }).length

    const overdue = quarterTasks.filter((task) => {
      if (task.status === 'completed') return false
      if (!task.plannedEndDate) return false
      return new Date(task.plannedEndDate) < new Date()
    }).length

    return {
      total,
      completed,
      inProgress,
      pending,
      avgProgress,
      onTimeCompletion,
      overdue,
    }
  }

  // 计算年度统计
  const getYearlyStatistics = (year: number) => {
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)

    const yearTasks = tasks.filter((task) => {
      const taskStart = new Date(task.plannedStartDate)
      return (
        taskStart >= startDate
        && taskStart <= endDate
      )
    })

    const total = yearTasks.length
    const completed = yearTasks.filter(t => t.status === 'completed').length
    const inProgress = yearTasks.filter(t => t.status === 'in-progress').length
    const pending = yearTasks.filter(t => t.status === 'pending').length
    const avgProgress
      = total > 0
        ? Math.round(yearTasks.reduce((sum, t) => sum + t.progress, 0) / total)
        : 0

    const onTimeCompletion = yearTasks.filter((task) => {
      if (task.status !== 'completed') return false
      if (!task.actualEndDate || !task.plannedEndDate) return false
      return new Date(task.actualEndDate) <= new Date(task.plannedEndDate)
    }).length

    const overdue = yearTasks.filter((task) => {
      if (task.status === 'completed') return false
      if (!task.plannedEndDate) return false
      return new Date(task.plannedEndDate) < new Date()
    }).length

    // 按模块类别统计
    const categoryCount: Record<string, number> = {}
    yearTasks.forEach((task) => {
      categoryCount[task.moduleCategory] = (categoryCount[task.moduleCategory] || 0) + 1
    })

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      total,
      completed,
      inProgress,
      pending,
      avgProgress,
      onTimeCompletion,
      overdue,
      topCategories,
    }
  }

  const getCurrentStatistics = () => {
    if (dimension === 'month') {
      return getMonthlyStatistics(selectedYear, selectedMonth)
    }
    if (dimension === 'quarter') {
      return getQuarterlyStatistics(selectedYear, selectedQuarter)
    }
    return getYearlyStatistics(selectedYear)
  }

  const statistics = getCurrentStatistics()
  const filteredTasks = getFilteredTasks()

  // 当筛选结果变化时，通知父组件
  const prevFilteredTasksRef = React.useRef<string>('')
  React.useEffect(() => {
    // 使用任务ID的字符串来比较，避免数组引用比较
    const currentTasksId = filteredTasks.map(t => t.id).join(',')
    if (currentTasksId !== prevFilteredTasksRef.current && onFilteredTasksChange) {
      prevFilteredTasksRef.current = currentTasksId
      onFilteredTasksChange(filteredTasks)
    }
  }, [filteredTasks, onFilteredTasksChange])

  // 当年份变化时，重置季度和月份为All
  React.useEffect(() => {
    setSelectedMonth('all')
    setSelectedQuarter('all')
  }, [selectedYear])

  return (
    <div className={styles.timeStatistics}>
      <div className={styles.header}>
        <h3 className={styles.title}>时间维度统计</h3>
        <div className={styles.controls}>
          <div className={styles.dimensionSelector}>
            <button
              className={cn('button button--sm', {
                'button--primary': dimension === 'month',
                'button--secondary': dimension !== 'month',
              })}
              onClick={() => setDimension('month')}
            >
              月度
            </button>
            <button
              className={cn('button button--sm', {
                'button--primary': dimension === 'quarter',
                'button--secondary': dimension !== 'quarter',
              })}
              onClick={() => setDimension('quarter')}
            >
              季度
            </button>
            <button
              className={cn('button button--sm', {
                'button--primary': dimension === 'year',
                'button--secondary': dimension !== 'year',
              })}
              onClick={() => setDimension('year')}
            >
              年度
            </button>
          </div>

          <div className={styles.dateSelector}>
            {/* 年份选择器 - 所有维度都显示 */}
            <select
              className="button button--sm"
              value={selectedYear}
              onChange={e => setSelectedYear(parseInt(e.target.value))}
            >
              {getYears().map(year => (
                <option key={year} value={year}>
                  {year}
                  年
                </option>
              ))}
            </select>

            {/* 季度选择器 - 仅在季度和年度维度显示 */}
            {(dimension === 'quarter' || dimension === 'year') && (
              <select
                className="button button--sm"
                value={selectedQuarter}
                onChange={e =>
                  setSelectedQuarter(
                    e.target.value === 'all' ? 'all' : parseInt(e.target.value),
                  )}
              >
                <option value="all">All</option>
                {getQuarters().map(quarter => (
                  <option key={quarter} value={quarter}>
                    第
                    {quarter}
                    季度
                  </option>
                ))}
              </select>
            )}

            {/* 月份选择器 - 仅在月度维度显示 */}
            {dimension === 'month' && (
              <select
                className="button button--sm"
                value={selectedMonth}
                onChange={e =>
                  setSelectedMonth(
                    e.target.value === 'all' ? 'all' : parseInt(e.target.value),
                  )}
              >
                <option value="all">All</option>
                {getMonths().map(month => (
                  <option key={month} value={month}>
                    {month}
                    月
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>总任务数</div>
          <div className={styles.statValue}>{statistics.total}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>已完成</div>
          <div className={cn(styles.statValue, styles.completed)}>
            {statistics.completed}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>进行中</div>
          <div className={cn(styles.statValue, styles.inProgress)}>
            {statistics.inProgress}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>待开始</div>
          <div className={cn(styles.statValue, styles.pending)}>
            {statistics.pending}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>平均完成度</div>
          <div className={styles.statValue}>
            {statistics.avgProgress}
            %
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>按时完成</div>
          <div className={cn(styles.statValue, styles.onTime)}>
            {statistics.onTimeCompletion}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>逾期任务</div>
          <div className={cn(styles.statValue, styles.overdue)}>
            {statistics.overdue}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>完成率</div>
          <div className={styles.statValue}>
            {statistics.total > 0
              ? Math.round((statistics.completed / statistics.total) * 100)
              : 0}
            %
          </div>
        </div>
      </div>

    </div>
  )
}
