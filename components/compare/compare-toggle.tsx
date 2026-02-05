"use client"

import { ArrowLeftRight, Plus, X } from "lucide-react"
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
		compareVersions,
		setVersionAtIndex,
		swapVersions,
		addVersion,
		removeVersion,
		getAvailableVersionsToAdd,
		canAddMore,
		isHydrated,
	} = useCompareMode()

	if (!isHydrated) {
		return null
	}

	const versionsToAdd = getAvailableVersionsToAdd(availableVersions)
	const canAdd = canAddMore(availableVersions)
	const canRemove = compareVersions.length > 2

	return (
		<div className="hidden lg:flex items-center gap-2">
			<MobileTooltip
				content={
					<div className="text-sm">
						{isCompareMode ? "Exit compare mode" : "Compare versions side-by-side"}
					</div>
				}
			>
				<Button variant={isCompareMode ? "default" : "outline"} onClick={toggleCompareMode}>
					<span className="hidden sm:inline">Compare</span>
				</Button>
			</MobileTooltip>

			{isCompareMode && (
				<div className="flex items-center gap-1.5 flex-wrap">
					{compareVersions.map((version, index) => (
						<div key={index} className="flex items-center gap-0.5">
							{index > 0 && (
								<MobileTooltip content={<div className="text-sm">Swap with previous</div>}>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										onClick={() => swapVersions(index - 1, index)}
									>
										<ArrowLeftRight className="h-4 w-4" />
									</Button>
								</MobileTooltip>
							)}
							<div className="flex items-center">
								<Select
									value={version}
									onValueChange={(value) => setVersionAtIndex(index, value as DataVersion)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Version" />
									</SelectTrigger>
									<SelectContent>
										{availableVersions.map((opt) => (
											<SelectItem key={opt} value={opt}>
												{DataVersionLabels[opt]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{canRemove && (
									<MobileTooltip content={<div className="text-sm">Remove version</div>}>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 ml-0.5"
											onClick={() => removeVersion(version)}
										>
											<X className="h-4 w-4" />
										</Button>
									</MobileTooltip>
								)}
							</div>
						</div>
					))}

					{canAdd && (
						<Select value="" onValueChange={(value) => addVersion(value as DataVersion)}>
							<SelectTrigger>
								<Plus className="h-4 w-4" />
							</SelectTrigger>
							<SelectContent>
								{versionsToAdd.map((opt) => (
									<SelectItem key={opt} value={opt}>
										{DataVersionLabels[opt]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				</div>
			)}
		</div>
	)
}
