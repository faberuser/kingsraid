import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function capitalize(s: string) {
	if (s.length === 0) return s
	return s
		.split(" ")
		.map((word) => (word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word))
		.join(" ")
}

const CLASS_COLOR_TEXT: Record<string, string> = {
	knight: "text-blue-500",
	warrior: "text-yellow-900",
	archer: "text-green-500",
	mechanic: "text-blue-900",
	wizard: "text-red-500",
	assassin: "text-purple-500",
	priest: "text-blue-200",
}

export function classColorMapText(className: string) {
	return CLASS_COLOR_TEXT[className.toLowerCase()]
}

const CLASS_COLOR_BG: Record<string, string> = {
	knight: "bg-blue-500/10",
	warrior: "bg-yellow-900/10",
	archer: "bg-green-500/10",
	mechanic: "bg-blue-900/10",
	wizard: "bg-red-500/10",
	assassin: "bg-purple-500/10",
	priest: "bg-blue-200/10",
}

export function classColorMapBg(className: string) {
	return CLASS_COLOR_BG[className.toLowerCase()]
}

const CLASS_COLOR_BADGE: Record<string, string> = {
	knight: "bg-blue-500",
	warrior: "bg-yellow-700",
	archer: "bg-green-500",
	mechanic: "bg-blue-700",
	wizard: "bg-red-500",
	assassin: "bg-purple-500",
	priest: "bg-blue-300",
}

export function classColorMapBadge(className: string) {
	return CLASS_COLOR_BADGE[className.toLowerCase()] || "bg-gray-500"
}

/**
 * Parses text with color codes like [ffc800]text[-] and newlines, returns JSX with colored spans and line breaks
 * @param text - Text containing color codes in format [HEX_COLOR]text[-] and \n for newlines
 * @returns Array of React elements with colored text and line breaks
 */
export function parseColoredText(text: string): React.ReactNode[] {
	// Regular expression to match [COLOR]text[-] pattern
	const colorPattern = /\[([0-9a-fA-F]{6})\](.*?)\[-\]/g
	const parts: React.ReactNode[] = []
	let lastIndex = 0
	let match
	let keyCounter = 0

	while ((match = colorPattern.exec(text)) !== null) {
		// Add text before the colored section (with newlines converted to <br />)
		if (match.index > lastIndex) {
			const plainText = text.substring(lastIndex, match.index)
			parts.push(...splitTextWithNewlines(plainText, keyCounter))
			keyCounter += plainText.split("\n").length
		}

		// Add colored text with theme-aware styling
		const originalColor = `#${match[1]}`
		const coloredText = match[2]
		parts.push(
			React.createElement(
				"span",
				{
					key: `color-${keyCounter++}`,
					style: { color: originalColor },
					className: "skill-colored-text",
				},
				coloredText,
			),
		)

		lastIndex = match.index + match[0].length
	}

	// Add remaining text after the last match (with newlines converted to <br />)
	if (lastIndex < text.length) {
		const plainText = text.substring(lastIndex)
		parts.push(...splitTextWithNewlines(plainText, keyCounter))
	}

	// If no matches found, still process newlines
	if (parts.length === 0) {
		parts.push(...splitTextWithNewlines(text, 0))
	}

	return parts
}

/**
 * Helper function to split text by newlines and insert <br /> elements
 */
function splitTextWithNewlines(text: string, startKey: number): React.ReactNode[] {
	const lines = text.split("\n")
	const result: React.ReactNode[] = []

	lines.forEach((line, index) => {
		if (line) {
			result.push(line)
		}
		// Add <br /> after each line except the last one
		if (index < lines.length - 1) {
			result.push(React.createElement("br", { key: `br-${startKey}-${index}` }))
		}
	})

	return result
}
