"use client"

import { ReactNode } from "react"
import { DataVersion, DataVersionLabels } from "@/hooks/use-data-version"
import { useCompareMode } from "@/hooks/use-compare-mode"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CompareLayoutProps {
	/** Single view content (when not in compare mode) */
	children: ReactNode
	/** Left side content for compare mode */
	leftContent: ReactNode
	/** Right side content for compare mode */
	rightContent: ReactNode
	/** Available versions for this entity */
	availableVersions: DataVersion[]
	/** Optional: Custom class for the layout container */
	className?: string
}

export default function CompareLayout({
	children,
	leftContent,
	rightContent,
	availableVersions,
	className,
}: CompareLayoutProps) {
	const { isCompareMode, leftVersion, rightVersion, isHydrated } = useCompareMode()

	if (!isHydrated) {
		return <>{children}</>
	}

	if (!isCompareMode) {
		return <>{children}</>
	}

	// Check if versions are available
	const leftAvailable = availableVersions.includes(leftVersion)
	const rightAvailable = availableVersions.includes(rightVersion)

	return (
		<div className={cn("hidden lg:flex lg:flex-row gap-4 lg:h-[calc(100vh-140px)]", className)}>
			{/* Left Panel */}
			<div className="flex-1 min-w-0 flex flex-col">
				<div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-2 mb-2 shrink-0">
					<Badge variant="secondary" className="text-sm font-medium">
						{DataVersionLabels[leftVersion]}
					</Badge>
				</div>
				{leftAvailable ? (
					<div className="flex-1 overflow-y-auto pr-2 custom-scrollbar compare-panel">{leftContent}</div>
				) : (
					<div className="flex items-center justify-center h-48 text-muted-foreground border rounded-lg bg-muted/50">
						Not available in {DataVersionLabels[leftVersion]}
					</div>
				)}
			</div>

			{/* Right Panel */}
			<div className="flex-1 min-w-0 flex flex-col">
				<div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-2 mb-2 shrink-0">
					<Badge variant="secondary" className="text-sm font-medium">
						{DataVersionLabels[rightVersion]}
					</Badge>
				</div>
				{rightAvailable ? (
					<div className="flex-1 overflow-y-auto pr-2 custom-scrollbar compare-panel">{rightContent}</div>
				) : (
					<div className="flex items-center justify-center h-48 text-muted-foreground border rounded-lg bg-muted/50">
						Not available in {DataVersionLabels[rightVersion]}
					</div>
				)}
			</div>
		</div>
	)
}
