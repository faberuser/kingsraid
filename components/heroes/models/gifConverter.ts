// @ts-ignore - gif.js doesn't have types
import GIF from "gif.js"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

export const convertToGif = async (videoUrl: string): Promise<Blob> => {
	return new Promise((resolve, reject) => {
		const video = document.createElement("video")
		video.src = videoUrl
		video.muted = true
		video.playsInline = true
		video.crossOrigin = "anonymous"

		video.onloadedmetadata = async () => {
			try {
				const canvas = document.createElement("canvas")
				const ctx = canvas.getContext("2d", { willReadFrequently: true })!

				// Use original size for best quality
				canvas.width = video.videoWidth
				canvas.height = video.videoHeight

				const fps = 25 // Match recording frame rate
				const frameDuration = 1 / fps
				const totalFrames = Math.floor(video.duration * fps)

				// Detect CPU cores and use half of them (minimum 1, maximum 8)
				const cpuCores = navigator.hardwareConcurrency || 4
				const workerCount = Math.max(1, Math.min(8, Math.floor(cpuCores / 2)))

				// Initialize GIF encoder
				const gif = new GIF({
					workers: workerCount,
					quality: 1, // 1-30, lower is better quality (1 = best)
					width: canvas.width,
					height: canvas.height,
					workerScript: `${basePath}/gif.worker.js`,
				})

				gif.on("progress", (progress: number) => {
					console.log("GIF encoding progress:", Math.round(progress * 100) + "%")
				})

				// Capture frames and add to GIF
				for (let i = 0; i < totalFrames; i++) {
					video.currentTime = i * frameDuration
					await new Promise<void>((resolveSeek) => {
						video.onseeked = () => resolveSeek()
					})

					ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
					gif.addFrame(ctx, { copy: true, delay: 40 }) // ~40ms delay = 25fps
				}

				gif.on("finished", (blob: Blob) => {
					resolve(blob)
				})

				gif.on("error", (error: Error) => {
					reject(error)
				})

				gif.render()
			} catch (error) {
				reject(error)
			}
		}

		video.onerror = reject
		video.load()
	})
}
