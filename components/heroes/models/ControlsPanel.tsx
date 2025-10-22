"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Play, Pause } from "lucide-react"
import { ModelFile } from "@/model/Hero_Model"
import { formatAnimationName } from "@/components/heroes/models/utils"

interface ControlsPanelProps {
	isCollapsed: boolean
	isLoading: boolean
	selectedScene: string
	setSelectedScene: (scene: string) => void
	availableScenes: Array<{ value: string; label: string }>
	modelFiles: ModelFile[]
	visibleModels: Set<string>
	toggleModelVisibility: (modelName: string) => void
	availableAnimations: string[]
	selectedAnimation: string | null
	setSelectedAnimation: (animation: string | null) => void
	isPaused: boolean
	setIsPaused: (paused: boolean) => void
}

export function ControlsPanel({
	isCollapsed,
	isLoading,
	selectedScene,
	setSelectedScene,
	availableScenes,
	modelFiles,
	visibleModels,
	toggleModelVisibility,
	availableAnimations,
	selectedAnimation,
	setSelectedAnimation,
	isPaused,
	setIsPaused,
}: ControlsPanelProps) {
	return (
		<div
			className="absolute top-0 h-full z-10 bg-background/95 backdrop-blur-sm border-r shadow-xl p-4 overflow-y-auto flex flex-col gap-4 w-52 transition-all duration-300 ease-in-out"
			style={{
				left: isCollapsed ? "-208px" : "0px",
			}}
		>
			{/* Scene Selection */}
			<div className="space-y-2">
				<div className="text-sm font-semibold">Scene</div>
				<Select value={selectedScene} onValueChange={setSelectedScene} disabled={isLoading}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select Scene" />
					</SelectTrigger>
					<SelectContent>
						{availableScenes.map((scene) => (
							<SelectItem key={scene.value} value={scene.value}>
								{scene.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<Separator />

			{/* Individual Model Toggles */}
			<div className="space-y-2">
				<div className="text-sm font-semibold">Parts ({modelFiles.length})</div>
				<div className="flex flex-col items-center gap-2">
					{Array.from(new Map(modelFiles.map((model) => [model.name, model])).values())
						.sort((a, b) => a.name.localeCompare(b.name))
						.map((model) => (
							<Button
								key={model.name}
								size="sm"
								variant={visibleModels.has(model.name) ? "default" : "outline"}
								onClick={() => toggleModelVisibility(model.name)}
								className="flex items-center gap-2 w-full"
								disabled={isLoading}
							>
								{visibleModels.has(model.name) ? (
									<Eye className="h-3 w-3" />
								) : (
									<EyeOff className="h-3 w-3" />
								)}
								<span className="capitalize">{model.type}</span>
							</Button>
						))}
				</div>
			</div>

			{/* Animation Selection */}
			{availableAnimations.length > 0 && (
				<>
					<Separator />

					<div className="space-y-2 w-full flex-1 min-h-0 overflow-hidden flex flex-col">
						<div className="flex items-center justify-between">
							<div className="text-sm font-semibold">Animations ({availableAnimations.length})</div>
							<Button
								size="sm"
								variant="ghost"
								onClick={() => setIsPaused(!isPaused)}
								className="h-6 w-6 p-0"
								title={isPaused ? "Play animation" : "Pause animation"}
								disabled={isLoading}
							>
								{isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
							</Button>
						</div>
						<div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-1 flex-1 min-h-0">
							{[...availableAnimations]
								.sort((a, b) => formatAnimationName(a).localeCompare(formatAnimationName(b)))
								.map((animName) => (
									<Button
										key={animName}
										size="sm"
										variant={selectedAnimation === animName ? "default" : "outline"}
										onClick={() => setSelectedAnimation(animName)}
										title={animName}
										disabled={isLoading}
									>
										<span className="text-start text-xs truncate w-full">
											{formatAnimationName(animName)}
										</span>
									</Button>
								))}
						</div>
					</div>
				</>
			)}
		</div>
	)
}
