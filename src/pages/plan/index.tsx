import { translate } from '@docusaurus/Translate'
import React, { useState } from 'react'
import { cn } from '@site/src/lib/utils'
import { MagicContainer } from '@site/src/components/magicui/magic-card'
import MyLayout from '@site/src/theme/MyLayout'
import { useTasks } from './hooks/useTasks'
import TaskForm from './_components/TaskForm'
import TaskCard from './_components/TaskCard'
import Dashboard from './_components/Dashboard'
import type { Task, TaskFormData } from './types'
import styles from './styles.module.css'

const TITLE = translate({
  id: 'theme.plan.title',
  message: '计划',
})
const DESCRIPTION = translate({
  id: 'theme.plan.description',
  message: '计划页面是一个后续主题的概览，能够像禅道一样，可以对每个主题都有可以添加任务，暂时写在缓存中，后续会补充接口。',
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
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [sortMode, setSortMode] = useState<SortMode>('time') // 默认按时间排序
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null)

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

  const handleUpdateProgress = (id: string, progress: number) => {
    const status
      = progress === 100
        ? 'completed'
        : progress > 0
          ? 'in-progress'
          : 'pending'
    updateTask(id, { progress, status })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  // 按时间排序的任务列表
  const sortedTasksByTime = tasksSortedByTime()

  // 按模块分组
  const tasksByModule = tasksByCategory()
  const modules = Object.keys(tasksByModule)

  // 获取所有子类目
  const allSubCategories = getAllSubCategories()

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
        filteredTasks.push(...moduleTasks)
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
    if (tasks.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p>还没有任务，点击上方按钮创建第一个任务吧！</p>
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

  return (
    <section className="margin-top--lg margin-bottom--xl">
      <div className="margin-top--lg container">
        {/* 仪表盘 */}
        <Dashboard statistics={statistics()} />

        {/* 操作栏 */}
        <div className={styles.actionBar}>
          <button
            className="button button--primary"
            onClick={() => {
              setEditingTask(null)
              setShowForm(!showForm)
            }}
          >
            {showForm ? '取消创建' : '+ 创建任务'}
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
