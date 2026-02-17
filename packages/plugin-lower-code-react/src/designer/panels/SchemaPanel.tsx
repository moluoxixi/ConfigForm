import type React from 'react'

interface SchemaPanelProps {
  editorHostRef: React.RefObject<HTMLDivElement>
}

export function SchemaPanel({ editorHostRef }: SchemaPanelProps): React.ReactElement {
  return (
    <section className="cf-lc-panel">
      <h4 className="cf-lc-panel-title">Schema（JSONEditor）</h4>
      <div ref={editorHostRef} style={{ minHeight: 310 }} />
    </section>
  )
}
