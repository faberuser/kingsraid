const fs = require("fs")
const path = require("path")

function copyRecursive(src, dest) {
	if (!fs.existsSync(dest)) {
		fs.mkdirSync(dest, { recursive: true })
	}

	const entries = fs.readdirSync(src, { withFileTypes: true })

	for (let entry of entries) {
		const srcPath = path.join(src, entry.name)
		const destPath = path.join(dest, entry.name)

		if (entry.isDirectory()) {
			copyRecursive(srcPath, destPath)
		} else {
			fs.copyFileSync(srcPath, destPath)
		}
	}
}

// Copy assets
const srcDir = path.join(__dirname, ".", "kingsraid-data", "assets")
const destDir = path.join(__dirname, ".", "public", "assets")

if (fs.existsSync(srcDir)) {
	copyRecursive(srcDir, destDir)
	console.log("Assets copied successfully!")
} else {
	console.warn("Source directory not found:", srcDir)
}
