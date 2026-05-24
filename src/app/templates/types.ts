type StyleParamBase = { key: string; label: string; group?: string; canonical?: string }

export type StyleParam =
  | (StyleParamBase & { type: 'color'; default: string })
  | (StyleParamBase & {
      type: 'range'
      min: number
      max: number
      step: number
      unit: string
      default: number
    })
  | (StyleParamBase & {
      type: 'select'
      options: Array<{ label: string; value: string }>
      default: string
    })
  | (StyleParamBase & { type: 'toggle'; default: string })
  | (StyleParamBase & { type: 'text'; placeholder?: string; default: string })

export type StyleValues = Record<string, string | number>

export type FullSection = {
  kind: 'full'
  key: string
  id: string
  breakable: boolean
  pre_spacing?: number
  post_spacing?: number
}
export type ColumnsSection = {
  kind: 'columns'
  key: string
  columns: number
  content: string[][]
  breakable: boolean
  pre_spacing?: number
  post_spacing?: number
}
export type EditorSection = FullSection | ColumnsSection
export type SidebarSection = {
  id: string
  breakable: boolean
  pre_spacing?: number
  post_spacing?: number
}

export type LayoutStructure = {
  header: { style: 'split' | 'stacked' }
  sidebarSections?: SidebarSection[]
  sections: EditorSection[]
}

/** Full editor state — layout structure + style values combined. */
export type EditorState = LayoutStructure & { style: StyleValues }

export type SerializedSection =
  | { id: string; breakable: boolean; pre_spacing?: number; post_spacing?: number }
  | {
      type: 'columns'
      columns: number
      content: string[][]
      breakable: boolean
      pre_spacing?: number
      post_spacing?: number
    }

export type LayoutData = {
  header: { style: 'split' | 'stacked' }
  sidebar_sections?: Array<{
    id: string
    breakable: boolean
    pre_spacing?: number
    post_spacing?: number
  }>
  sections: SerializedSection[]
}

export type SavedConfig = {
  id: string
  name: string
  templateId: string
  savedAt: number
  layout: LayoutData
  style: StyleValues
}

export type StyleOverrides = Record<string, string | number>

export type CompileState = 'idle' | 'loading' | 'compiling'

export type Panel = 'layout' | 'style' | 'saved'

export type Layout = { id: string; name: string; description: string; pdf?: string }
export type Template = {
  id: string
  name: string
  description: string
  layouts: Layout[]
  styleParams?: StyleParam[]
}
