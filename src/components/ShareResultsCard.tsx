import { useRef, useEffect, useCallback } from 'react'

interface ShareResultsCardProps {
  gameMode: string
  bestScore: number
  averageScore?: number
  benchmark: string
  benchmarkColor: string
  attempts: number
  onClose: () => void
}

export default function ShareResultsCard({
  gameMode,
  bestScore,
  averageScore,
  benchmark,
  benchmarkColor,
  attempts,
  onClose,
}: ShareResultsCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const drawCard = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#1a1a2e')
    gradient.addColorStop(1, '#16213e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Top accent bar
    ctx.fillStyle = '#e94560'
    ctx.fillRect(0, 0, canvas.width, 4)

    // Title
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Reaction Speed Test', canvas.width / 2, 50)

    // Game mode
    ctx.font = '16px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = '#8892b0'
    ctx.fillText(gameMode, canvas.width / 2, 80)

    // Divider
    ctx.strokeStyle = '#233554'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(40, 105)
    ctx.lineTo(canvas.width - 40, 105)
    ctx.stroke()

    // Best Score label
    ctx.fillStyle = '#8892b0'
    ctx.font = '14px system-ui, -apple-system, sans-serif'
    ctx.fillText('BEST SCORE', canvas.width / 2, 145)

    // Best Score value
    ctx.fillStyle = '#64ffda'
    ctx.font = 'bold 64px system-ui, -apple-system, sans-serif'
    const scoreText = bestScore >= 1000 ? `${(bestScore / 1000).toFixed(2)}s` : `${bestScore}ms`
    ctx.fillText(scoreText, canvas.width / 2, 220)

    // Benchmark
    ctx.fillStyle = benchmarkColor
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif'
    ctx.fillText(benchmark, canvas.width / 2, 260)

    // Stats
    let yPos = 305
    ctx.fillStyle = '#8892b0'
    ctx.font = '14px system-ui, -apple-system, sans-serif'
    if (averageScore) {
      const avgText = averageScore >= 1000 ? `${(averageScore / 1000).toFixed(2)}s` : `${averageScore}ms`
      ctx.fillText(`Average: ${avgText}`, canvas.width / 2, yPos)
      yPos += 30
    }
    ctx.fillText(`Attempts: ${attempts}`, canvas.width / 2, yPos)

    // Bottom divider
    ctx.fillStyle = '#233554'
    ctx.fillRect(40, 400, canvas.width - 80, 1)

    // Branding
    ctx.fillStyle = '#495670'
    ctx.font = '13px system-ui, -apple-system, sans-serif'
    ctx.fillText('Try it yourself!', canvas.width / 2, 440)
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = '#64ffda'
    ctx.fillText('Reaction Speed Test', canvas.width / 2, 465)

    // Bottom accent bar
    ctx.fillStyle = '#e94560'
    ctx.fillRect(0, canvas.height - 4, canvas.width, 4)
  }, [gameMode, bestScore, averageScore, benchmark, benchmarkColor, attempts])

  useEffect(() => {
    drawCard()
  }, [drawCard])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `reaction-speed-${gameMode.toLowerCase().replace(/\s+/g, '-')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleCopy = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      )
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
    } catch {
      // Fallback: download instead
      handleDownload()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white text-lg font-bold text-center mb-4">Share Your Score</h3>

        <div className="flex justify-center mb-4">
          <canvas
            ref={canvasRef}
            width={400}
            height={500}
            className="rounded-lg w-full max-w-[300px]"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 rounded-xl font-semibold transition-colors text-sm"
          >
            📥 Download
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl font-semibold transition-colors text-sm"
          >
            📋 Copy
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 px-4 rounded-xl font-semibold transition-colors text-sm"
          >
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  )
}
