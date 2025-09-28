const fs = require("fs")
const path = require("path")

function copyRecursiveOptimized(src, dest) {
	if (!fs.existsSync(dest)) {
		fs.mkdirSync(dest, { recursive: true })
	}

	const entries = fs.readdirSync(src, { withFileTypes: true })
	let copiedCount = 0
	let skippedCount = 0

	for (let entry of entries) {
		const srcPath = path.join(src, entry.name)
		const destPath = path.join(dest, entry.name)

		if (entry.isDirectory()) {
			const result = copyRecursiveOptimized(srcPath, destPath)
			copiedCount += result.copied
			skippedCount += result.skipped
		} else {
			// Check if file needs to be copied
			let shouldCopy = false

			if (!fs.existsSync(destPath)) {
				// File doesn't exist, copy it
				shouldCopy = true
			} else {
				// File exists, check if source is newer
				const srcStats = fs.statSync(srcPath)
				const destStats = fs.statSync(destPath)

				if (srcStats.mtime > destStats.mtime || srcStats.size !== destStats.size) {
					shouldCopy = true
				}
			}

			if (shouldCopy) {
				fs.copyFileSync(srcPath, destPath)
				copiedCount++
			} else {
				skippedCount++
			}
		}
	}

	return { copied: copiedCount, skipped: skippedCount }
}

// Copy assets
console.log("Checking assets...")
const assetsrcDir = path.join(__dirname, ".", "kingsraid-data", "assets")
const assetDestDir = path.join(__dirname, ".", "public", "assets")

if (fs.existsSync(assetsrcDir)) {
	const startTime = Date.now()
	const assetResult = copyRecursiveOptimized(assetsrcDir, assetDestDir)
	const endTime = Date.now()

	console.log(`Assets: ${assetResult.copied} copied, ${assetResult.skipped} skipped (${endTime - startTime}ms)`)
} else {
	console.warn("Assets source directory not found:", assetsrcDir)
}

// Copy models
console.log("Checking models...")
const modelsSrcDir = path.join(__dirname, ".", "kingsraid-models", "models")
const modelsDestDir = path.join(__dirname, ".", "public", "models")

if (fs.existsSync(modelsSrcDir)) {
	const startTime = Date.now()
	const modelResult = copyRecursiveOptimized(modelsSrcDir, modelsDestDir)
	const endTime = Date.now()

	console.log(`Models: ${modelResult.copied} copied, ${modelResult.skipped} skipped (${endTime - startTime}ms)`)
} else {
	console.warn("Models source directory not found:", modelsSrcDir)
}

console.log("Copy process completed!")
