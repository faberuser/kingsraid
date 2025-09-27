import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
