import type React from 'react'

/**
 * Card Header Props：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/shared/CardHeader.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
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
 * join Class Name：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/shared/CardHeader.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param values 参数 `values`用于提供待处理的值并参与结果计算。
 * @returns 返回字符串结果，通常用于文本展示或下游拼接。
 */
function joinClassName(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(' ')
}

/**
 * Designer Card Header：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/shared/CardHeader.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 组件入参对象。
 * @param param1.title 头部主标题文本。
 * @param param1.description 头部描述文本。
 * @param param1.actions 右侧操作区节点。
 * @param param1.className 外层容器附加类名。
 * @param param1.mainClassName 主体容器附加类名。
 * @param param1.titleClassName 标题节点附加类名。
 * @param param1.descriptionClassName 描述节点附加类名。
 * @param param1.actionsClassName 操作区节点附加类名。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
