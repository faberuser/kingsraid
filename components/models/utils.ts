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
 * Animation sequence utilities
 * Detects and manages animation sequences like Skill1-1, Skill1-2, Skill1-3, etc.
 */

// Regex pattern to match animation sequences (e.g., "Skill1-1", "Attack1-2", "Skill2-3")
const SEQUENCE_PATTERN = /^(.*?)(-(\d+))$/

/**
 * Parse an animation name to extract sequence information
 * @param animName - Full animation name (e.g., "Hero_Aisha@Skill1_Skill1-1")
 * @returns Object with base name, sequence number, and whether it's part of a sequence
 */
export const parseAnimationSequence = (
	animName: string,
): {
	isSequence: boolean
	baseName: string
	sequenceNumber: number
	fullBaseName: string
} => {
	// Extract the animation part after @ (e.g., "Skill1_Skill1-1")
	const atIndex = animName.indexOf("@")
	const prefix = atIndex >= 0 ? animName.substring(0, atIndex + 1) : ""
	const animPart = atIndex >= 0 ? animName.substring(atIndex + 1) : animName

	const match = animPart.match(SEQUENCE_PATTERN)
	if (match) {
		return {
			isSequence: true,
			baseName: match[1], // e.g., "Skill1_Skill1"
			sequenceNumber: parseInt(match[3], 10), // e.g., 1, 2, 3
			fullBaseName: prefix + match[1], // e.g., "Hero_Aisha@Skill1_Skill1"
		}
	}

	return {
		isSequence: false,
		baseName: animPart,
		sequenceNumber: 0,
		fullBaseName: animName,
	}
}

/**
 * Find the next animation in a sequence
 * @param currentAnimation - Current animation name
 * @param availableAnimations - List of all available animations
 * @returns Next animation name or null if no next animation exists
 */
export const findNextInSequence = (currentAnimation: string, availableAnimations: string[]): string | null => {
	const parsed = parseAnimationSequence(currentAnimation)

	if (!parsed.isSequence) {
		return null
	}

	const nextSequenceNumber = parsed.sequenceNumber + 1
	const nextAnimName = `${parsed.fullBaseName}-${nextSequenceNumber}`

	// Check if the next animation exists in available animations
	if (availableAnimations.includes(nextAnimName)) {
		return nextAnimName
	}

	return null
}

/**
 * Check if an animation is the start of a sequence (ends with -1)
 * @param animName - Animation name to check
 * @returns Whether this is the first animation in a sequence
 */
export const isSequenceStart = (animName: string): boolean => {
	const parsed = parseAnimationSequence(animName)
	return parsed.isSequence && parsed.sequenceNumber === 1
}

/**
 * Get all animations in a sequence starting from the given animation
 * @param startAnimation - Starting animation name
 * @param availableAnimations - List of all available animations
 * @returns Array of animation names in the sequence
 */
export const getSequenceAnimations = (startAnimation: string, availableAnimations: string[]): string[] => {
	const sequence: string[] = [startAnimation]
	let current = startAnimation

	while (true) {
		const next = findNextInSequence(current, availableAnimations)
		if (next) {
			sequence.push(next)
			current = next
		} else {
			break
		}
	}

	return sequence
}

/**
 * Find the first animation in a sequence (the one ending with -1)
 * @param currentAnimation - Current animation name (any animation in the sequence)
 * @param availableAnimations - List of all available animations
 * @returns First animation in the sequence or null if not found/not a sequence
 */
export const findSequenceStart = (currentAnimation: string, availableAnimations: string[]): string | null => {
	const parsed = parseAnimationSequence(currentAnimation)

	if (!parsed.isSequence) {
		return null
	}

	// Construct the first animation name (sequence number 1)
	const firstAnimName = `${parsed.fullBaseName}-1`

	// Check if the first animation exists in available animations
	if (availableAnimations.includes(firstAnimName)) {
		return firstAnimName
	}

	return null
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
