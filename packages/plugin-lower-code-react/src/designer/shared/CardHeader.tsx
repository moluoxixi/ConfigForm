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

function joinClassName(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(' ')
}

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
