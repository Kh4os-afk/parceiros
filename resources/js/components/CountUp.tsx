import { useEffect, useRef } from 'react'

interface Props {
    value: number
    decimals?: number
    duration?: number   // segundos
    delay?: number      // ms antes de iniciar
    className?: string
}

// Cubic ease-out — começa rápido, desacelera suavemente no final
function easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 3)
}

function format(value: number, decimals: number): string {
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    })
}

export default function CountUp({ value, decimals = 0, duration = 3.4, delay = 80, className }: Props) {
    const spanRef  = useRef<HTMLSpanElement>(null)
    const rafRef   = useRef<number>(0)

    useEffect(() => {
        const el = spanRef.current
        if (!el) return

        let timeoutId: ReturnType<typeof setTimeout>

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return
            observer.disconnect()

            timeoutId = setTimeout(() => {
                let startTs: number | null = null

                const tick = (now: number) => {
                    if (startTs === null) startTs = now
                    const elapsed  = (now - startTs) / 1000
                    const progress = Math.min(elapsed / duration, 1)
                    const current  = easeOut(progress) * value

                    el.textContent = format(current, decimals)

                    if (progress < 1) {
                        rafRef.current = requestAnimationFrame(tick)
                    } else {
                        el.textContent = format(value, decimals)
                    }
                }

                rafRef.current = requestAnimationFrame(tick)
            }, delay)
        }, { threshold: 0.1 })

        observer.observe(el)

        return () => {
            observer.disconnect()
            clearTimeout(timeoutId)
            cancelAnimationFrame(rafRef.current)
        }
    }, [value, decimals, duration, delay])

    return (
        <span ref={spanRef} className={className}>
            {format(0, decimals)}
        </span>
    )
}
