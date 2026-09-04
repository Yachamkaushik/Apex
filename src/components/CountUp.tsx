import { useCountUp } from '../hooks/useCountUp'

export function CountUp({ value, duration }: { value: number; duration?: number }) {
  const animated = useCountUp(value, duration)
  return <>{animated.toLocaleString()}</>
}
