import type { ElementType, HTMLAttributes, ReactNode } from 'react'

export function Card({
  children,
  className = '',
  as,
  ...props
}: HTMLAttributes<HTMLElement> & { children: ReactNode; as?: ElementType }) {
  const Tag = as ?? 'div'
  return (
    <Tag className={`rounded-lg border border-line bg-surface p-4 shadow-sm sm:p-5 ${className}`} {...props}>
      {children}
    </Tag>
  )
}
