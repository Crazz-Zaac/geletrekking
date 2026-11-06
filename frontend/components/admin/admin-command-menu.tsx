'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, LogOut, Settings2 } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { ADMIN_SETTING_SHORTCUTS, canSee, visibleNav, type AdminRole } from '@/components/admin/admin-nav'

type AdminCommandMenuProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: AdminRole
  onLogout: () => void
}

/** Ctrl/⌘+K search across every admin page and individual settings. */
export function AdminCommandMenu({ open, onOpenChange, role, onLogout }: AdminCommandMenuProps) {
  const router = useRouter()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  const go = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  const groups = visibleNav(role)
  const shortcuts = ADMIN_SETTING_SHORTCUTS.filter((item) => canSee(item.roles, role))

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search admin"
      description="Jump to any page or setting"
    >
      <CommandInput placeholder="Search pages and settings… e.g. phone, logo, 2FA" />
      <CommandList className="max-h-[min(70dvh,28rem)]">
        <CommandEmpty>No matching page or setting.</CommandEmpty>
        {groups.map((group) => (
          <CommandGroup key={group.label} heading={group.label}>
            {group.items.map((item) => {
              const Icon = item.icon
              return (
                <CommandItem
                  key={item.href}
                  value={`${item.label} ${item.description}`}
                  keywords={item.keywords}
                  onSelect={() => go(item.href)}
                >
                  <Icon className="text-muted-foreground" />
                  <span className="flex min-w-0 flex-col">
                    <span className="font-medium">{item.label}</span>
                    <span className="truncate text-xs text-muted-foreground">{item.description}</span>
                  </span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        ))}
        <CommandSeparator />
        <CommandGroup heading="Settings">
          {shortcuts.map((item) => (
            <CommandItem key={item.label} value={item.label} keywords={item.keywords} onSelect={() => go(item.href)}>
              <Settings2 className="text-muted-foreground" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            value="View website"
            keywords={['open site', 'public']}
            onSelect={() => {
              onOpenChange(false)
              window.open('/', '_blank', 'noopener,noreferrer')
            }}
          >
            <ExternalLink className="text-muted-foreground" />
            <span>View website</span>
          </CommandItem>
          <CommandItem
            value="Log out"
            keywords={['sign out', 'logout']}
            onSelect={() => {
              onOpenChange(false)
              onLogout()
            }}
          >
            <LogOut className="text-muted-foreground" />
            <span>Log out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
