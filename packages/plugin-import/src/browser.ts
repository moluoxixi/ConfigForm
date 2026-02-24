/**
 * read File As Text：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-import/src/browser.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param file 参数 `file`用于提供当前函数执行所需的输入信息。
 * @returns 返回 Promise 异步结果，调用方应通过 await 或 then 获取最终数据。
 */
export async function readFileAsText(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text()
  }

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(String(reader.result ?? ''))
    }
    reader.onerror = () => {
      reject(reader.error ?? new Error('[plugin-import] Failed to read file.'))
    }
    reader.readAsText(file)
  })
}
