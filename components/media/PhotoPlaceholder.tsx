import { Film } from 'lucide-react'
import { cn } from '@/lib/utils'

/** 还没有发布作品时显示的中性占位，不使用任何他人的图片 */
export default function PhotoPlaceholder({
  label,
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative flex h-full w-full items-center justify-center overflow-hidden',
        'bg-[radial-gradient(ellipse_at_30%_20%,rgba(217,119,6,0.10),transparent_55%),radial-gradient(ellipse_at_80%_90%,rgba(14,116,144,0.08),transparent_50%),linear-gradient(160deg,#ece7dd,#e0dace)]',
        'dark:bg-[radial-gradient(ellipse_at_30%_20%,rgba(251,191,36,0.10),transparent_55%),radial-gradient(ellipse_at_80%_90%,rgba(103,232,249,0.08),transparent_50%),linear-gradient(160deg,#151513,#0a0a09)]',
        className
      )}
    >
      {label && (
        <div className="flex flex-col items-center gap-3 px-6 text-center text-foreground/40">
          <Film className="h-6 w-6" />
          <span className="text-xs uppercase tracking-[0.24em]">{label}</span>
        </div>
      )}
    </div>
  )
}
