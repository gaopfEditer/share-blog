import { translate } from '@docusaurus/Translate'
import React, { useState, useMemo, useCallback } from 'react'
import { cn } from '@site/src/lib/utils'
import { MagicContainer } from '@site/src/components/magicui/magic-card'
import MyLayout from '@site/src/theme/MyLayout'
import { useTasks } from './hooks/useTasks'
import { useDailyPlans } from './hooks/useDailyPlans'
import TaskForm from './_components/TaskForm'
import TaskCard from './_components/TaskCard'
import DailyPlanCard from './_components/DailyPlanCard'
import Dashboard from './_components/Dashboard'
import TimeStatistics from './_components/TimeStatistics'
import type { Task, TaskFormData, PhaseTask } from './types'
import styles from './styles.module.css'

const TITLE = translate({
  id: 'theme.plan.title',
  message: '计划',
})
const DESCRIPTION = translate({
  id: 'theme.plan.description',
  message: '计划的意义：1.明确目标与方向；2.降低不确定性；3.建立反馈基准；4.激发思考深度。',
})

// 模块类目映射
const MODULE_CATEGORY_MAP: Record<string, string> = {
  info: '信息',
  invest: '投资',
  operate: '运营',
  blog: '杂谈',
  project: '项目',
}

function PlanHeader() {
  return (
    <section className="text-center">
      <h2>{TITLE}</h2>
      <p>{DESCRIPTION}</p>
    </section>
  )
}

type SortMode = 'time' | 'category'

