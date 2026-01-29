"use client"

import { ArrowLeft, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import MobileMenu from "@/components/mobile-menu"
import { SidebarInset } from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"
import {
	useHeroDataVersion,
	HeroDataVersion,
	HeroDataVersionLabels,
	HeroDataVersionDescriptions,
} from "@/hooks/use-hero-data-version"
import { useHeroToggle } from "@/contexts/hero-toggle-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useIsMobile } from "@/hooks/use-mobile"

export default function SidebarInsetClient({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const pathname = usePathname()
	const { version, setVersion } = useHeroDataVersion()
	const { showToggle } = useHeroToggle()
	const isMobile = useIsMobile()

	const versionOptions: HeroDataVersion[] = ["cbt", "ccbt", "legacy"]

	return (
		<SidebarInset className={`${pathname !== "/" && "container mx-auto p-4 pt-2 sm:p-8 sm:pt-4"}`}>
			{/* Back Button */}
			<div
				className={`mb-2 flex flex-row items-center gap-2 ${
					pathname === "/" ? "p-4 pt-2.5 justify-end md:hidden" : "justify-between"
				}`}
			>
				{pathname !== "/" && (
					<Button variant="ghost" className="gap-2 has-[>svg]:px-0 p-0" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4" />
						Back
					</Button>
				)}
				{showToggle && (
					<div className="flex items-center gap-2">
						{isMobile ? (
							<Popover>
								<PopoverTrigger asChild>
									<Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
								</PopoverTrigger>
								<PopoverContent className="max-w-fit">
									<p className="text-sm">{HeroDataVersionDescriptions[version]}</p>
								</PopoverContent>
							</Popover>
						) : (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Info className="h-4 w-4 text-muted-foreground cursor-help" />
									</TooltipTrigger>
									<TooltipContent className="max-w-fit">
										<p className="text-sm">{HeroDataVersionDescriptions[version]}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						)}
						<Select value={version} onValueChange={(value) => setVersion(value as HeroDataVersion)}>
							<SelectTrigger>
								<SelectValue placeholder="Version" />
							</SelectTrigger>
							<SelectContent>
								{versionOptions.map((opt) => (
									<SelectItem key={opt} value={opt}>
										{HeroDataVersionLabels[opt]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
				<div className="md:hidden">
					<MobileMenu />
				</div>
			</div>
			<main className="w-full">{children}</main>
		</SidebarInset>
	)
}
