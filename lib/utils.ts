import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function capitalize(s: string) {
	if (s.length === 0) return s
	return s.charAt(0).toUpperCase() + s.slice(1)
}

export function classColorMap(className: string) {
	switch (className.toLowerCase()) {
		case "knight":
			return "text-blue-500"
		case "warrior":
			return "text-brown-500"
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
