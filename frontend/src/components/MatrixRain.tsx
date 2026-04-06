'use client'
import { useEffect, useRef } from 'react'

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth ?? window.innerWidth
      canvas.height = canvas.parentElement?.clientHeight ?? window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const chars = '01アイウエカキク'
    const fontSize = 20
    const cols = Math.floor(canvas.width / fontSize)
    const drops: number[] = Array(cols).fill(1)
    // Only ~30% of columns are active at any time
    const activeCols = new Set(
      Array.from({ length: Math.floor(cols * 0.3) }, () =>
        Math.floor(Math.random() * cols)
      )
    )

    const draw = () => {
      // Fade previous frame
      ctx.fillStyle = 'rgba(8,8,8,0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${fontSize}px monospace`

      // Occasionally toggle columns
      if (Math.random() < 0.02) {
        const col = Math.floor(Math.random() * cols)
        if (activeCols.has(col)) activeCols.delete(col)
        else activeCols.add(col)
      }

      activeCols.forEach(i => {
        const char = chars[Math.floor(Math.random() * chars.length)]
        ctx.globalAlpha = 0.15
        ctx.fillStyle = '#10b981'
        ctx.fillText(char, i * fontSize, drops[i] * fontSize)
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      })
      ctx.globalAlpha = 1
    }

    const interval = setInterval(draw, 60)
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none', zIndex: 0 }}
    />
  )
}
