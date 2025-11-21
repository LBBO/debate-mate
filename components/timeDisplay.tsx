import { cn } from '@/lib/utils'

export const TimeDisplay = ({
  minutes,
  seconds,
  variant = 'normal',
  className,
}: {
  minutes: number
  seconds: number
  variant?: 'normal' | 'gray'
  className?: string
}) => {
  return (
    <p
      className={cn(
        'font-mono text-7xl font-bold',
        {
          'text-slate-500': variant === 'gray',
        },
        className,
      )}
    >
      {minutes.toString().padStart(2, '0')}:
      {/* Minutes should be negative, never seconds */}
      {Math.abs(seconds).toString().padStart(2, '0')}
    </p>
  )
}
