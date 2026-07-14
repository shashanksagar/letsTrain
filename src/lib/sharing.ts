interface PRCardData { exerciseName: string; weightKg: number; reps: number; date: string; userName: string }

export async function sharePRCard(data: PRCardData): Promise<void> {
  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 400
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#0d1117'
  ctx.fillRect(0, 0, 600, 400)

  const grad = ctx.createLinearGradient(0, 0, 600, 0)
  grad.addColorStop(0, '#00d4aa')
  grad.addColorStop(1, '#0080ff')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 600, 8)

  ctx.fillStyle = '#00d4aa'
  ctx.font = 'bold 24px -apple-system, sans-serif'
  ctx.fillText('letsTrain', 40, 60)

  ctx.fillStyle = '#9ca3af'
  ctx.font = '16px -apple-system, sans-serif'
  ctx.fillText('New Personal Record', 40, 110)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 36px -apple-system, sans-serif'
  ctx.fillText(data.exerciseName, 40, 170)

  ctx.fillStyle = '#00d4aa'
  ctx.font = 'bold 72px -apple-system, sans-serif'
  ctx.fillText(`${data.weightKg}kg`, 40, 270)

  ctx.fillStyle = '#9ca3af'
  ctx.font = '24px -apple-system, sans-serif'
  ctx.fillText(`× ${data.reps} reps`, 40, 310)

  ctx.fillStyle = '#4b5563'
  ctx.font = '14px -apple-system, sans-serif'
  ctx.fillText(`${data.userName} · ${data.date}`, 40, 370)

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas toBlob failed')), 'image/png')
  )
  const file = new File([blob], 'letstrain-pr.png', { type: 'image/png' })

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: `New PR: ${data.exerciseName} ${data.weightKg}kg` })
  } else {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'letstrain-pr.png'
    a.click()
    URL.revokeObjectURL(url)
  }
}

export function downloadJSON(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
