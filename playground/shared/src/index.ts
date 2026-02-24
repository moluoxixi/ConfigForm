export { resolveSceneSchema } from './scene-schema'
export type { SceneConfig } from './types'

/** 场景分组标签 */
export const GROUP_LABELS: Record<string, string> = {
  '01-basic': '基础场景',
  '02-linkage': '联动场景',
  '03-validation': '验证场景',
  '04-complex-data': '复杂数据',
  '05-datasource': '数据源',
  '06-layout': '布局分组',
  '07-dynamic': '动态表单',
  '08-components': '自定义组件',
  '09-advanced': '进阶能力',
  '10-state': '状态管理',
  '11-misc': '其他能力',
  '12-plugin': '插件能力',
}

/**
 * 场景注册表
 *
 * 覆盖所有已实现功能，包含核心表单 + 插件能力。
 */
export const sceneRegistry: Record<string, { group: string, loader: () => Promise<{ default: import('./types').SceneConfig }> }> = {
  /* 01-basic — 基础场景（4 个） */
  BasicForm: { group: '01-basic', /**
                                   * loader：执行当前位置的功能逻辑。
                                   * 定位：`playground/shared/src/index.ts:27`。
                                   * 功能：处理参数消化、状态变更与调用链行为同步。
                                   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                   * @returns 返回当前分支执行后的处理结果。
                                   */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:34`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./01-basic/BasicForm') },
  LayoutForm: { group: '01-basic', /**
                                    * loader：执行当前位置的功能逻辑。
                                    * 定位：`playground/shared/src/index.ts:28`。
                                    * 功能：处理参数消化、状态变更与调用链行为同步。
                                    * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                    * @returns 返回当前分支执行后的处理结果。
                                    */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:42`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./01-basic/LayoutForm') },
  BasicValidationForm: { group: '01-basic', /**
                                             * loader：执行当前位置的功能逻辑。
                                             * 定位：`playground/shared/src/index.ts:29`。
                                             * 功能：处理参数消化、状态变更与调用链行为同步。
                                             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                             * @returns 返回当前分支执行后的处理结果。
                                             */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:50`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./01-basic/BasicValidationForm') },
  DefaultValueForm: { group: '01-basic', /**
                                          * loader：执行当前位置的功能逻辑。
                                          * 定位：`playground/shared/src/index.ts:30`。
                                          * 功能：处理参数消化、状态变更与调用链行为同步。
                                          * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                          * @returns 返回当前分支执行后的处理结果。
                                          */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:58`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./01-basic/DefaultValueForm') },

  /* 02-linkage — 联动场景（7 个） */
  VisibilityLinkageForm: { group: '02-linkage', /**
                                                 * loader：执行当前位置的功能逻辑。
                                                 * 定位：`playground/shared/src/index.ts:33`。
                                                 * 功能：处理参数消化、状态变更与调用链行为同步。
                                                 * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                 * @returns 返回当前分支执行后的处理结果。
                                                 */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:68`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./02-linkage/VisibilityLinkageForm') },
  ValueLinkageForm: { group: '02-linkage', /**
                                            * loader：执行当前位置的功能逻辑。
                                            * 定位：`playground/shared/src/index.ts:34`。
                                            * 功能：处理参数消化、状态变更与调用链行为同步。
                                            * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                            * @returns 返回当前分支执行后的处理结果。
                                            */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:76`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./02-linkage/ValueLinkageForm') },
  PropertyLinkageForm: { group: '02-linkage', /**
                                               * loader：执行当前位置的功能逻辑。
                                               * 定位：`playground/shared/src/index.ts:35`。
                                               * 功能：处理参数消化、状态变更与调用链行为同步。
                                               * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                               * @returns 返回当前分支执行后的处理结果。
                                               */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:84`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./02-linkage/PropertyLinkageForm') },
  CascadeSelectForm: { group: '02-linkage', /**
                                             * loader：执行当前位置的功能逻辑。
                                             * 定位：`playground/shared/src/index.ts:36`。
                                             * 功能：处理参数消化、状态变更与调用链行为同步。
                                             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                             * @returns 返回当前分支执行后的处理结果。
                                             */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:92`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./02-linkage/CascadeSelectForm') },
  ComputedFieldForm: { group: '02-linkage', /**
                                             * loader：执行当前位置的功能逻辑。
                                             * 定位：`playground/shared/src/index.ts:37`。
                                             * 功能：处理参数消化、状态变更与调用链行为同步。
                                             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                             * @returns 返回当前分支执行后的处理结果。
                                             */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:100`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./02-linkage/ComputedFieldForm') },
  ConditionalRequiredForm: { group: '02-linkage', /**
                                                   * loader：执行当前位置的功能逻辑。
                                                   * 定位：`playground/shared/src/index.ts:38`。
                                                   * 功能：处理参数消化、状态变更与调用链行为同步。
                                                   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                   * @returns 返回当前分支执行后的处理结果。
                                                   */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:108`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./02-linkage/ConditionalRequiredForm') },
  ComponentSwitchForm: { group: '02-linkage', /**
                                               * loader：执行当前位置的功能逻辑。
                                               * 定位：`playground/shared/src/index.ts:39`。
                                               * 功能：处理参数消化、状态变更与调用链行为同步。
                                               * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                               * @returns 返回当前分支执行后的处理结果。
                                               */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:116`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./02-linkage/ComponentSwitchForm') },

  /* 03-validation — 验证场景（4 个） */
  AsyncValidationForm: { group: '03-validation', /**
                                                  * loader：执行当前位置的功能逻辑。
                                                  * 定位：`playground/shared/src/index.ts:42`。
                                                  * 功能：处理参数消化、状态变更与调用链行为同步。
                                                  * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                  * @returns 返回当前分支执行后的处理结果。
                                                  */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:126`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./03-validation/AsyncValidationForm') },
  CrossFieldValidationForm: { group: '03-validation', /**
                                                       * loader：执行当前位置的功能逻辑。
                                                       * 定位：`playground/shared/src/index.ts:43`。
                                                       * 功能：处理参数消化、状态变更与调用链行为同步。
                                                       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                       * @returns 返回当前分支执行后的处理结果。
                                                       */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:134`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./03-validation/CrossFieldValidationForm') },
  CustomValidationForm: { group: '03-validation', /**
                                                   * loader：执行当前位置的功能逻辑。
                                                   * 定位：`playground/shared/src/index.ts:44`。
                                                   * 功能：处理参数消化、状态变更与调用链行为同步。
                                                   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                   * @returns 返回当前分支执行后的处理结果。
                                                   */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:142`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./03-validation/CustomValidationForm') },
  SectionValidationForm: { group: '03-validation', /**
                                                    * loader：执行当前位置的功能逻辑。
                                                    * 定位：`playground/shared/src/index.ts:45`。
                                                    * 功能：处理参数消化、状态变更与调用链行为同步。
                                                    * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                    * @returns 返回当前分支执行后的处理结果。
                                                    */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:150`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./03-validation/SectionValidationForm') },

  /* 04-complex-data — 复杂数据（5 个） */
  ArrayFieldForm: { group: '04-complex-data', /**
                                               * loader：执行当前位置的功能逻辑。
                                               * 定位：`playground/shared/src/index.ts:48`。
                                               * 功能：处理参数消化、状态变更与调用链行为同步。
                                               * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                               * @returns 返回当前分支执行后的处理结果。
                                               */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:160`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./04-complex-data/ArrayFieldForm') },
  EditableTableForm: { group: '04-complex-data', /**
                                                  * loader：执行当前位置的功能逻辑。
                                                  * 定位：`playground/shared/src/index.ts:49`。
                                                  * 功能：处理参数消化、状态变更与调用链行为同步。
                                                  * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                  * @returns 返回当前分支执行后的处理结果。
                                                  */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:168`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./04-complex-data/EditableTableForm') },
  NestedObjectForm: { group: '04-complex-data', /**
                                                 * loader：执行当前位置的功能逻辑。
                                                 * 定位：`playground/shared/src/index.ts:50`。
                                                 * 功能：处理参数消化、状态变更与调用链行为同步。
                                                 * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                 * @returns 返回当前分支执行后的处理结果。
                                                 */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:176`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./04-complex-data/NestedObjectForm') },
  ObjectArrayNestedForm: { group: '04-complex-data', /**
                                                      * loader：执行当前位置的功能逻辑。
                                                      * 定位：`playground/shared/src/index.ts:51`。
                                                      * 功能：处理参数消化、状态变更与调用链行为同步。
                                                      * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                      * @returns 返回当前分支执行后的处理结果。
                                                      */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:184`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./04-complex-data/ObjectArrayNestedForm') },
  ObjectFieldDynamicForm: { group: '04-complex-data', /**
                                                       * loader：执行当前位置的功能逻辑。
                                                       * 定位：`playground/shared/src/index.ts:52`。
                                                       * 功能：处理参数消化、状态变更与调用链行为同步。
                                                       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                       * @returns 返回当前分支执行后的处理结果。
                                                       */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:192`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./04-complex-data/ObjectFieldDynamicForm') },

  /* 05-datasource — 数据源（4 个） */
  AsyncOptionsForm: { group: '05-datasource', /**
                                               * loader：执行当前位置的功能逻辑。
                                               * 定位：`playground/shared/src/index.ts:55`。
                                               * 功能：处理参数消化、状态变更与调用链行为同步。
                                               * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                               * @returns 返回当前分支执行后的处理结果。
                                               */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:202`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./05-datasource/AsyncOptionsForm') },
  DependentDataSourceForm: { group: '05-datasource', /**
                                                      * loader：执行当前位置的功能逻辑。
                                                      * 定位：`playground/shared/src/index.ts:56`。
                                                      * 功能：处理参数消化、状态变更与调用链行为同步。
                                                      * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                      * @returns 返回当前分支执行后的处理结果。
                                                      */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:210`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./05-datasource/DependentDataSourceForm') },
  PaginatedSearchForm: { group: '05-datasource', /**
                                                  * loader：执行当前位置的功能逻辑。
                                                  * 定位：`playground/shared/src/index.ts:57`。
                                                  * 功能：处理参数消化、状态变更与调用链行为同步。
                                                  * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                  * @returns 返回当前分支执行后的处理结果。
                                                  */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:218`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./05-datasource/PaginatedSearchForm') },
  RemoteDataSourceForm: { group: '05-datasource', /**
                                                   * loader：执行当前位置的功能逻辑。
                                                   * 定位：`playground/shared/src/index.ts:58`。
                                                   * 功能：处理参数消化、状态变更与调用链行为同步。
                                                   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                   * @returns 返回当前分支执行后的处理结果。
                                                   */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:226`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./05-datasource/RemoteDataSourceForm') },

  /* 06-layout — 布局分组（4 个） */
  CardGroupForm: { group: '06-layout', /**
                                        * loader：执行当前位置的功能逻辑。
                                        * 定位：`playground/shared/src/index.ts:61`。
                                        * 功能：处理参数消化、状态变更与调用链行为同步。
                                        * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                        * @returns 返回当前分支执行后的处理结果。
                                        */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:236`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./06-layout/CardGroupForm') },
  CollapseGroupForm: { group: '06-layout', /**
                                            * loader：执行当前位置的功能逻辑。
                                            * 定位：`playground/shared/src/index.ts:62`。
                                            * 功能：处理参数消化、状态变更与调用链行为同步。
                                            * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                            * @returns 返回当前分支执行后的处理结果。
                                            */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:244`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./06-layout/CollapseGroupForm') },
  StepForm: { group: '06-layout', /**
                                   * loader：执行当前位置的功能逻辑。
                                   * 定位：`playground/shared/src/index.ts:63`。
                                   * 功能：处理参数消化、状态变更与调用链行为同步。
                                   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                   * @returns 返回当前分支执行后的处理结果。
                                   */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:252`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./06-layout/StepForm') },
  TabGroupForm: { group: '06-layout', /**
                                       * loader：执行当前位置的功能逻辑。
                                       * 定位：`playground/shared/src/index.ts:64`。
                                       * 功能：处理参数消化、状态变更与调用链行为同步。
                                       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                       * @returns 返回当前分支执行后的处理结果。
                                       */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:260`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./06-layout/TabGroupForm') },

  /* 07-dynamic — 动态表单（3 个） */
  DynamicFieldForm: { group: '07-dynamic', /**
                                            * loader：执行当前位置的功能逻辑。
                                            * 定位：`playground/shared/src/index.ts:67`。
                                            * 功能：处理参数消化、状态变更与调用链行为同步。
                                            * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                            * @returns 返回当前分支执行后的处理结果。
                                            */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:270`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./07-dynamic/DynamicFieldForm') },
  DynamicSchemaForm: { group: '07-dynamic', /**
                                             * loader：执行当前位置的功能逻辑。
                                             * 定位：`playground/shared/src/index.ts:68`。
                                             * 功能：处理参数消化、状态变更与调用链行为同步。
                                             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                             * @returns 返回当前分支执行后的处理结果。
                                             */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:278`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./07-dynamic/DynamicSchemaForm') },
  TemplateReuseForm: { group: '07-dynamic', /**
                                             * loader：执行当前位置的功能逻辑。
                                             * 定位：`playground/shared/src/index.ts:69`。
                                             * 功能：处理参数消化、状态变更与调用链行为同步。
                                             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                             * @returns 返回当前分支执行后的处理结果。
                                             */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:286`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./07-dynamic/TemplateReuseForm') },

  /*
   * 08-components — 自定义组件（4 个）
   *
   * 覆盖所有注册模式：
   * - 有 defaultDecorator（ColorPicker + FormItem 包裹）
   * - 有 readPrettyComponent（ColorPicker 编辑态/阅读态自动切换）
   * - 无 defaultDecorator（CodeEditor / SignaturePad 裸渲染）
   */
  ColorPickerForm: { group: '08-components', /**
                                              * loader：执行当前位置的功能逻辑。
                                              * 定位：`playground/shared/src/index.ts:79`。
                                              * 功能：处理参数消化、状态变更与调用链行为同步。
                                              * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                              * @returns 返回当前分支执行后的处理结果。
                                              */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:303`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./08-components/ColorPickerForm') },
  CronEditorForm: { group: '08-components', /**
                                             * loader：执行当前位置的功能逻辑。
                                             * 定位：`playground/shared/src/index.ts:80`。
                                             * 功能：处理参数消化、状态变更与调用链行为同步。
                                             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                             * @returns 返回当前分支执行后的处理结果。
                                             */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:311`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./08-components/CronEditorForm') },
  RawComponentForm: { group: '08-components', /**
                                               * loader：执行当前位置的功能逻辑。
                                               * 定位：`playground/shared/src/index.ts:81`。
                                               * 功能：处理参数消化、状态变更与调用链行为同步。
                                               * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                               * @returns 返回当前分支执行后的处理结果。
                                               */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:319`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./08-components/RawComponentForm') },
  ReadPrettyComponentForm: { group: '08-components', /**
                                                      * loader：执行当前位置的功能逻辑。
                                                      * 定位：`playground/shared/src/index.ts:82`。
                                                      * 功能：处理参数消化、状态变更与调用链行为同步。
                                                      * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                      * @returns 返回当前分支执行后的处理结果。
                                                      */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:327`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./08-components/ReadPrettyComponentForm') },

  /* 09-advanced — 进阶能力（11 个） */
  SchemaExpressionForm: { group: '09-advanced', /**
                                                 * loader：执行当前位置的功能逻辑。
                                                 * 定位：`playground/shared/src/index.ts:85`。
                                                 * 功能：处理参数消化、状态变更与调用链行为同步。
                                                 * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                 * @returns 返回当前分支执行后的处理结果。
                                                 */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:337`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./11-advanced/SchemaExpressionForm') },
  ExpressionEngineForm: { group: '09-advanced', /**
                                                 * loader：执行当前位置的功能逻辑。
                                                 * 定位：`playground/shared/src/index.ts:86`。
                                                 * 功能：处理参数消化、状态变更与调用链行为同步。
                                                 * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                 * @returns 返回当前分支执行后的处理结果。
                                                 */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:345`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./11-advanced/ExpressionEngineForm') },
  SchemaRefForm: { group: '09-advanced', /**
                                          * loader：执行当前位置的功能逻辑。
                                          * 定位：`playground/shared/src/index.ts:87`。
                                          * 功能：处理参数消化、状态变更与调用链行为同步。
                                          * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                          * @returns 返回当前分支执行后的处理结果。
                                          */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:353`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./11-advanced/SchemaRefForm') },
  EffectsForm: { group: '09-advanced', /**
                                        * loader：执行当前位置的功能逻辑。
                                        * 定位：`playground/shared/src/index.ts:88`。
                                        * 功能：处理参数消化、状态变更与调用链行为同步。
                                        * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                        * @returns 返回当前分支执行后的处理结果。
                                        */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:361`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./11-advanced/EffectsForm') },
  CustomDecoratorForm: { group: '09-advanced', /**
                                                * loader：执行当前位置的功能逻辑。
                                                * 定位：`playground/shared/src/index.ts:89`。
                                                * 功能：处理参数消化、状态变更与调用链行为同步。
                                                * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                * @returns 返回当前分支执行后的处理结果。
                                                */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:369`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./11-advanced/CustomDecoratorForm') },
  OneOfSchemaForm: { group: '09-advanced', /**
                                            * loader：执行当前位置的功能逻辑。
                                            * 定位：`playground/shared/src/index.ts:90`。
                                            * 功能：处理参数消化、状态变更与调用链行为同步。
                                            * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                            * @returns 返回当前分支执行后的处理结果。
                                            */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:377`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./11-advanced/OneOfSchemaForm') },
  EffectsAPIForm: { group: '09-advanced', /**
                                           * loader：执行当前位置的功能逻辑。
                                           * 定位：`playground/shared/src/index.ts:91`。
                                           * 功能：处理参数消化、状态变更与调用链行为同步。
                                           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                           * @returns 返回当前分支执行后的处理结果。
                                           */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:385`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./11-advanced/EffectsAPIForm') },
  GridLayoutForm: { group: '09-advanced', /**
                                           * loader：执行当前位置的功能逻辑。
                                           * 定位：`playground/shared/src/index.ts:92`。
                                           * 功能：处理参数消化、状态变更与调用链行为同步。
                                           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                           * @returns 返回当前分支执行后的处理结果。
                                           */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:393`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./11-advanced/GridLayoutForm') },
  LargeFormPerf: { group: '09-advanced', /**
                                          * loader：执行当前位置的功能逻辑。
                                          * 定位：`playground/shared/src/index.ts:93`。
                                          * 功能：处理参数消化、状态变更与调用链行为同步。
                                          * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                          * @returns 返回当前分支执行后的处理结果。
                                          */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:401`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./11-advanced/LargeFormPerf') },
  SSRCompatForm: { group: '09-advanced', /**
                                          * loader：执行当前位置的功能逻辑。
                                          * 定位：`playground/shared/src/index.ts:94`。
                                          * 功能：处理参数消化、状态变更与调用链行为同步。
                                          * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                          * @returns 返回当前分支执行后的处理结果。
                                          */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:409`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./11-advanced/SSRCompatForm') },
  VirtualScrollForm: { group: '09-advanced', /**
                                              * loader：执行当前位置的功能逻辑。
                                              * 定位：`playground/shared/src/index.ts:95`。
                                              * 功能：处理参数消化、状态变更与调用链行为同步。
                                              * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                              * @returns 返回当前分支执行后的处理结果。
                                              */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:417`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./11-advanced/VirtualScrollForm') },

  /* 10-state — 状态管理（5 个） */
  LifecycleForm: { group: '10-state', /**
                                       * loader：执行当前位置的功能逻辑。
                                       * 定位：`playground/shared/src/index.ts:98`。
                                       * 功能：处理参数消化、状态变更与调用链行为同步。
                                       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                       * @returns 返回当前分支执行后的处理结果。
                                       */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:427`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./09-state/LifecycleForm') },
  DataTransformForm: { group: '10-state', /**
                                           * loader：执行当前位置的功能逻辑。
                                           * 定位：`playground/shared/src/index.ts:99`。
                                           * 功能：处理参数消化、状态变更与调用链行为同步。
                                           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                           * @returns 返回当前分支执行后的处理结果。
                                           */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:435`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./09-state/DataTransformForm') },
  PatternSwitchForm: { group: '10-state', /**
                                           * loader：执行当前位置的功能逻辑。
                                           * 定位：`playground/shared/src/index.ts:100`。
                                           * 功能：处理参数消化、状态变更与调用链行为同步。
                                           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                           * @returns 返回当前分支执行后的处理结果。
                                           */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:443`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./09-state/PatternSwitchForm') },
  DisplayTriStateForm: { group: '10-state', /**
                                             * loader：执行当前位置的功能逻辑。
                                             * 定位：`playground/shared/src/index.ts:101`。
                                             * 功能：处理参数消化、状态变更与调用链行为同步。
                                             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                             * @returns 返回当前分支执行后的处理结果。
                                             */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:451`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./09-state/DisplayTriStateForm') },
  FormGraphForm: { group: '10-state', /**
                                       * loader：执行当前位置的功能逻辑。
                                       * 定位：`playground/shared/src/index.ts:102`。
                                       * 功能：处理参数消化、状态变更与调用链行为同步。
                                       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                       * @returns 返回当前分支执行后的处理结果。
                                       */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:459`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./09-state/FormGraphForm') },

  /* 11-misc — 其他能力（2 个） */
  I18nForm: { group: '11-misc', /**
                                 * loader：执行当前位置的功能逻辑。
                                 * 定位：`playground/shared/src/index.ts:105`。
                                 * 功能：处理参数消化、状态变更与调用链行为同步。
                                 * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                 * @returns 返回当前分支执行后的处理结果。
                                 */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:469`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./10-misc/I18nForm') },
  PrintExportForm: { group: '11-misc', /**
                                        * loader：执行当前位置的功能逻辑。
                                        * 定位：`playground/shared/src/index.ts:106`。
                                        * 功能：处理参数消化、状态变更与调用链行为同步。
                                        * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                        * @returns 返回当前分支执行后的处理结果。
                                        */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:477`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./10-misc/PrintExportForm') },

  /* 12-plugin — 插件能力（2 个） */
  JsonSchemaAdapterForm: { group: '12-plugin', /**
                                                * loader：执行当前位置的功能逻辑。
                                                * 定位：`playground/shared/src/index.ts:109`。
                                                * 功能：处理参数消化、状态变更与调用链行为同步。
                                                * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                                * @returns 返回当前分支执行后的处理结果。
                                                */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:487`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./11-advanced/JsonSchemaAdapterForm') },
  LowCodeDesignerForm: { group: '12-plugin', /**
                                              * loader：执行当前位置的功能逻辑。
                                              * 定位：`playground/shared/src/index.ts:110`。
                                              * 功能：处理参数消化、状态变更与调用链行为同步。
                                              * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
                                              * @returns 返回当前分支执行后的处理结果。
                                              */
    /**
     * loader：执行当前位置的功能逻辑。
     * 定位：`playground/shared/src/index.ts:495`。
     * 功能：处理参数消化、状态变更与调用链行为同步。
     * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
     * @returns 返回当前分支执行后的处理结果。
     */
    loader: () => import('./10-misc/LowCodeDesignerForm') },
}

/** 场景分组列表（从 registry 自动生成） */
export function getSceneGroups(): Array<{ key: string, label: string, items: string[] }> {
  const groupMap = new Map<string, string[]>()

  for (const [name, { group }] of Object.entries(sceneRegistry)) {
    if (!groupMap.has(group))
      groupMap.set(group, [])
    groupMap.get(group)!.push(name)
  }

  return Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => ({
      key,
      label: GROUP_LABELS[key] ?? key,
      items: items.sort(),
    }))
}
