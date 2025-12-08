"use client"

import { ArrowLeft, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import MobileMenu from "@/components/mobile-menu"
import { SidebarInset } from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { useHeroDataVersion } from "@/hooks/use-hero-data-version"
import { useHeroToggle } from "@/contexts/hero-toggle-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function SidebarInsetClient({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const pathname = usePathname()
	const { isNew, toggleVersion } = useHeroDataVersion()
	const { showToggle } = useHeroToggle()

	return (
		<SidebarInset className={`${pathname !== "/" && "container mx-auto p-4 pt-2 sm:p-8"}`}>
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
					<TooltipProvider>
						<div className="flex items-center gap-2">
							<Tooltip>
								<TooltipTrigger asChild>
									<Info className="h-4 w-4 text-muted-foreground cursor-help" />
								</TooltipTrigger>
								<TooltipContent className="max-w-sm">
									<p className="text-sm">
										New data from Content Creator CBT.
										<br />
										Costumes, Models, Voices use legacy data.
									</p>
								</TooltipContent>
							</Tooltip>
							<span className={`text-sm font-medium ${isNew ? "text-primary" : "text-muted-foreground"}`}>
								New
							</span>
							<Switch checked={!isNew} onCheckedChange={toggleVersion} />
							<span className={`text-sm font-medium ${isNew ? "text-muted-foreground" : "text-primary"}`}>
								Legacy
							</span>
						</div>
					</TooltipProvider>
				)}
				<div className="md:hidden">
					<MobileMenu />
				</div>
			</div>
			<main className="w-full">{children}</main>
		</SidebarInset>
	)
}
