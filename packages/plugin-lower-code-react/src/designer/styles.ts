export const DESIGNER_CSS = `
.cf-lc-root {
  --cf-lc-blue: #2563eb;
  --cf-lc-blue-soft: #dbeafe;
  --cf-lc-ink: #0f172a;
  --cf-lc-muted: #64748b;
  --cf-lc-border: #dbe4f0;
  --cf-lc-panel-bg: #ffffff;
  border: 1px solid #d7e0ef;
  border-radius: 20px;
  overflow: hidden;
  background:
    radial-gradient(circle at 12% 10%, #f2f7ff 0, #f2f7ff 28%, transparent 70%),
    radial-gradient(circle at 92% 92%, #f2fff7 0, #f2fff7 20%, transparent 62%),
    #f8fbff;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  font-family: "Avenir Next", "PingFang SC", "Segoe UI", sans-serif;
  color: var(--cf-lc-ink);
}

.cf-lc-header {
  padding: 16px 20px;
  border-bottom: 1px solid #d5e2f3;
  background: linear-gradient(112deg, #0f172a 0%, #1e3a8a 58%, #0d9488 120%);
  color: #f8fafc;
}

.cf-lc-header-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.cf-lc-header-desc {
  margin-top: 6px;
  font-size: 12px;
  color: #dbeafe;
}

.cf-lc-main-grid {
  margin: 0;
  min-height: 0;
}

.cf-lc-main-grid > div {
  display: grid;
  grid-template-columns: 250px minmax(560px, 1fr) 340px;
  gap: 14px;
  padding: 14px;
  align-items: stretch;
  height: clamp(360px, 55vh, 640px);
  min-height: 0;
}

.cf-lc-bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  padding: 0 14px 14px;
}

.cf-lc-panel {
  border: 1px solid var(--cf-lc-border);
  border-radius: 14px;
  background: var(--cf-lc-panel-bg);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
  overflow: hidden;
  min-height: 0;
}

.cf-lc-panel-title {
  margin: 0;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 700;
  border-bottom: 1px solid #edf2f8;
  background: linear-gradient(180deg, #f8fbff 0%, #f6fafb 100%);
}

.cf-lc-panel-body {
  padding: 12px;
  min-height: 0;
}

.cf-lc-pane-configform-shell,
.cf-lc-pane-configform-shell > form,
.cf-lc-pane-configform-shell > form > div {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
}

.cf-lc-pane-configform-shell > form {
  margin: 0;
}

.cf-lc-panel--side .cf-lc-panel-body {
  height: 100%;
  min-height: 0;
}

.cf-lc-side-panel-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  min-height: 0;
}

.cf-lc-side-panel-shell {
  min-height: 0;
}

.cf-lc-side-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding-right: 2px;
}

.cf-lc-side-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.cf-lc-side-panel-title {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.01em;
}

.cf-lc-side-panel-meta {
  max-width: 170px;
  border: 1px solid #d5e2f3;
  border-radius: 999px;
  padding: 2px 8px;
  background: #f8fbff;
  color: #475569;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cf-lc-card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
}

.cf-lc-card-main {
  min-width: 0;
  flex: 1;
  display: grid;
  gap: 2px;
}

.cf-lc-card-title {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.cf-lc-card-description {
  font-size: 12px;
  color: #64748b;
  line-height: 1.2;
}

.cf-lc-card-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cf-lc-material-panel-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.cf-lc-material-pane-form {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.cf-lc-material-pane-form > div {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  gap: 10px;
}

.cf-lc-material-pane-form .ant-tabs {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.cf-lc-material-pane-form .ant-tabs-content-holder,
.cf-lc-material-pane-form .ant-tabs-content,
.cf-lc-material-pane-form .ant-tabs-tabpane {
  min-height: 0;
  height: 100%;
}

.cf-lc-material-pane-form .ant-tabs-tabpane:not(.ant-tabs-tabpane-hidden) {
  display: flex;
  flex-direction: column;
}

.cf-lc-material-toolbar {
  display: grid;
  gap: 8px;
}

.cf-lc-material-search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}

.cf-lc-material-search {
  margin-top: 0;
  padding: 6px 8px;
  font-size: 12px;
}

.cf-lc-material-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.cf-lc-side-pill {
  display: inline-flex;
  align-items: center;
  border: 1px solid #d5e2f3;
  border-radius: 999px;
  background: #f8fbff;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  white-space: nowrap;
}

.cf-lc-side-hint {
  margin-left: auto;
  color: #94a3b8;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cf-lc-btn {
  border: 1px solid #d0dbe9;
  background: #fff;
  color: #334155;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 12px;
  line-height: 1.2;
  cursor: pointer;
  transition: all .15s ease;
}

.cf-lc-btn:hover {
  border-color: #93c5fd;
  color: #1d4ed8;
  background: #eff6ff;
}

.cf-lc-btn--primary {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
}

.cf-lc-btn--danger {
  border-color: #fecaca;
  color: #b91c1c;
  background: #fff5f5;
}

.cf-lc-material-list {
  display: grid;
  gap: 8px;
  align-content: start;
  padding-right: 2px;
}

.cf-lc-material-list-wrap {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  max-height: 100%;
  overflow: hidden;
}

.cf-lc-material-list-wrap .cf-lc-material-list {
  min-height: 0;
}

.cf-lc-material-item {
  border: 1px solid #cfe0ff;
  border-radius: 10px;
  padding: 7px;
  width: 100%;
  box-sizing: border-box;
  background: linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%);
  user-select: none;
  cursor: grab;
  display: grid;
  gap: 6px;
  transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease;
}

.cf-lc-material-item:active {
  cursor: grabbing;
}

.cf-lc-material-item:hover {
  border-color: #93c5fd;
  box-shadow: 0 8px 16px rgba(37, 99, 235, 0.12);
  transform: translateY(-1px);
}

.cf-lc-material-item.cf-lc-chosen,
.cf-lc-material-item.cf-lc-dragging {
  transition: none !important;
}

.cf-lc-material-head {
  align-items: baseline;
}

.cf-lc-material-title {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.15;
}

.cf-lc-material-desc-inline {
  font-size: 10px;
  color: #94a3b8;
  line-height: 1.2;
}

.cf-lc-material-preview {
  border: 1px solid #d8e3f2;
  border-radius: 9px;
  background: #fff;
  min-height: 36px;
  padding: 6px 7px;
  box-sizing: border-box;
  overflow: hidden;
}

.cf-lc-material-preview--material {
  min-height: 62px;
}

.cf-lc-material-preview--material > .cf-lc-mask-layer {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cf-lc-mask-layer--material > .cf-lc-mask-layer-content {
  width: 100%;
  min-height: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cf-lc-mask-layer {
  position: relative;
  width: 100%;
  min-height: inherit;
  border-radius: inherit;
}

.cf-lc-mask-layer-content {
  width: 100%;
  min-height: inherit;
  margin: 0;
  padding: 0;
  gap: 0;
  box-sizing: border-box;
}

.cf-lc-mask-layer--locked .cf-lc-mask-layer-content,
.cf-lc-mask-layer--locked .cf-lc-mask-layer-content * {
  pointer-events: none !important;
}

.cf-lc-mask-layer-actions {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 16;
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}

.cf-lc-mask-layer-overlay {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: transparent;
  pointer-events: none;
}

.cf-lc-real-preview-wrap {
  width: 100%;
  pointer-events: none;
}

.cf-lc-real-preview-wrap > form {
  margin: 0;
}

.cf-lc-real-preview-wrap .ant-form-item {
  margin-bottom: 8px;
}

.cf-lc-real-preview-wrap .ant-tabs {
  font-size: 12px;
}

.cf-lc-real-preview-wrap .ant-collapse {
  font-size: 12px;
}

.cf-lc-real-preview-wrap .ant-card {
  box-shadow: none;
}

.cf-lc-real-preview-wrap--container {
  max-height: 150px;
  overflow: hidden;
}

.cf-lc-material-preview-control {
  height: 28px;
  border: 1px solid #d4dce8;
  border-radius: 6px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #94a3b8;
  font-size: 12px;
  background: #fff;
}

.cf-lc-material-preview-control--number {
  padding-right: 0;
}

.cf-lc-material-preview-control--date {
  gap: 8px;
}

.cf-lc-material-preview-placeholder {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cf-lc-material-preview-arrow {
  color: #64748b;
  font-size: 10px;
}

.cf-lc-material-preview-stepper {
  display: grid;
  grid-template-rows: 1fr 1fr;
  width: 18px;
  height: 100%;
  border-left: 1px solid #e2e8f0;
}

.cf-lc-material-preview-stepper i {
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: normal;
  color: #64748b;
  line-height: 1;
}

.cf-lc-material-preview-stepper i:first-child {
  border-bottom: 1px solid #e2e8f0;
}

.cf-lc-material-preview-switch-wrap {
  height: 28px;
  display: flex;
  align-items: center;
}

.cf-lc-material-preview-switch {
  width: 34px;
  height: 20px;
  border-radius: 999px;
  background: #cbd5e1;
  position: relative;
}

.cf-lc-material-preview-switch::after {
  content: "";
  position: absolute;
  left: 2px;
  top: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.cf-lc-material-preview-calendar {
  width: 14px;
  height: 14px;
  border: 1px solid #94a3b8;
  border-radius: 3px;
  position: relative;
  box-sizing: border-box;
}

.cf-lc-material-preview-calendar i {
  position: absolute;
  left: 2px;
  right: 2px;
  display: block;
  height: 1px;
  background: #94a3b8;
}

.cf-lc-material-preview-calendar i:first-child {
  top: 3px;
}

.cf-lc-material-preview-calendar i:last-child {
  top: 6px;
}

.cf-lc-material-preview-textarea {
  min-height: 44px;
  border: 1px solid #d4dce8;
  border-radius: 6px;
  padding: 8px;
  box-sizing: border-box;
  display: grid;
  gap: 5px;
}

.cf-lc-material-preview-textarea span {
  display: block;
  height: 4px;
  border-radius: 3px;
  background: #dbe7f7;
}

.cf-lc-material-preview-textarea span:nth-child(2) {
  width: 82%;
}

.cf-lc-material-preview-textarea span:nth-child(3) {
  width: 64%;
}

.cf-lc-material-preview-layout-card,
.cf-lc-material-preview-layout-tabs,
.cf-lc-material-preview-layout-collapse {
  display: grid;
  gap: 6px;
}

.cf-lc-material-preview-layout-head {
  height: 9px;
  border-radius: 4px;
  background: #dbe7f7;
}

.cf-lc-material-preview-layout-body {
  border: 1px dashed #cfdced;
  border-radius: 6px;
  padding: 6px;
  display: grid;
  gap: 4px;
  min-height: 20px;
}

.cf-lc-material-preview-layout-body span {
  display: block;
  height: 4px;
  border-radius: 3px;
  background: #dce7f4;
}

.cf-lc-material-preview-tabs-head {
  display: flex;
  gap: 6px;
  border-bottom: 1px solid #dbe5f3;
  padding-bottom: 4px;
}

.cf-lc-material-preview-tabs-head span {
  width: 38px;
  height: 8px;
  border-radius: 4px 4px 0 0;
  background: #dbe7f7;
}

.cf-lc-material-preview-tabs-head span.is-active {
  background: #93c5fd;
}

.cf-lc-material-preview-collapse-row {
  height: 12px;
  border-radius: 6px;
  border: 1px solid #dbe4f2;
  background: linear-gradient(180deg, #fafcff 0%, #f1f6fd 100%);
}

.cf-lc-canvas-wrap {
  padding: 12px;
  height: 100%;
  min-height: 0;
  overflow: auto;
  box-sizing: border-box;
}

.cf-lc-drop-list {
  border: 1px dashed #d4dee9;
  border-radius: 12px;
  background:
    linear-gradient(180deg, #fcfdff 0%, #f7fafe 100%),
    repeating-linear-gradient(45deg, rgba(148, 163, 184, 0.06) 0, rgba(148, 163, 184, 0.06) 4px, transparent 4px, transparent 10px);
  display: grid;
  gap: 8px;
}

.cf-lc-drop-list--nested {
  border-style: dashed;
  border-color: #e2e8f0;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.cf-lc-empty {
  color: #94a3b8;
  font-size: 12px;
}

.cf-lc-empty--compact {
  border: 1px dashed #dbe4f0;
  border-radius: 10px;
  padding: 8px 10px;
  background: #f8fbff;
}

.cf-lc-node {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  border-radius: 10px;
  border: 1px solid transparent;
  background: #ffffff;
  padding: 0;
  user-select: none;
  touch-action: none;
  transition: border-color .16s ease, box-shadow .16s ease, background-color .16s ease, transform .16s ease;
}

.cf-lc-node-toolbar {
  position: static;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px;
  border: 1px solid #d5e2f3;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.14);
  opacity: 0;
  transform: translateY(-2px) scale(0.98);
  pointer-events: none;
  transition: opacity .12s ease, transform .12s ease, border-color .12s ease;
}

.cf-lc-node--selected .cf-lc-node-toolbar {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
  border-color: #93c5fd;
}

.cf-lc-node-tool {
  width: 22px;
  height: 22px;
  border: 1px solid #d5e2f3;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.98);
  color: #64748b;
  font-size: 12px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: border-color .14s ease, color .14s ease, background-color .14s ease;
  box-shadow: 0 6px 12px rgba(15, 23, 42, 0.12);
}

.cf-lc-node-tool--move {
  cursor: grab;
}

.cf-lc-node-tool--move:active {
  cursor: grabbing;
}

.cf-lc-node-tool:hover {
  border-color: #93c5fd;
  color: #1d4ed8;
}

.cf-lc-node-tool--primary {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #2563eb;
}

.cf-lc-node-tool--danger {
  border-color: #fecaca;
  background: #fff5f5;
  color: #dc2626;
}

.cf-lc-node::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(90deg, #60a5fa 0 4px, transparent 4px 7px) top / 7px 1px repeat-x,
    linear-gradient(90deg, #60a5fa 0 4px, transparent 4px 7px) bottom / 7px 1px repeat-x,
    linear-gradient(0deg, #60a5fa 0 4px, transparent 4px 7px) left / 1px 7px repeat-y,
    linear-gradient(0deg, #60a5fa 0 4px, transparent 4px 7px) right / 1px 7px repeat-y;
  pointer-events: none;
  opacity: 0;
  transition: opacity .12s ease;
}

.cf-lc-node--field {
  display: block;
}

.cf-lc-node--selected {
  border-color: #bfdbfe;
  box-shadow: 0 0 0 1px #dbeafe;
  background: #f8fbff;
}

.cf-lc-node--selected.cf-lc-node--container > .cf-lc-mask-layer > .cf-lc-mask-layer-content,
.cf-lc-node--selected.cf-lc-node--field > .cf-lc-node-preview > .cf-lc-material-preview > .cf-lc-mask-layer > .cf-lc-mask-layer-content {
  padding: 2px;
}

.cf-lc-node--selected::after {
  opacity: 1;
}

.cf-lc-container-body {
  padding-top: 0;
  display: grid;
  gap: 8px;
  background: transparent;
}

.cf-lc-node-preview {
  margin-top: 0;
  padding-top: 0;
}

.cf-lc-node-preview .cf-lc-material-preview {
  min-height: auto;
  border: 0;
  background: transparent;
  box-shadow: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cf-lc-node-preview--container .cf-lc-material-preview {
  border: 0;
}

.cf-lc-node--field .cf-lc-mask-layer-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cf-lc-layout-card-shell {
  border: 1px solid #dbe4f0;
  border-radius: 12px;
  background: #ffffff;
  overflow: hidden;
}

.cf-lc-layout-card-head {
  padding: 10px 12px;
  border-bottom: 1px solid #e6edf7;
  background: linear-gradient(180deg, #fbfdff 0%, #f5f9ff 100%);
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
}

.cf-lc-layout-card-shell > .cf-lc-drop-list {
  border: 0;
  border-radius: 0 0 12px 12px;
  background: #ffffff;
}

.cf-lc-layout-tabs-shell {
  border: 1px solid #dbe4f0;
  border-radius: 12px;
  background: #ffffff;
  overflow: hidden;
}

.cf-lc-layout-tabs-nav {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #e6edf7;
  background: #f8fbff;
  padding: 4px 8px 0;
}

.cf-lc-layout-tabs-tab {
  border: 1px solid transparent;
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  background: transparent;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 10px;
  cursor: pointer;
}

.cf-lc-layout-tabs-tab.is-active {
  color: #1d4ed8;
  border-color: #bfdbfe;
  background: #ffffff;
}

.cf-lc-layout-tabs-panels {
  display: grid;
  gap: 8px;
  padding: 8px;
}

.cf-lc-layout-collapse-shell {
  display: grid;
  gap: 8px;
}

.cf-lc-section {
  position: relative;
  border: 1px solid transparent;
  border-radius: 9px;
  background: #ffffff;
  padding: 8px;
}

.cf-lc-section::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(90deg, #60a5fa 0 4px, transparent 4px 7px) top / 7px 1px repeat-x,
    linear-gradient(90deg, #60a5fa 0 4px, transparent 4px 7px) bottom / 7px 1px repeat-x,
    linear-gradient(0deg, #60a5fa 0 4px, transparent 4px 7px) left / 1px 7px repeat-y,
    linear-gradient(0deg, #60a5fa 0 4px, transparent 4px 7px) right / 1px 7px repeat-y;
  pointer-events: none;
  opacity: 0;
  transition: opacity .12s ease;
}

.cf-lc-section--tabs {
  border-style: dashed;
  background: #fbfdff;
}

.cf-lc-section--collapse {
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
}

.cf-lc-section--selected {
  border-color: #bfdbfe;
  box-shadow: 0 0 0 1px #dbeafe;
  background: rgba(239, 246, 255, 0.56);
}

.cf-lc-section--selected::after {
  opacity: 1;
}

.cf-lc-section-head {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding-right: 28px;
  margin-bottom: 8px;
}

.cf-lc-section-title {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.cf-lc-section-title.is-selected {
  color: #1d4ed8;
}

.cf-lc-section-action {
  position: absolute;
  top: -8px;
  right: -8px;
  border: 1px solid #d5e2f3;
  border-radius: 999px;
  width: 22px;
  height: 22px;
  background: rgba(255, 255, 255, 0.98);
  color: #64748b;
  font-size: 12px;
  line-height: 1;
  padding: 0;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity .12s ease, border-color .12s ease, color .12s ease;
}

.cf-lc-section--selected .cf-lc-section-action {
  opacity: 1;
  pointer-events: auto;
}

.cf-lc-section-action:hover {
  border-color: #fecaca;
  color: #dc2626;
}

.cf-lc-control-label {
  display: block;
  margin-bottom: 10px;
  font-size: 12px;
  color: #4b5563;
  font-weight: 600;
}

.cf-lc-control-input,
.cf-lc-control-select,
.cf-lc-control-textarea {
  margin-top: 5px;
  width: 100%;
  border: 1px solid #d3deeb;
  border-radius: 8px;
  padding: 7px 9px;
  font-size: 13px;
  color: #0f172a;
  background: #fff;
  box-sizing: border-box;
}

.cf-lc-control-textarea {
  resize: vertical;
}

.cf-lc-control-textarea--code {
  min-height: 104px;
  font-family: Consolas, "SFMono-Regular", Menlo, monospace;
}

.cf-lc-control-input:focus,
.cf-lc-control-select:focus,
.cf-lc-control-textarea:focus {
  border-color: #60a5fa;
  outline: none;
  box-shadow: 0 0 0 2px #dbeafe;
}

.cf-lc-inline-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #4b5563;
  font-weight: 600;
  margin-bottom: 6px;
}

.cf-lc-property-form {
  display: grid;
  gap: 8px;
}

.cf-lc-property-section {
  border: 1px solid #e5edf7;
  border-radius: 10px;
  padding: 10px;
  background: #fbfdff;
}

.cf-lc-property-section-title {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
}

.cf-lc-property-readonly {
  margin: -2px 0 4px;
  color: #64748b;
  font-size: 12px;
}

.cf-lc-property-readonly code {
  padding: 1px 6px;
  border-radius: 6px;
  border: 1px solid #dbe4f0;
  background: #f8fbff;
  color: #334155;
  font-size: 11px;
}

.cf-lc-property-group {
  border: 1px solid #dbe6f4;
  border-radius: 10px;
  background: #f8fafc;
  display: grid;
  gap: 8px;
}

.cf-lc-property-group-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.cf-lc-property-group-title {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.cf-lc-property-group-list {
  display: grid;
  gap: 8px;
}

.cf-lc-property-group-item {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 8px;
  background: #ffffff;
}

.cf-lc-property-group-index {
  margin: -2px 0 6px;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
}

.cf-lc-empty-hint {
  border: 1px dashed #dbe4f0;
  border-radius: 10px;
  padding: 10px;
  background: #f8fbff;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.cf-lc-side-note {
  border-top: 1px dashed #e2e8f0;
  padding-top: 8px;
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.5;
}

.cf-lc-preview-list {
  border-top: 1px solid #eef2f8;
  padding: 12px;
  display: grid;
  gap: 10px;
}

.cf-lc-preview-item {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px;
  background: #fff;
}

.cf-lc-preview-title {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.cf-lc-ghost {
  opacity: 0.24;
  border: 1px dashed #1d4ed8 !important;
  background: linear-gradient(180deg, #eef5ff 0%, #dbeafe 100%) !important;
}

.cf-lc-chosen {
  box-shadow: 0 0 0 2px #bfdbfe, 0 10px 24px rgba(37, 99, 235, 0.22);
  transition: none !important;
}

.cf-lc-dragging {
  opacity: 0.95;
  transition: none !important;
}

.cf-lc-sortable-fallback {
  pointer-events: none;
  opacity: 0.96;
  margin: 0 !important;
  transition: none !important;
  will-change: transform;
  border-color: #60a5fa !important;
  background: rgba(255, 255, 255, 0.98) !important;
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.22);
}

.cf-lc-body-dragging,
.cf-lc-body-dragging * {
  cursor: grabbing !important;
  user-select: none !important;
}

.cf-lc-drop-list.sortable-over {
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px #dbeafe inset;
  background:
    linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%),
    repeating-linear-gradient(45deg, rgba(59, 130, 246, 0.08) 0, rgba(59, 130, 246, 0.08) 4px, transparent 4px, transparent 10px);
}

@media (max-width: 1500px) {
  .cf-lc-main-grid > div {
    grid-template-columns: 230px minmax(480px, 1fr) 320px;
  }
}

@media (max-width: 1240px) {
  .cf-lc-main-grid > div {
    grid-template-columns: 1fr;
  }

  .cf-lc-material-list-wrap {
    max-height: none;
  }
}
`
