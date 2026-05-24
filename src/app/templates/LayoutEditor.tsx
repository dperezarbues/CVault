'use client'

import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useLayoutEditor } from './hooks/useLayoutEditor'
import { LabelCtx } from './editor-utils'
import AccordionSection from './components/AccordionSection'
import SortableCard from './components/SortableCard'
import SortableSidebarChip from './components/SortableSidebarChip'
import StyleParamField from './components/StyleParamField'
import StyleGroup from './components/StyleGroup'
import { SaveModal, SavedList } from './components/SavedConfigs'
import type { StyleParam } from './types'
import type { SectionDef } from './section-defs'

export type { StyleParam } from './types'
export type { SectionDef } from './section-defs'
export { DEFAULT_SECTIONS } from './section-defs'

export default function LayoutEditor({
  initialLayout, templateId, styleParams = [], sections, cvContent, generateTrigger = 0, onPdfChange, onGenerating,
}: {
  initialLayout: Record<string, unknown>; templateId: string
  styleParams?: StyleParam[]
  sections?: SectionDef[]
  cvContent: string
  generateTrigger?: number
  onPdfChange: (url: string) => void; onGenerating: (v: boolean) => void
}) {
  const ed = useLayoutEditor({ initialLayout, templateId, styleParams, sections, cvContent, generateTrigger, onPdfChange, onGenerating })

  return (
    <LabelCtx.Provider value={ed.getLabel}>
      {ed.showSaveModal && <SaveModal onSave={ed.handleSave} onCancel={() => ed.setShowSaveModal(false)} />}

      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">

          {/* Layout panel */}
          <AccordionSection title="Layout" isOpen={ed.activePanel === 'layout'} onToggle={() => ed.setActivePanel('layout')}>
            {ed.hasSidebar ? (
              <div className="px-4 pb-3">
                <p className="text-xs text-gray-400 mb-2">Name &amp; headline always shown</p>
                <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Sidebar</p>
                <DndContext sensors={ed.sensors} collisionDetection={closestCenter} onDragEnd={ed.handleSidebarDragEnd}>
                  <SortableContext items={ed.layout.sidebarSections!.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-1.5">
                      {ed.layout.sidebarSections!.map(s => (
                        <SortableSidebarChip key={s.id} item={s}
                          onRemove={() => ed.removeSidebarSection(s.id)}
                          onToggleBreakable={() => ed.toggleSidebarBreakable(s.id)}
                          onSpacingChange={(pre, post) => ed.updateSidebarSpacing(s.id, pre, post)} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                {ed.availableSb.length > 0 && (
                  <select className="mt-2 w-full text-xs border border-dashed border-gray-300 rounded px-2 py-1.5 text-gray-500 bg-white"
                    value="" onChange={e => { if (e.target.value) ed.addSidebarSection(e.target.value) }}>
                    <option value="">+ add to sidebar</option>
                    {ed.availableSb.map(id => <option key={id} value={id}>{ed.getLabel(id)}</option>)}
                  </select>
                )}
                <p className="text-xs font-medium text-gray-500 mt-4 mb-1.5 uppercase tracking-wide">Main column</p>
              </div>
            ) : (
              <div className="px-4 pb-3">
                <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Header style</p>
                <div className="flex gap-1 mb-3">
                  {(['split', 'stacked'] as const).map(v => (
                    <button key={v} onClick={() => ed.setHeader(v)}
                      className={`flex-1 text-xs py-1 rounded border transition-colors ${ed.layout.header.style === v ? 'bg-gray-900 text-white border-gray-900' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                      {v}
                    </button>
                  ))}
                </div>
                <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Sections</p>
              </div>
            )}

            <div className="px-4">
              <DndContext sensors={ed.sensors} collisionDetection={closestCenter} onDragEnd={ed.handleDragEnd}>
                <SortableContext items={ed.layout.sections.map(s => s.key)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1.5">
                    {ed.layout.sections.map(item => (
                      <SortableCard key={item.key} item={item} available={ed.available}
                        onToggleBreakable={() => ed.updateSection(item.key, s => ({ ...s, breakable: !s.breakable }))}
                        onRemove={() => ed.removeSection(item.key)}
                        onUpdateColumn={(ci, secs) => ed.updateColumn(item.key, ci, secs)}
                        onSpacingChange={(pre, post) => ed.updateSpacing(item.key, pre, post)} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <div className="flex gap-1.5 pt-2">
                {ed.available.length > 0 && (
                  <select className="flex-1 text-xs border border-dashed border-gray-300 rounded px-2 py-1.5 text-gray-500 bg-white"
                    value="" onChange={e => { if (e.target.value) ed.addFullSection(e.target.value) }}>
                    <option value="">+ add section</option>
                    {ed.available.map(id => <option key={id} value={id}>{ed.getLabel(id)}</option>)}
                  </select>
                )}
                <button onClick={ed.addColumnsGroup} className="text-xs border border-dashed border-gray-300 rounded px-2 py-1.5 text-gray-500 hover:bg-gray-50 whitespace-nowrap">
                  + columns
                </button>
              </div>
            </div>
          </AccordionSection>

          {/* Style panel */}
          {styleParams.length > 0 && (
            <AccordionSection title="Style" isOpen={ed.activePanel === 'style'} onToggle={() => ed.setActivePanel('style')}>
              <div className="px-4">
                {(() => {
                  const groupOrder: string[] = []
                  const groupMap = new Map<string, StyleParam[]>()
                  const ungrouped: StyleParam[] = []
                  for (const p of styleParams) {
                    if (!p.group) { ungrouped.push(p); continue }
                    if (!groupMap.has(p.group)) { groupOrder.push(p.group); groupMap.set(p.group, []) }
                    groupMap.get(p.group)!.push(p)
                  }
                  return (
                    <>
                      {ungrouped.length > 0 && (
                        <div className="space-y-3 pb-3">
                          {ungrouped.map(p => (
                            <StyleParamField key={p.key} p={p} value={ed.style[p.key]} onChange={ed.setStyleValue} />
                          ))}
                        </div>
                      )}
                      {groupOrder.map((g, i) => (
                        <StyleGroup key={g} title={g} defaultOpen={i === 0}>
                          {groupMap.get(g)!.map(p => (
                            <StyleParamField key={p.key} p={p} value={ed.style[p.key]} onChange={ed.setStyleValue} />
                          ))}
                        </StyleGroup>
                      ))}
                    </>
                  )
                })()}
                <div className="border-t border-gray-100 pt-2 mt-1">
                  <button onClick={ed.resetStyle} className="text-xs text-gray-400 hover:text-gray-600">
                    ↺ Reset to defaults
                  </button>
                </div>
              </div>
            </AccordionSection>
          )}

          {/* Saved panel */}
          <AccordionSection title="Saved" badge={ed.mySavesCount} isOpen={ed.activePanel === 'saved'} onToggle={() => ed.setActivePanel('saved')}>
            <div className="px-4">
              <SavedList saves={ed.saves} templateId={templateId} onLoad={ed.handleLoad} onDelete={ed.handleDelete} />
            </div>
          </AccordionSection>
        </div>

        {/* Actions bar */}
        <div className="px-4 py-3 border-t border-gray-100 space-y-2 shrink-0">
          {ed.error && <p className="text-xs text-red-500 break-words">{ed.error}</p>}
          <div className="flex gap-2">
            <button onClick={() => ed.setShowSaveModal(true)}
              className="flex-1 text-xs border border-gray-300 text-gray-700 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              Save as…
            </button>
            <button onClick={() => ed.importRef.current?.click()}
              className="flex-1 text-xs border border-gray-300 text-gray-700 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              Import ↑
            </button>
            <input ref={ed.importRef} type="file" accept=".json" className="hidden" onChange={ed.handleImport} />
          </div>
          <button onClick={ed.handleGenerate} disabled={ed.compileState !== 'idle'}
            className="w-full text-sm bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {ed.compileState === 'loading' ? 'Loading compiler…' : ed.compileState === 'compiling' ? 'Compiling…' : 'Generate PDF'}
          </button>
          <p className="text-xs text-gray-400 text-center">
            {ed.compileState === 'loading'
              ? 'Downloading compiler (~6 MB, once per session)'
              : ed.compileState === 'compiling'
              ? 'Running Typst in your browser…'
              : ed.compilerReady
              ? 'Runs entirely in your browser'
              : 'Compiled locally — your CV never leaves your device'}
          </p>
        </div>
      </div>
    </LabelCtx.Provider>
  )
}
