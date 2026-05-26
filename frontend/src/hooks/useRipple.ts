import { useCallback } from 'react'

interface RippleOptions {
  duration?: number
  color?: string
}

export const useRipple = (options: RippleOptions = {}) => {
  const { duration = 600, color = 'rgba(255, 255, 255, 0.5)' } = options

  const createRipple = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const button = event.currentTarget
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = event.clientX - rect.left - size / 2
      const y = event.clientY - rect.top - size / 2

      const ripple = document.createElement('span')
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: ${color};
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        transform: scale(0);
        animation: ripple-animation ${duration}ms ease-out;
      `

      // Add animation keyframes if not already added
      if (!document.getElementById('ripple-keyframes')) {
        const style = document.createElement('style')
        style.id = 'ripple-keyframes'
        style.textContent = `
          @keyframes ripple-animation {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
        `
        document.head.appendChild(style)
      }

      button.appendChild(ripple)
      setTimeout(() => ripple.remove(), duration)
    },
    [duration, color]
  )

  return createRipple
}
