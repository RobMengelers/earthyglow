import { useEffect, useRef } from 'react'

type Blob = {
  color: string
  cx: number
  cy: number
  rx: number
  ry: number
  sfx: number
  sfy: number
  phase: number
  radius: number
  alpha: number
}

const COLORS = [
  '217,154,63',
  '185,99,58',
  '243,217,167',
  '233,176,109',
  '251,247,240',
]

const BLOBS: Blob[] = COLORS.map((color, i) => ({
  color,
  cx: 0.3 + ((i * 0.19) % 0.7),
  cy: 0.28 + ((i * 0.16) % 0.6),
  rx: 0.12 + (i % 3) * 0.05,
  ry: 0.1 + (i % 2) * 0.06,
  sfx: 0.00025 + (i % 4) * 0.00012,
  sfy: 0.00019 + (i % 3) * 0.00014,
  phase: (i * 1.7) % (Math.PI * 2),
  radius: 0.34 + (i % 3) * 0.11,
  alpha: 0.06 + (i % 2) * 0.025,
}))

export function LiquidGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    const canvas: HTMLCanvasElement = canvasEl
    const raw = canvas.getContext('2d')
    if (!raw) return
    const ctx: CanvasRenderingContext2D = raw

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduceMotion.matches) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const pointer = { x: -1, y: -1, tx: -1, ty: -1 }
    let width = 0
    let height = 0
    let raf = 0
    let running = false

    function resize() {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function onPointerMove(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect()
      pointer.tx = event.clientX - rect.left
      pointer.ty = event.clientY - rect.top
    }

    function onPointerLeave() {
      pointer.tx = -1
      pointer.ty = -1
    }

    function frame(time: number) {
      if (!running) return
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'

      pointer.x += (pointer.tx - pointer.x) * 0.06
      pointer.y += (pointer.ty - pointer.y) * 0.06

      const size = Math.min(width, height)

      for (const blob of BLOBS) {
        const x = (blob.cx + Math.sin(time * blob.sfx + blob.phase) * blob.rx) * width
        const y =
          (blob.cy + Math.cos(time * blob.sfy + blob.phase * 1.6) * blob.ry) *
          height
        const r = blob.radius * size * 1.6
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
        grad.addColorStop(0, `rgba(${blob.color},${blob.alpha})`)
        grad.addColorStop(1, `rgba(${blob.color},0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      if (pointer.x >= 0 && pointer.y >= 0) {
        const glow = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          size * 0.42,
        )
        glow.addColorStop(0, 'rgba(243,217,167,0.13)')
        glow.addColorStop(1, 'rgba(243,217,167,0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(pointer.x, pointer.y, size * 0.42, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(frame)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting
        if (running) raf = requestAnimationFrame(frame)
        else cancelAnimationFrame(raf)
      },
      { threshold: 0.1 },
    )

    resize()
    observer.observe(canvas)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerleave', onPointerLeave)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="hero-liquid" aria-hidden="true" />
}