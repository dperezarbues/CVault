import { createContext } from 'react'

export const LabelCtx = createContext<(id: string) => string>((id) => id)
