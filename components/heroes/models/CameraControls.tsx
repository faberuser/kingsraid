"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Kbd } from "@/components/ui/kbd"
import { RotateCcw, Info, Camera, Video, Square, Film } from "lucide-react"

interface CameraControlsProps {
	isLoading: boolean
	resetCamera: () => void
	captureScreenshot: () => void
	isRecording: boolean
	isExportingAnimation: boolean
	toggleRecording: () => void
	exportAnimation: () => void
	selectedAnimation: string | null
	animationDuration: number
}

export function CameraControls({
	isLoading,
	resetCamera,
	captureScreenshot,
	isRecording,
	isExportingAnimation,
	toggleRecording,
	exportAnimation,
	selectedAnimation,
	animationDuration,
}: CameraControlsProps) {
	return (
		<div className="absolute top-4 right-4 flex flex-col gap-2">
			<Tooltip>
				<TooltipTrigger asChild>
					<Button size="sm" variant="secondary" disabled={isLoading}>
						<Info className="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent className="space-y-1">
					<div>
						<Kbd>Left Click</Kbd> Rotate
					</div>
					<div>
						<Kbd>Right Click</Kbd> Move
					</div>
					<div>
						<Kbd>Scroll</Kbd> Zoom
					</div>
				</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button size="sm" variant="secondary" onClick={resetCamera} disabled={isLoading}>
						<RotateCcw className="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<div>Reset Camera</div>
				</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button size="sm" variant="secondary" onClick={captureScreenshot} disabled={isLoading}>
						<Camera className="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<div>Take Screenshot</div>
				</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						size="sm"
						variant={isRecording && !isExportingAnimation ? "destructive" : "secondary"}
						onClick={toggleRecording}
						disabled={isLoading || isExportingAnimation}
					>
						{isRecording && !isExportingAnimation ? (
							<Square className="h-4 w-4" />
						) : (
							<Video className="h-4 w-4" />
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<div>{isRecording && !isExportingAnimation ? "Stop Recording" : "Record Video"}</div>
				</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						size="sm"
						variant={isExportingAnimation ? "destructive" : "secondary"}
						onClick={exportAnimation}
						disabled={isLoading || !selectedAnimation || isRecording}
					>
						<Film className="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<div>
						{isExportingAnimation
							? "Exporting..."
							: selectedAnimation
							? `Export Animation (${animationDuration.toFixed(1)}s)`
							: "Select an animation first"}
					</div>
				</TooltipContent>
			</Tooltip>
		</div>
	)
}
