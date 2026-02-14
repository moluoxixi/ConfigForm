import 'vue'

declare module 'vue' {
  /* Relax h() overloads for third-party UI wrappers */
  export function h(type: any, props?: any, children?: any): any
}
