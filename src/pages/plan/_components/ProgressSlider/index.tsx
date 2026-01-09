import React from 'react'
import { cn } from '@site/src/lib/utils'
import styles from './styles.module.css'

interface ProgressSliderProps {
  progress: number
  onChange?: (progress: number) => void
  disabled?: boolean
  getProgressColor?: (progress: number) => string
}

export default function ProgressSlider({
  progress,
  onChange,
  disabled = false,
  getProgressColor,
}: ProgressSliderProps) {
  const defaultGetProgressColor = (progress: number) => {
    if (progress === 100) return '#10b981'
    if (progress >= 50) return '#3b82f6'
    return '#f59e0b'
  }

  const progressColor = getProgressColor
    ? getProgressColor(progress)
    : defaultGetProgressColor(progress)

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{
            width: `${progress}%`,
            backgroundColor: progressColor,
          }}
        />
      </div>
      {onChange && !disabled && (
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={e => onChange(parseInt(e.target.value))}
          className={styles.progressSlider}
        />
      )}
    </div>
  )
}

