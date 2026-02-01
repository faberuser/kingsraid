"use client"

import { ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataVersion, DataVersionLabels } from "@/hooks/use-data-version"
import { useCompareMode } from "@/hooks/use-compare-mode"
import { MobileTooltip } from "@/components/mobile-tooltip"

interface CompareToggleProps {
	availableVersions: DataVersion[]
}

export default function CompareToggle({ availableVersions }: CompareToggleProps) {
	const {
		isCompareMode,
		toggleCompareMode,
		leftVersion,
		rightVersion,
		setLeftVersion,
		setRightVersion,
		swapVersions,
		isHydrated,
	} = useCompareMode()

	if (!isHydrated) {
		return null
	}

	// Filter versions that are available for this entity
	// Show all available versions in dropdowns since swapping handles duplicates
	const filteredLeftVersions = availableVersions
	const filteredRightVersions = availableVersions

	return (
		<div className="hidden lg:flex items-center gap-2">
			<MobileTooltip
				content={
					<div className="text-sm">
						{isCompareMode ? "Exit compare mode" : "Compare two versions side-by-side"}
					</div>
				}
			>
				<Button variant={isCompareMode ? "default" : "outline"} onClick={toggleCompareMode}>
					<span className="hidden sm:inline">Compare</span>
				</Button>
			</MobileTooltip>

			{isCompareMode && (
				<div className="flex items-center gap-1.5">
					<Select value={leftVersion} onValueChange={(value) => setLeftVersion(value as DataVersion)}>
						<SelectTrigger>
							<SelectValue placeholder="Left" />
						</SelectTrigger>
						<SelectContent>
							{filteredLeftVersions.map((opt) => (
								<SelectItem key={opt} value={opt}>
									{DataVersionLabels[opt]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<MobileTooltip content={<div className="text-sm">Swap versions</div>}>
						<Button variant="ghost" size="icon" className="h-8 w-8" onClick={swapVersions}>
							<ArrowLeftRight className="h-4 w-4" />
						</Button>
					</MobileTooltip>

					<Select value={rightVersion} onValueChange={(value) => setRightVersion(value as DataVersion)}>
						<SelectTrigger>
							<SelectValue placeholder="Right" />
						</SelectTrigger>
						<SelectContent>
							{filteredRightVersions.map((opt) => (
								<SelectItem key={opt} value={opt}>
									{DataVersionLabels[opt]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}
		</div>
	)
}
