import { useEffect, useRef, useState } from 'react'

/**
 * Animates from 0 up to `target` over `duration`ms with an ease-out curve.
 * Respects prefers-reduced-motion by jumping straight to the target.
 */
export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0)
  const targetRef = useRef(target)
  targetRef.current = target

  useEffect(() => {
    if (!Number.isFinite(target)) return

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setValue(target)
      return
    }

    let raf: number
    let start: number | null = null

    const step = (timestamp: number) => {
      if (start === null) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(targetRef.current * eased))
      if (progress < 1) raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}
