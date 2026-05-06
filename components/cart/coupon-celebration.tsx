"use client"

import confetti from "canvas-confetti"
import { useEffect, useRef } from "react"

export function CouponCelebration({
  code,
  savedAmount,
  onDone,
}: {
  code: string
  savedAmount: number
  onDone: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const fire = confetti.create(canvas, { resize: true, useWorker: true })

    const duration = 700
    const end = Date.now() + duration
    const colors = ["#7CE1BD", "#FFD93D", "#FF6B9D", "#A78BFA", "#60A5FA"]

    const tick = () => {
      fire({
        particleCount: 6,
        angle: 90,
        spread: 70,
        startVelocity: 55,
        origin: { x: 0.5, y: 1 },
        colors,
      })
      if (Date.now() < end) requestAnimationFrame(tick)
    }
    tick()

    const timer = setTimeout(onDone, 3000)
    return () => {
      clearTimeout(timer)
      fire.reset()
    }
  }, [onDone])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-40 w-full h-full pointer-events-none"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 z-50 bg-white border-t border-gray-200 px-6 py-8 flex flex-col items-center text-center animate-in slide-in-from-bottom duration-300">
        <span className="text-5xl mb-3" role="img" aria-label="celebration">
          🥳
        </span>
        <h3 className="text-xl font-bold text-black">Hurray!</h3>
        <p className="text-sm text-black mt-1">
          {code}
          <br />
          applied successfully
        </p>
        <p className="text-sm font-semibold text-black mt-2">
          You{" "}
          <span className="text-green-600">
            saved ₹{savedAmount.toFixed(1)}
          </span>{" "}
          with this coupon
        </p>
      </div>
    </>
  )
}
