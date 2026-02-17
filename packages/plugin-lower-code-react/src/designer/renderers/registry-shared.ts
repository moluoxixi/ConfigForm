import type React from 'react'

export type ReactComponentMap = Map<string, React.ComponentType<any>>

export interface RegistrySnapshot {
  components: ReactComponentMap
  decorators: ReactComponentMap
  actions: ReactComponentMap
  defaultDecorators: Map<string, string>
  readPrettyComponents: ReactComponentMap
}

export function mapToRecord<T>(map: Map<string, T>): Record<string, T> {
  const record: Record<string, T> = {}
  for (const [key, value] of map.entries()) {
    record[key] = value
  }
  return record
}
