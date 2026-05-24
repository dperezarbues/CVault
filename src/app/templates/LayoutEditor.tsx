'use client'

import AccordionSection from './components/AccordionSection'
import ActionsBar from './components/ActionsBar'
import LayoutPanel from './components/LayoutPanel'
import { SavedList, SaveModal } from './components/SavedConfigs'
import StylePanel from './components/StylePanel'
import { LabelCtx } from './editor-utils'
import { useLayoutEditor } from './hooks/useLayoutEditor'
import type { SectionDef } from './section-defs'
import type { StyleParam } from './types'

export type { SectionDef } from './section-defs'
export { DEFAULT_SECTIONS } from './section-defs'
export type { StyleParam } from './types'

export default function LayoutEditor({
  initialLayout,
  templateId,
  styleParams = [],
  sections,
  cvContent,
  generateTrigger = 0,
  onPdfChange,
  onGenerating,
}: {
  initialLayout: Record<string, unknown>
  templateId: string
  styleParams?: StyleParam[]
  sections?: SectionDef[]
  cvContent: string
  generateTrigger?: number
  onPdfChange: (url: string) => void
  onGenerating: (v: boolean) => void
}) {
  const ed = useLayoutEditor({
    initialLayout,
    templateId,
    styleParams,
    sections,
    cvContent,
    generateTrigger,
    onPdfChange,
    onGenerating,
  })

  return (
    <LabelCtx.Provider value={ed.getLabel}>
      {ed.showSaveModal && (
        <SaveModal onSave={ed.handleSave} onCancel={() => ed.setShowSaveModal(false)} />
      )}

      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <AccordionSection
            title="Layout"
            isOpen={ed.activePanel === 'layout'}
            onToggle={() => ed.setActivePanel('layout')}
          >
            <LayoutPanel
              layout={ed.layout}
              hasSidebar={ed.hasSidebar}
              sensors={ed.sensors}
              available={ed.available}
              availableSb={ed.availableSb}
              getLabel={ed.getLabel}
              setHeader={ed.setHeader}
              handleDragEnd={ed.handleDragEnd}
              handleSidebarDragEnd={ed.handleSidebarDragEnd}
              addFullSection={ed.addFullSection}
              addColumnsGroup={ed.addColumnsGroup}
              removeSection={ed.removeSection}
              updateSection={ed.updateSection}
              updateColumn={ed.updateColumn}
              updateSpacing={ed.updateSpacing}
              addSidebarSection={ed.addSidebarSection}
              removeSidebarSection={ed.removeSidebarSection}
              toggleSidebarBreakable={ed.toggleSidebarBreakable}
              updateSidebarSpacing={ed.updateSidebarSpacing}
            />
          </AccordionSection>

          {styleParams.length > 0 && (
            <AccordionSection
              title="Style"
              isOpen={ed.activePanel === 'style'}
              onToggle={() => ed.setActivePanel('style')}
            >
              <StylePanel
                styleParams={styleParams}
                style={ed.style}
                setStyleValue={ed.setStyleValue}
                resetStyle={ed.resetStyle}
              />
            </AccordionSection>
          )}

          <AccordionSection
            title="Saved"
            badge={ed.mySavesCount}
            isOpen={ed.activePanel === 'saved'}
            onToggle={() => ed.setActivePanel('saved')}
          >
            <div className="px-4">
              <SavedList
                saves={ed.saves}
                templateId={templateId}
                onLoad={ed.handleLoad}
                onDelete={ed.handleDelete}
              />
            </div>
          </AccordionSection>
        </div>

        <ActionsBar
          error={ed.error}
          compileState={ed.compileState}
          compilerReady={ed.compilerReady}
          importRef={ed.importRef}
          onImport={ed.handleImport}
          onGenerate={ed.handleGenerate}
          onShowSaveModal={() => ed.setShowSaveModal(true)}
        />
      </div>
    </LabelCtx.Provider>
  )
}
