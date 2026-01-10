import React, { useState, useEffect } from 'react'
import { cn } from '@site/src/lib/utils'
import type { SubTask } from '../../types'
import styles from './styles.module.css'

interface SubTaskEditorProps {
  subTasks: SubTask[]
  onSave: (subTasks: SubTask[]) => void
  onCancel: () => void
}

export default function SubTaskEditor({
  subTasks: initialSubTasks,
  onSave,
  onCancel,
}: SubTaskEditorProps) {
  const [subTasks, setSubTasks] = useState<SubTask[]>(initialSubTasks || [])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  useEffect(() => {
    setSubTasks(initialSubTasks || [])
  }, [initialSubTasks])

  const handleAdd = () => {
    const newSubTask: SubTask = {
      id: `subtask_${Date.now()}_${Math.random()}`,
      content: '',
      completed: false,
      order: subTasks.length,
    }
    setSubTasks([...subTasks, newSubTask])
  }

  const handleUpdate = (id: string, updates: Partial<SubTask>) => {
    setSubTasks(subTasks.map(task =>
      task.id === id ? { ...task, ...updates } : task,
    ))
  }

  const handleDelete = (id: string) => {
    setSubTasks(subTasks.filter(task => task.id !== id))
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newSubTasks = [...subTasks]
    const draggedItem = newSubTasks[draggedIndex]
    if (!draggedItem) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }
    newSubTasks.splice(draggedIndex, 1)
    newSubTasks.splice(dropIndex, 0, draggedItem)

    // 更新 order
    const updatedSubTasks = newSubTasks.map((task, index) => ({
      ...task,
      order: index,
    }))

    setSubTasks(updatedSubTasks)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleSave = () => {
    // 过滤掉空内容，并重新排序
    const validSubTasks = subTasks
      .filter(task => task.content.trim())
      .map((task, index) => ({ ...task, order: index }))
    onSave(validSubTasks)
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>任务细则</h3>
          <button
            className={cn('button button--sm button--secondary', styles.closeButton)}
            onClick={onCancel}
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.subTaskList}>
            {subTasks.map((subTask, index) => (
              <div
                key={subTask.id}
                className={cn(
                  styles.subTaskItem,
                  draggedIndex === index && styles.dragging,
                  dragOverIndex === index && styles.dragOver,
                )}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={e => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className={styles.dragHandle} title="拖拽调整顺序">
                  ⋮⋮
                </div>
                <div className={styles.subTaskContent}>
                  <input
                    type="checkbox"
                    checked={subTask.completed}
                    onChange={e =>
                      handleUpdate(subTask.id, { completed: e.target.checked })
                    }
                    className={styles.checkbox}
                  />
                  <input
                    type="text"
                    value={subTask.content}
                    onChange={e =>
                      handleUpdate(subTask.id, { content: e.target.value })
                    }
                    placeholder={`步骤 ${index + 1}`}
                    className={styles.input}
                  />
                  <button
                    className={cn('button button--sm button--danger', styles.deleteButton)}
                    onClick={() => handleDelete(subTask.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            className={cn('button button--sm button--secondary', styles.addButton)}
            onClick={handleAdd}
          >
            + 添加步骤
          </button>
        </div>

        <div className={styles.footer}>
          <button
            className={cn('button button--sm button--secondary', styles.cancelButton)}
            onClick={onCancel}
          >
            取消
          </button>
          <button
            className={cn('button button--sm button--primary', styles.saveButton)}
            onClick={handleSave}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

