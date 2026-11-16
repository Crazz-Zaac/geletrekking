'use client'

import { createContext, useContext, type ReactNode } from 'react'

export type TrekLink = { title: string; href: string }

const TrekLinksContext = createContext<TrekLink[]>([])

/** The real trek list, loaded once on the server so menus and footers ship with it. */
export function TrekLinksProvider({ links, children }: { links: TrekLink[]; children: ReactNode }) {
  return <TrekLinksContext.Provider value={links}>{children}</TrekLinksContext.Provider>
}

export const useTrekLinks = () => useContext(TrekLinksContext)
