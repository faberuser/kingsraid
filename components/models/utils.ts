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

/**
 * Animation to voice mapping
 * Maps animation names to their corresponding voice file patterns
 */
const ANIMATION_VOICE_MAP: Record<string, string[]> = {
	// Skills
	skill1: ["Skill1", "Skill1_b", "Skill1_c"],
	skill2: ["Skill2", "Skill2_b", "Skill2_c"],
	skill3: ["Skill3", "Skill3_b", "Skill3_c"],
	skill4: ["Skill4", "Skill4_b", "Skill4_c"],
	skill5: ["Skill5", "Skill5_b", "Skill5_c"],
	// Attacks
	attack: ["Attack", "Attack1", "Attack2", "Attack3", "Attack4"],
	attack1: ["Attack1", "Attack"],
	attack2: ["Attack2", "Attack"],
	attack3: ["Attack3", "Attack"],
	attack4: ["Attack4", "Attack"],
	// Combat
	damage: ["Damage_01", "Damage_02", "Damage"],
	dead: ["Dead"],
	victory: ["Victory", "Victory_b"],
	// Interactions
	inntouch: ["Touch", "Touch1", "Touch2"],
	innidle: ["InnIdle", "Idle"],
	touch: ["Touch", "Touch1", "Touch2"],
	think: ["Think1", "Think2", "Think"],
	happy: ["Happy1", "Happy2", "Happy"],
	laugh: ["Laugh"],
	casting: ["Casting1", "Casting2", "Casting"],
	// Other
	trs: ["trs"],
	get: ["get-01", "get-01_b", "get-02_c"],
}

/**
 * Find matching voice file for an animation
 * @param animationName - The animation name (e.g., "Hero_Aisha@Skill1_Skill1")
 * @param voiceFiles - Array of voice files for the selected language
 * @param heroName - The hero's name for matching
 * @returns The voice file path or null if not found
 */
export const findVoiceForAnimation = (
	animationName: string,
	voiceFiles: Array<{ name: string; path: string; displayName: string }>,
	heroName: string,
): string | null => {
	if (!animationName || !voiceFiles || voiceFiles.length === 0) {
		return null
	}

	// Extract the animation type from the animation name
	// Format: "Hero_Name@AnimType_AnimType" or "Hero_Name@AnimType_AnimType-1"
	const atIndex = animationName.indexOf("@")
	if (atIndex === -1) {
		return null
	}

	const animPart = animationName.substring(atIndex + 1).toLowerCase()

	// Extract sequence info if present (e.g., "skill1_skill1-2" -> base: "skill1", sequence: "2")
	const sequenceMatch = animPart.match(/([a-z]+\d+)[-_](\d+)/)
	const sequenceNum = sequenceMatch ? sequenceMatch[2] : null
	const isFirstInSequence = sequenceNum === "1" || sequenceNum === null

	// Helper function to check if voice name matches pattern
	const matchesVoicePattern = (voiceNameLower: string, heroNameLower: string, patternLower: string): boolean => {
		if (!voiceNameLower.startsWith(`${heroNameLower}-`)) {
			return false
		}

		// Check for pattern with language suffix (e.g., "vox_skill1_jp" or "vox_skill1_en")
		// Also check for pattern at end of name without suffix (e.g., "vox_skill1" for English files)
		const hasPatternWithSuffix =
			voiceNameLower.includes(`vox_${patternLower}_`) || voiceNameLower.includes(`vox-${patternLower}_`)

		// For files without language suffix (common in English), check if pattern is at the end
		// e.g., "aisha-vox_skill1" should match pattern "skill1"
		const endsWithPattern =
			voiceNameLower.endsWith(`vox_${patternLower}`) || voiceNameLower.endsWith(`vox-${patternLower}`)

		return hasPatternWithSuffix || endsWithPattern
	}

	// Try to match against known animation types
	for (const [animKey, voicePatterns] of Object.entries(ANIMATION_VOICE_MAP)) {
		if (animPart.includes(animKey)) {
			// Try each voice pattern for this animation type
			for (const pattern of voicePatterns) {
				const heroNameLower = heroName.toLowerCase()

				// First, try to find a sequence-specific voice (e.g., Skill1-2_jp.wav)
				if (sequenceNum) {
					const patternWithSeq = `${pattern.toLowerCase()}-${sequenceNum}`
					const sequenceVoice = voiceFiles.find((voice) => {
						const voiceNameLower = voice.name.toLowerCase()
						return matchesVoicePattern(voiceNameLower, heroNameLower, patternWithSeq)
					})

					if (sequenceVoice) {
						return sequenceVoice.path
					}
				}

				// Only play base voice on the FIRST animation of a sequence
				// This prevents the same voice from playing on Skill2-1, Skill2-2, Skill2-3
				// when there's no sequence-specific voice file
				if (!isFirstInSequence) {
					// Not the first in sequence and no sequence-specific voice found
					// Skip playing the base voice
					continue
				}

				// Try to find the base voice (e.g., Skill1_jp.wav or Skill1.wav)
				const patternLower = pattern.toLowerCase()
				const matchingVoice = voiceFiles.find((voice) => {
					const voiceNameLower = voice.name.toLowerCase()
					return matchesVoicePattern(voiceNameLower, heroNameLower, patternLower)
				})

				if (matchingVoice) {
					return matchingVoice.path
				}
			}
		}
	}

	return null
}
