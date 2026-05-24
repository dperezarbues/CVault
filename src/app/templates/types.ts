type StyleParamBase = { key: string; label: string; group?: string; canonical?: string }

export type StyleParam =
  | StyleParamBase & { type: 'color';  default: string }
  | StyleParamBase & { type: 'range';  min: number; max: number; step: number; unit: string; default: number }
  | StyleParamBase & { type: 'select'; options: Array<{ label: string; value: string }>; default: string }
  | StyleParamBase & { type: 'toggle'; default: string }
  | StyleParamBase & { type: 'text';   placeholder?: string; default: string }

export type StyleValues = Record<string, string | number>

export type FullSection    = { kind: 'full';    key: string; id: string; breakable: boolean; pre_spacing?: number; post_spacing?: number }
export type ColumnsSection = { kind: 'columns'; key: string; columns: number; content: string[][]; breakable: boolean; pre_spacing?: number; post_spacing?: number }
export type EditorSection  = FullSection | ColumnsSection
export type SidebarSection = { id: string; breakable: boolean; pre_spacing?: number; post_spacing?: number }

export type EditorState = {
  header: { style: 'split' | 'stacked' }
  sidebarSections?: SidebarSection[]
  sections: EditorSection[]
  style: StyleValues
}

export type SavedConfig = {
  id: string
  name: string
  templateId: string
  savedAt: number
  layout: object
  style: StyleValues
}

export type StyleOverrides = Record<string, string | number>

export type CompileState = 'idle' | 'loading' | 'compiling'

export type Panel = 'layout' | 'style' | 'saved'
