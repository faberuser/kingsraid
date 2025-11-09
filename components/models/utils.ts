// Suppress THREE.js PropertyBinding warnings for missing bones
const originalWarn = console.warn
console.warn = function (...args) {
	const message = args[0]
	if (typeof message === "string" && message.includes("THREE.PropertyBinding: No target node found")) {
		return
	}
	originalWarn.apply(console, args)
}

/**
 * Format animation name for display
 * Removes hero name prefix and repeated prefixes, capitalizes first letter
 */
export const formatAnimationName = (animName: string): string => {
	// Remove hero name prefix (e.g., "Hero_Aisha@Run_Run" -> "Run_Run")
	let formatted = animName.split("@")[1] || animName

	// Remove repeated prefix (e.g., "Attack1_Attack1-1" -> "Attack1-1", "Cos20SL_Cos20SL_1" -> "Cos20SL_1")
	const parts = formatted.split("_")
	if (parts.length > 1 && parts[1].startsWith(parts[0])) {
		formatted = [parts[1], ...parts.slice(2)].join("_")
	}

	// Capitalize first letter
	return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

/**
 * Format costume name for display
 * Removes Cos prefix and adds spaces before capitals
 */
export const formatCostumeName = (costumeName: string) => {
	return costumeName
		.replace(/^Cos\d+/, "") // Remove Cos prefix
		.replace(/([A-Z])/g, " $1") // Add spaces before capitals
		.trim()
}

/**
 * Format model variant name for display (works for both heroes and bosses)
 * Converts "Vari01" to "Variant 1", "Cos18Chuseok" to "Costume 18 Chuseok"
 */
export const formatModelName = (modelName: string) => {
	return modelName
		.replace(/^Vari(\d+)$/, "Variant $1")
		.replace(/^Cos(\d+)/, "Costume $1 ")
		.replace(/([A-Z])/g, " $1")
		.trim()
}
