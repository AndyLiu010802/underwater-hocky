import { cn } from '@/lib/utils'

interface CyanButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outline'
  href?: string
  children: React.ReactNode
}

export function CyanButton({ variant = 'filled', href, children, className, ...props }: CyanButtonProps) {
  const base = 'inline-flex items-center gap-2 px-6 py-2.5 text-xs font-black tracking-[0.25em] uppercase rounded-sm transition-all duration-200 active:scale-95'
  const filled = 'bg-cyan text-ocean-800 hover:bg-white hover:text-ocean-800'
  const outline = 'border border-cyan/50 text-cyan hover:border-cyan hover:cyan-glow'

  const cls = cn(base, variant === 'filled' ? filled : outline, className)

  if (href) {
    return <a href={href} className={cls}>{children}</a>
  }

  return <button className={cls} {...props}>{children}</button>
}
