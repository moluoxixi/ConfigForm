/**
 * 将声明文件生成诊断升级为构建失败。
 *
 * `unplugin-dts` 默认会打印诊断后继续完成 Vite 构建；这里保证声明产物错误不会被误判为成功。
 *
 * @param {readonly unknown[]} diagnostics 声明生成阶段返回的 TypeScript 诊断列表。
 * @throws {Error} 当存在任意声明诊断时抛出，阻断构建。
 */
export function failOnDtsDiagnostics(diagnostics) {
  if (diagnostics.length === 0)
    return

  throw new Error(`unplugin-dts reported ${diagnostics.length} declaration diagnostic(s)`)
}