function PlanContent() {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    tasksByCategory,
    tasksSortedByTime,
    getAllSubCategories,
    statistics,
  } = useTasks()
  const {
    getDailyPlans,
    upsertRecord,
    getStatistics: getDailyStatistics,
  } = useDailyPlans()
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [sortMode, setSortMode] = useState<SortMode>('time') // 默认按时间排序
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  )
  const [filteredTasksByTime, setFilteredTasksByTime] = useState<PhaseTask[] | null>(null)

  // 使用 useCallback 包装 setFilteredTasksByTime，避免无限循环
  const handleFilteredTasksChange = useCallback((tasks: PhaseTask[]) => {
    setFilteredTasksByTime(tasks)
  }, [])

  // 获取每日计划（使用 useMemo 缓存，避免不必要的重新渲染）
  const dailyPlans = useMemo(
    () => getDailyPlans(selectedDate),
    [getDailyPlans, selectedDate],
  )
  const dailyStats = getDailyStatistics(selectedDate)

  // 使用筛选后的任务或全部任务
  const tasksToDisplay = filteredTasksByTime || (tasks as PhaseTask[])

  const handleSubmit = (formData: TaskFormData) => {
    if (editingTask) {
      updateTask(editingTask.id, formData)
      setEditingTask(null)
    }
    else {
      addTask(formData)
    }
    setShowForm(false)
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      deleteTask(id)
    }
  }

  const handleUpdateProgress = useCallback((id: string, progress: number) => {
    const status
      = progress === 100
        ? 'completed'
        : progress > 0
          ? 'in-progress'
          : 'pending'
    updateTask(id, { progress, status })

    // 如果使用了筛选后的任务，需要同步更新筛选结果
    if (filteredTasksByTime) {
      setFilteredTasksByTime((prev) => {
        if (!prev) return null
        return prev.map(task =>
          task.id === id
            ? { ...task, progress, status }
            : task,
        )
      })
    }
  }, [updateTask, filteredTasksByTime])

  const handleCancel = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  // 按时间排序的任务列表（基于筛选后的任务）
  const sortedTasksByTime = useMemo(() => {
    return [...tasksToDisplay].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      return timeB - timeA // 降序，最新的在前
    })
  }, [tasksToDisplay])

  // 按模块分组（基于筛选后的任务）
  const tasksByModule = useMemo(() => {
    const grouped: Record<string, PhaseTask[]> = {}
    tasksToDisplay.forEach((task) => {
      const category = task.moduleCategory
      if (category) {
        if (!grouped[category]) {
          grouped[category] = []
        }
        grouped[category].push(task)
      }
    })
    return grouped
  }, [tasksToDisplay])

  const modules = Object.keys(tasksByModule)

  // 获取所有子类目（基于筛选后的任务）
  const allSubCategories = useMemo(() => {
    const subCategories = new Set<string>()
    tasksToDisplay.forEach((task) => {
      if (task.subCategory) {
        subCategories.add(task.subCategory)
      }
    })
    return Array.from(subCategories).sort()
  }, [tasksToDisplay])

  // 根据排序模式和筛选条件获取任务列表
  const getFilteredTasks = () => {
    if (sortMode === 'time') {
      // 时间排序模式：返回所有任务（已按时间排序）
      return sortedTasksByTime
    }
    else {
      // 类目排序模式：按模块和子类目筛选
      let filteredTasks: Task[] = []

      const modulesToShow = selectedModule
        ? [selectedModule]
        : modules

      modulesToShow.forEach((module) => {
        const moduleTasks = tasksByModule[module] || []
        if (moduleTasks.length > 0) {
          filteredTasks.push(...moduleTasks)
        }
      })

      // 按子类目筛选
      if (selectedSubCategory) {
        filteredTasks = filteredTasks.filter(
          task => task.subCategory === selectedSubCategory,
        )
      }

      return filteredTasks
    }
  }

  // 按模块分组并应用子类目筛选
  const getGroupedTasks = () => {
    const filteredModules: Record<string, Task[]> = {}
    const modulesToShow = selectedModule
      ? [selectedModule]
      : modules

    modulesToShow.forEach((module) => {
      let moduleTasks = tasksByModule[module] || []

      // 应用子类目筛选
      if (selectedSubCategory) {
        moduleTasks = moduleTasks.filter(
          task => task.subCategory === selectedSubCategory,
        )
      }

      if (moduleTasks.length > 0) {
        filteredModules[module] = moduleTasks
      }
    })

    return filteredModules
  }

  const renderTaskList = () => {
    if (tasksToDisplay.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p>
            {filteredTasksByTime
              ? '没有符合条件的任务'
              : '还没有任务，点击上方按钮创建第一个任务吧！'}
          </p>
        </div>
      )
    }

    if (sortMode === 'time') {
      // 时间排序模式：所有任务合并显示
      const filteredTasks = getFilteredTasks()

      if (filteredTasks.length === 0) {
        return (
          <div className={styles.emptyState}>
            <p>没有符合条件的任务</p>
          </div>
        )
      }

      return (
        <div className={styles.moduleSection}>
          <div className={cn('my-4', styles.moduleHeader)}>
            <h2 className={styles.moduleTitle}>全部任务</h2>
            <span className={styles.taskCount}>
              {filteredTasks.length}
              {' '}
              个任务
            </span>
          </div>
          <MagicContainer className={styles.taskList}>
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUpdateProgress={handleUpdateProgress}
              />
            ))}
          </MagicContainer>
        </div>
      )
    }
    else {
      // 类目排序模式：按模块分组显示
      const groupedTasks = getGroupedTasks()

      return Object.entries(groupedTasks).map(([module, moduleTasks]) => {
        const moduleName = MODULE_CATEGORY_MAP[module] || module

        if (!moduleTasks || moduleTasks.length === 0) {
          return null
        }

        return (
          <div key={module} className={styles.moduleSection}>
            <div className={cn('my-4', styles.moduleHeader)}>
              <h2 className={styles.moduleTitle}>{moduleName}</h2>
              <span className={styles.taskCount}>
                {moduleTasks.length}
                {' '}
                个任务
              </span>
            </div>

            <MagicContainer className={styles.taskList}>
              {moduleTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onUpdateProgress={handleUpdateProgress}
                />
              ))}
            </MagicContainer>
          </div>
        )
      })
    }
  }

  const handleDailyPlanUpdate = useCallback(
    (
      recordId: string,
      data: Partial<{
        status: string
        progress: number
        actualDuration?: number
        notes?: string
      }>,
    ) => {
      const currentPlans = getDailyPlans(selectedDate)
      const plan = currentPlans.find(
        p => p.todayRecord?.id === recordId || (!recordId && !p.todayRecord),
      )
      if (plan?.template?.id && selectedDate) {
        const templateId = plan.template.id
        upsertRecord(templateId, selectedDate, {
          ...data,
          status: (data.status as 'pending' | 'in-progress' | 'completed') || 'pending',
        })
      }
    },
    [getDailyPlans, selectedDate, upsertRecord],
  )

  return (
    <section className="margin-top--lg margin-bottom--xl">
      <div className="margin-top--lg container">
        {/* 仪表盘 */}
        {/* <Dashboard statistics={statistics()} /> */}

        {/* 时间维度统计 */}
        {tasks.length > 0 && (
          <TimeStatistics
            tasks={tasks as PhaseTask[]}
            onFilteredTasksChange={handleFilteredTasksChange}
          />
        )}

        {/* 阶段性计划操作栏 */}
        <div className={styles.actionBar}>
          <button
            className="button button--primary"
            onClick={() => {
              setEditingTask(null)
              setShowForm(!showForm)
            }}
          >
            {showForm ? '取消创建' : '+ 创建阶段性计划'}
          </button>

          <div className={styles.controlBar}>
            {/* 排序模式切换 */}
            <div className={styles.sortBar}>
              <span className={styles.controlLabel}>排序方式：</span>
              <button
                className={cn('button button--sm', {
                  'button--primary': sortMode === 'time',
                  'button--secondary': sortMode !== 'time',
                })}
                onClick={() => {
                  setSortMode('time')
                  setSelectedModule(null)
                  setSelectedSubCategory(null)
                }}
              >
                按时间
              </button>
              <button
                className={cn('button button--sm', {
                  'button--primary': sortMode === 'category',
                  'button--secondary': sortMode !== 'category',
                })}
                onClick={() => {
                  setSortMode('category')
                  setSelectedSubCategory(null)
                }}
              >
                按类目
              </button>
            </div>

            {/* 模块筛选（仅在类目排序模式下显示） */}
            {sortMode === 'category' && modules.length > 0 && (
              <div className={styles.filterBar}>
                <span className={styles.controlLabel}>模块：</span>
                <button
                  className={cn('button button--sm', {
                    'button--primary': selectedModule === null,
                    'button--secondary': selectedModule !== null,
                  })}
                  onClick={() => setSelectedModule(null)}
                >
                  全部
                </button>
                {modules.map((module) => {
                  const moduleName = MODULE_CATEGORY_MAP[module] || module
                  return (
                    <button
                      key={module}
                      className={cn('button button--sm', {
                        'button--primary': selectedModule === module,
                        'button--secondary': selectedModule !== module,
                      })}
                      onClick={() =>
                        setSelectedModule(selectedModule === module ? null : module)}
                    >
                      {moduleName}
                    </button>
                  )
                })}
              </div>
            )}

            {/* 子类目筛选（仅在类目排序模式下显示） */}
            {sortMode === 'category' && allSubCategories.length > 0 && (
              <div className={styles.filterBar}>
                <span className={styles.controlLabel}>子类目：</span>
                <button
                  className={cn('button button--sm', {
                    'button--primary': selectedSubCategory === null,
                    'button--secondary': selectedSubCategory !== null,
                  })}
                  onClick={() => setSelectedSubCategory(null)}
                >
                  全部
                </button>
                {allSubCategories.map(subCategory => (
                  <button
                    key={subCategory}
                    className={cn('button button--sm', {
                      'button--primary': selectedSubCategory === subCategory,
                      'button--secondary': selectedSubCategory !== subCategory,
                    })}
                    onClick={() =>
                      setSelectedSubCategory(
                        selectedSubCategory === subCategory ? null : subCategory,
                      )}
                  >
                    {subCategory}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 任务表单 */}
        {showForm && (
          <div className={styles.formContainer}>
            <TaskForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              initialData={editingTask || undefined}
              submitText={editingTask ? '更新任务' : '创建任务'}
            />
          </div>
        )}

        {/* 任务列表 */}
        {renderTaskList()}

        {/* 每日计划部分 */}
        <div className={styles.dailyPlanSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>每日计划</h2>
            <div className={styles.dateSelector}>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="button button--sm"
              />
            </div>
          </div>
          {dailyPlans.length > 0
            ? (
                <MagicContainer className={styles.dailyPlanList}>
                  {dailyPlans.map(plan => (
                    <DailyPlanCard
                      key={plan.template.id}
                      plan={plan}
                      onUpdate={handleDailyPlanUpdate}
                    />
                  ))}
                </MagicContainer>
              )
            : (
                <div className={styles.emptyState}>
                  <p>今天没有每日计划</p>
                </div>
              )}
        </div>
      </div>
    </section>
  )
}

function Plan(): React.ReactElement {
  return (
    <MyLayout title={TITLE} description={DESCRIPTION} maxWidth={1280}>
      <main className="margin-vert--lg">
        <PlanHeader />
        <PlanContent />
      </main>
    </MyLayout>
  )
}

export default Plan
