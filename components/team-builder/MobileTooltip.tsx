"use client"

import { useState, useRef, useCallback, ReactNode } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface MobilePerkTooltipProps {
	children: ReactNode
	content: ReactNode
	disabled?: boolean
	side?: "top" | "bottom" | "left" | "right"
}

export function MobileTooltip({ children, content, disabled, side = "top" }: MobilePerkTooltipProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [isMobileOpen, setIsMobileOpen] = useState(false)
	const longPressTimer = useRef<NodeJS.Timeout | null>(null)
	const touchStartPos = useRef({ x: 0, y: 0 })

	const handleTouchStart = useCallback(
		(e: React.TouchEvent) => {
			if (disabled) return

			// Prevent default browser context menu on long press
			e.preventDefault()

			const touch = e.touches[0]
			touchStartPos.current = { x: touch.clientX, y: touch.clientY }

			// Start long press timer
			longPressTimer.current = setTimeout(() => {
				setIsMobileOpen(true)
			}, 500) // 500ms for long press
		},
		[disabled],
	)

	const handleTouchMove = useCallback((e: React.TouchEvent) => {
		// Cancel long press if finger moves too much
		const touch = e.touches[0]
		const deltaX = Math.abs(touch.clientX - touchStartPos.current.x)
		const deltaY = Math.abs(touch.clientY - touchStartPos.current.y)

		if (deltaX > 10 || deltaY > 10) {
			if (longPressTimer.current) {
				clearTimeout(longPressTimer.current)
				longPressTimer.current = null
			}
		}
	}, [])

	const handleTouchEnd = useCallback(() => {
		if (longPressTimer.current) {
			clearTimeout(longPressTimer.current)
			longPressTimer.current = null
		}
	}, [])

	const handleTouchCancel = useCallback(() => {
		if (longPressTimer.current) {
			clearTimeout(longPressTimer.current)
			longPressTimer.current = null
		}
		setIsMobileOpen(false)
	}, [])

	// Prevent context menu from appearing
	const handleContextMenu = useCallback((e: React.MouseEvent) => {
		e.preventDefault()
	}, [])

	// Close mobile tooltip when tapping outside
	const handleMobileClose = useCallback(() => {
		setIsMobileOpen(false)
	}, [])

	return (
		<>
			<Tooltip open={isOpen || isMobileOpen} onOpenChange={setIsOpen}>
				<TooltipTrigger asChild>
					<div
						onTouchStart={handleTouchStart}
						onTouchMove={handleTouchMove}
						onTouchEnd={handleTouchEnd}
						onTouchCancel={handleTouchCancel}
						onContextMenu={handleContextMenu}
						style={{
							WebkitTouchCallout: "none",
							WebkitUserSelect: "none",
							userSelect: "none",
						}}
					>
						{children}
					</div>
				</TooltipTrigger>
				<TooltipContent side={side} className="max-w-xs">
					{content}
				</TooltipContent>
			</Tooltip>

			{/* Backdrop for mobile to close tooltip */}
			{isMobileOpen && (
				<div
					className="fixed inset-0 z-40 bg-transparent"
					onClick={handleMobileClose}
					onTouchStart={handleMobileClose}
				/>
			)}
		</>
	)
}
