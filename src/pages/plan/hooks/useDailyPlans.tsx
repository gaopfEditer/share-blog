import { useState, useEffect, useCallback } from 'react'
import React from 'react'
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'
import { translate } from '@docusaurus/Translate'
import MyLayout from '@site/src/theme/MyLayout'
import { dailyPlanTemplates } from '@site/data/plan/dailyPlanTemplates'
import type { DailyPlan, DailyPlanRecord, DailyPlanTemplate } from '../types'

const STORAGE_KEY = 'plan-daily-records'

// 从 localStorage 读取每日计划记录
function loadRecordsFromStorage(): DailyPlanRecord[] {
  if (!ExecutionEnvironment.canUseDOM) {
    return []
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }
  catch (error) {
    console.error('Failed to load daily plan records from storage:', error)
    return []
  }
}

// 保存每日计划记录到 localStorage
function saveRecordsToStorage(records: DailyPlanRecord[]): void {
  if (!ExecutionEnvironment.canUseDOM) {
    return
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }
  catch (error) {
    console.error('Failed to save daily plan records to storage:', error)
  }
}

// 获取今天的日期字符串 (YYYY-MM-DD)
function getTodayDateString(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// 检查日期是否匹配模板的weekdays要求
function isDateMatchTemplate(date: string, template: DailyPlanTemplate): boolean {
  if (!template.weekdays || template.weekdays.length === 0) {
    return true // 没有weekdays限制，表示每天
  }
  const dateObj = new Date(date)
  const weekday = dateObj.getDay() // 0=周日, 1=周一, ..., 6=周六
  return template.weekdays.includes(weekday)
}

export function useDailyPlans() {
  const [records, setRecords] = useState<DailyPlanRecord[]>([])

  // 初始化时从 localStorage 加载记录
  useEffect(() => {
    setRecords(loadRecordsFromStorage())
  }, [])

  // 获取指定日期的每日计划列表
  const getDailyPlans = useCallback(
    (date: string = getTodayDateString()): DailyPlan[] => {
      // 获取所有启用的模板
      const activeTemplates = dailyPlanTemplates.filter(
        template => template.isActive && isDateMatchTemplate(date, template),
      )

      // 获取该日期的所有记录
      const dateRecords = records.filter(record => record.date === date)

      // 组合模板和记录
      return activeTemplates.map(template => {
        const todayRecord = dateRecords.find(
          record => record.templateId === template.id,
        )

        return {
          template,
          todayRecord,
        }
      })
    },
    [records],
  )

  // 创建或更新每日计划记录
  const upsertRecord = useCallback(
    (templateId: string, date: string, recordData: Partial<DailyPlanRecord>) => {
      setRecords((prev) => {
        const existingIndex = prev.findIndex(
          r => r.templateId === templateId && r.date === date,
        )

        const newRecord: DailyPlanRecord = {
          id:
            existingIndex >= 0
              ? prev[existingIndex].id
              : Date.now().toString() + Math.random().toString(36).substr(2, 9),
          templateId,
          date,
          status: recordData.status || 'pending',
          progress: recordData.progress || 0,
          actualDuration: recordData.actualDuration,
          notes: recordData.notes,
          completedAt: recordData.completedAt,
          createdAt:
            existingIndex >= 0
              ? prev[existingIndex].createdAt
              : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...recordData,
        }

        const updated = existingIndex >= 0
          ? [
              ...prev.slice(0, existingIndex),
              newRecord,
              ...prev.slice(existingIndex + 1),
            ]
          : [...prev, newRecord]

        saveRecordsToStorage(updated)
        return updated
      })
    },
    [],
  )

  // 删除每日计划记录
  const deleteRecord = useCallback((recordId: string) => {
    setRecords((prev) => {
      const updated = prev.filter(record => record.id !== recordId)
      saveRecordsToStorage(updated)
      return updated
    })
  }, [])

  // 获取统计信息
  const getStatistics = useCallback(
    (date: string = getTodayDateString()) => {
      const dateRecords = records.filter(record => record.date === date)
      const total = dateRecords.length
      const completed = dateRecords.filter(r => r.status === 'completed').length
      const inProgress = dateRecords.filter(r => r.status === 'in-progress').length
      const pending = dateRecords.filter(r => r.status === 'pending').length
      const avgProgress
        = total > 0
          ? Math.round(
              dateRecords.reduce((sum, r) => sum + r.progress, 0) / total,
            )
          : 0
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
      const avgDuration
        = dateRecords.length > 0
          ? Math.round(
              dateRecords
                .filter(r => r.actualDuration)
                .reduce((sum, r) => sum + (r.actualDuration || 0), 0)
                / dateRecords.filter(r => r.actualDuration).length,
            )
          : 0

      return {
        total,
        completed,
        inProgress,
        pending,
        avgProgress,
        completionRate,
        avgDuration,
        activeTemplates: dailyPlanTemplates.filter(t => t.isActive).length,
      }
    },
    [records],
  )

  return {
    getDailyPlans,
    upsertRecord,
    deleteRecord,
    getStatistics,
    records,
  }
}

// ==================== 页面组件 ====================
const TITLE = translate({
  id: 'theme.plan.hooks.useDailyPlans.title',
  message: 'useDailyPlans Hook',
})

const DESCRIPTION = translate({
  id: 'theme.plan.hooks.useDailyPlans.description',
  message: '每日计划管理的 React Hook',
})

export default function UseDailyPlansPage(): React.ReactElement {
  return (
    <MyLayout title={TITLE} description={DESCRIPTION} maxWidth={1280}>
      <main className="margin-vert--lg">
        <section className="text-center">
          <h2>{TITLE}</h2>
          <p>{DESCRIPTION}</p>
          <p className="margin-top--md">
            此页面包含 useDailyPlans Hook 的实现。
            该 Hook 用于管理每日计划的状态和操作。
          </p>
        </section>
      </main>
    </MyLayout>
  )
}

