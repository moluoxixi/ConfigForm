import 'vue'

declare module 'vue' {
  /**
   * 放宽 `h` 的函数重载签名，兼容第三方 UI 包装层的动态渲染入参。
   *
   * @param type 组件类型、HTML 标签名或异步组件定义。
   * @param props 传入节点的属性对象。
   * @param children 子节点描述，可以是字符串、VNode 或函数。
   * @returns 渲染函数产出的 VNode。
   */
  export function h(type: any, props?: any, children?: any): any
}
