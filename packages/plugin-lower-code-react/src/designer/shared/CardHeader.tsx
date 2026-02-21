import type React from 'react'

interface CardHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
  mainClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  actionsClassName?: string
}

/**
 * join Class Name：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 join Class Name 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function joinClassName(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(' ')
}

/**
 * Designer Card Header：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Designer Card Header 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function DesignerCardHeader({
  title,
  description,
  actions,
  className,
  mainClassName,
  titleClassName,
  descriptionClassName,
  actionsClassName,
}: CardHeaderProps): React.ReactElement {
  return (
    <div className={joinClassName('cf-lc-card-head', className)}>
      <div className={joinClassName('cf-lc-card-main', mainClassName)}>
        <div className={joinClassName('cf-lc-card-title', titleClassName)}>{title}</div>
        {description
          ? <div className={joinClassName('cf-lc-card-description', descriptionClassName)}>{description}</div>
          : null}
      </div>
      {actions
        ? <div className={joinClassName('cf-lc-card-actions', actionsClassName)}>{actions}</div>
        : null}
    </div>
  )
}
