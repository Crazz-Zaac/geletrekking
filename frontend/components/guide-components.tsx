'use client'

import { AlertCircle, CheckCircle2, Info, AlertTriangle, Package, Lightbulb } from 'lucide-react'

interface CalloutProps {
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  children: React.ReactNode
}

export function Callout({ type, title, children }: CalloutProps) {
  const styles = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      textColor: 'text-blue-900 dark:text-blue-100',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      textColor: 'text-amber-900 dark:text-amber-100',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-800',
      icon: <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />,
      textColor: 'text-green-900 dark:text-green-100',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800',
      icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
      textColor: 'text-red-900 dark:text-red-100',
    },
  }

  const style = styles[type]

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4 my-4`}>
      <div className={`flex gap-3 ${style.textColor}`}>
        {style.icon}
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{title}</h4>
          <div className="text-sm opacity-90">{children}</div>
        </div>
      </div>
    </div>
  )
}

interface ChecklistItem {
  label: string
  checked?: boolean
}

interface ChecklistProps {
  title?: string
  items: ChecklistItem[]
}

export function Checklist({ title, items }: ChecklistProps) {
  return (
    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 my-4">
      {title && <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">{title}</h4>}
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-3 text-green-900 dark:text-green-100 text-sm">
            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${item.checked !== false ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`} />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface GearCardProps {
  name: string
  description: string
  icon?: string
}

export function GearCard({ name, description, icon }: GearCardProps) {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-3">
      <div className="flex items-start gap-3">
        <Package className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">{name}</h5>
          <p className="text-sm text-blue-800 dark:text-blue-200">{description}</p>
        </div>
      </div>
    </div>
  )
}

interface InfoCardProps {
  title: string
  children: React.ReactNode
  icon?: 'lightbulb' | 'info'
}

export function InfoCard({ title, children, icon = 'lightbulb' }: InfoCardProps) {
  const IconComponent = icon === 'lightbulb' ? Lightbulb : Info

  return (
    <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 my-4">
      <div className="flex gap-3">
        <IconComponent className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h5 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">{title}</h5>
          <div className="text-sm text-purple-800 dark:text-purple-200">{children}</div>
        </div>
      </div>
    </div>
  )
}

interface TipsProps {
  items: string[]
}

export function Tips({ items }: TipsProps) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 my-4">
      <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
        <span>💡</span> Pro Tips
      </h4>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm text-amber-900 dark:text-amber-100 flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
