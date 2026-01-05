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

function PlanContent() {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    tasksByModuleAndSubCategory,
    statistics,
  } = useTasks()
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)

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

  const groupedTasks = tasksByModuleAndSubCategory()
  const modules = Object.keys(groupedTasks)

  // 过滤选中的模块
  const filteredModules = selectedModule
    ? {
        [selectedModule]: groupedTasks[selectedModule] || {},
      }
    : groupedTasks

  const renderTaskList = () => {
    if (tasks.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p>还没有任务，点击上方按钮创建第一个任务吧！</p>
        </div>
      )
    }

    return Object.entries(filteredModules).map(([module, subCategories]) => {
      const moduleName = MODULE_CATEGORY_MAP[module] || module
      const subCategoryEntries = Object.entries(subCategories)

      if (subCategoryEntries.length === 0) {
        return null
      }

      // 计算该模块下的总任务数
      const totalTasks = subCategoryEntries.reduce(
        (sum, [, tasks]) => sum + tasks.length,
        0,
      )

      return (
        <div key={module} className={styles.moduleSection}>
          <div className={cn('my-4', styles.moduleHeader)}>
            <h2 className={styles.moduleTitle}>{moduleName}</h2>
            <span className={styles.taskCount}>
              {totalTasks}
              {' '}
              个任务
            </span>
          </div>

          {subCategoryEntries.map(([subCategory, subCategoryTasks]) => {
            if (!subCategoryTasks || subCategoryTasks.length === 0) {
              return null
            }

            return (
              <div key={subCategory} className={styles.subCategorySection}>
                <div className={cn('my-3', styles.subCategoryHeader)}>
                  <h3 className={styles.subCategoryTitle}>{subCategory}</h3>
                  <span className={styles.subCategoryTaskCount}>
                    {subCategoryTasks.length}
                    {' '}
                    个任务
                  </span>
                </div>
                <MagicContainer className={styles.taskList}>
                  {subCategoryTasks.map(task => (
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
          })}
        </div>
      )
    })
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
          {modules.length > 0 && (
            <div className={styles.filterBar}>
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
