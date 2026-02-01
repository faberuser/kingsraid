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

export function classColorMapText(className: string) {
	switch (className.toLowerCase()) {
		case "knight":
			return "text-blue-500"
		case "warrior":
			return "text-yellow-900"
		case "archer":
			return "text-green-500"
		case "mechanic":
			return "text-blue-900"
		case "wizard":
			return "text-red-500"
		case "assassin":
			return "text-purple-500"
		case "priest":
			return "text-blue-200"
	}
}

export function classColorMapBg(className: string) {
	switch (className.toLowerCase()) {
		case "knight":
			return "bg-blue-500/10"
		case "warrior":
			return "bg-yellow-900/10"
		case "archer":
			return "bg-green-500/10"
		case "mechanic":
			return "bg-blue-900/10"
		case "wizard":
			return "bg-red-500/10"
		case "assassin":
			return "bg-purple-500/10"
		case "priest":
			return "bg-blue-200/10"
	}
}

export function classColorMapBadge(className: string) {
	switch (className.toLowerCase()) {
		case "knight":
			return "bg-blue-500"
		case "warrior":
			return "bg-yellow-700"
		case "archer":
			return "bg-green-500"
		case "mechanic":
			return "bg-blue-700"
		case "wizard":
			return "bg-red-500"
		case "assassin":
			return "bg-purple-500"
		case "priest":
			return "bg-blue-300"
		default:
			return "bg-gray-500"
	}
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

		// Add colored text
		const color = `#${match[1]}`
		const coloredText = match[2]
		parts.push(React.createElement("span", { key: `color-${keyCounter++}`, style: { color } }, coloredText))

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
