'use client'

import AccordionSection from './components/AccordionSection'
import ActionsBar from './components/ActionsBar'
import LayoutPanel from './components/LayoutPanel'
import { SavedList, SaveModal } from './components/SavedConfigs'
import StylePanel from './components/StylePanel'
import { LabelCtx } from './contexts'
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
  const { activePanel, setActivePanel, editor, style, compiler, saved } = useLayoutEditor({
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
    <LabelCtx.Provider value={editor.getLabel}>
      {saved.showSaveModal && (
        <SaveModal onSave={saved.handleSave} onCancel={() => saved.setShowSaveModal(false)} />
      )}

      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <AccordionSection
            title="Layout"
            isOpen={activePanel === 'layout'}
            onToggle={() => setActivePanel('layout')}
          >
            <LayoutPanel
              layout={editor.layout}
              hasSidebar={editor.hasSidebar}
              sensors={editor.sensors}
              available={editor.available}
              availableSb={editor.availableSb}
              getLabel={editor.getLabel}
              setHeader={editor.setHeader}
              handleDragEnd={editor.handleDragEnd}
              handleSidebarDragEnd={editor.handleSidebarDragEnd}
              addFullSection={editor.addFullSection}
              addColumnsGroup={editor.addColumnsGroup}
              removeSection={editor.removeSection}
              updateSection={editor.updateSection}
              updateColumn={editor.updateColumn}
              updateSpacing={editor.updateSpacing}
              addSidebarSection={editor.addSidebarSection}
              removeSidebarSection={editor.removeSidebarSection}
              toggleSidebarBreakable={editor.toggleSidebarBreakable}
              updateSidebarSpacing={editor.updateSidebarSpacing}
            />
          </AccordionSection>

          {styleParams.length > 0 && (
            <AccordionSection
              title="Style"
              isOpen={activePanel === 'style'}
              onToggle={() => setActivePanel('style')}
            >
              <StylePanel
                styleParams={styleParams}
                style={style.style}
                setStyleValue={style.setStyleValue}
                resetStyle={style.resetStyle}
              />
            </AccordionSection>
          )}

          <AccordionSection
            title="Saved"
            badge={saved.mySavesCount}
            isOpen={activePanel === 'saved'}
            onToggle={() => setActivePanel('saved')}
          >
            <div className="px-4">
              <SavedList
                saves={saved.saves}
                templateId={templateId}
                onLoad={saved.handleLoad}
                onDelete={saved.handleDelete}
              />
            </div>
          </AccordionSection>
        </div>

        <ActionsBar
          error={compiler.error}
          compileState={compiler.compileState}
          compilerReady={compiler.compilerReady}
          importRef={saved.importRef}
          onImport={saved.handleImport}
          onGenerate={compiler.generate}
          onShowSaveModal={() => saved.setShowSaveModal(true)}
        />
      </div>
    </LabelCtx.Provider>
  )
}
