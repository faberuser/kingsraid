"use client"

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarHeader,
	SidebarFooter,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Home, Newspaper, UserRound, Amphora, ShieldHalf, Github, Calculator } from "lucide-react"
import Link from "next/link"
import { ModeToggle } from "@/components/theme-toggle"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import GlobalSearch from "@/components/sidebar/global-search"
import { ArtifactData } from "@/model/Artifact"
import { HeroData } from "@/model/Hero"
import { BossData } from "@/model/Boss"
import Image from "@/components/next-image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

// Menu items
export const items = [
	{ title: "Home", url: "/", icon: Home },
	{ title: "News", url: "/news", icon: Newspaper },
	{ title: "Heroes", url: "/heroes", icon: UserRound },
	{ title: "Artifacts", url: "/artifacts", icon: Amphora },
	{ title: "Bosses", url: "/bosses", icon: ShieldHalf },
	{ title: "Softcap", url: "/softcap", icon: Calculator },
]

interface ClientSidebarProps {
	searchData: {
		heroes: HeroData[]
		artifacts: ArtifactData[]
		bosses: BossData[]
	}
}

export default function ClientSidebar({ searchData }: ClientSidebarProps) {
	const pathname = usePathname()
	const { resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)
	const { state } = useSidebar()

	useEffect(() => {
		// Schedule the state update to avoid synchronous setState in effect
		const timer = setTimeout(() => setMounted(true), 0)
		return () => clearTimeout(timer)
	}, [])

	const logoSrc = mounted && resolvedTheme === "dark" ? "/images/logo-white.svg" : "/images/logo-black.svg"

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader className={"px-5 py-4 border-b mt-1 " + (state === "collapsed" ? "p-2" : "")}>
				<div className="flex items-center justify-between gap-2">
					{state === "collapsed" ? null : (
						<Link href="/" className="flex items-center space-x-2 group-data-[collapsible=icon]:hidden">
							{mounted && (
								<Image
									src={logoSrc}
									alt="King's Raid Logo"
									width={160}
									height={40}
									className="h-auto w-full max-w-[160px]"
								/>
							)}
						</Link>
					)}
					<SidebarTrigger className="ml-auto" />
				</div>
			</SidebarHeader>

			<SidebarContent className="gap-0">
				{/* Search Section */}
				<SidebarGroup>
					<SidebarGroupContent
						className={"px-2 mt-2 " + (state === "collapsed" ? "p-0 flex justify-center items-center" : "")}
					>
						<GlobalSearch searchData={searchData} state={state} />
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Navigation Menu */}
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => {
								const isActive =
									item.url === "/"
										? pathname === "/" // Home should only match exact "/"
										: pathname.startsWith(item.url)

								return (
									<SidebarMenuItem key={item.title}>
										<Tooltip>
											<TooltipTrigger asChild>
												<SidebarMenuButton asChild>
													<Link
														href={item.url}
														className={`flex items-center space-x-2 pl-5 py-6 rounded-md transition-colors ${
															isActive
																? "bg-gray-200 dark:bg-gray-800"
																: "hover:bg-gray-100 dark:hover:bg-gray-700"
														}`}
													>
														<item.icon />
														<div className="text-lg">{item.title}</div>
													</Link>
												</SidebarMenuButton>
											</TooltipTrigger>
											<TooltipContent side="right" className="group-data-[state=expanded]:hidden">
												{item.title}
											</TooltipContent>
										</Tooltip>
									</SidebarMenuItem>
								)
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter
				className={
					state === "expanded"
						? "px-5 py-4 border-t flex flex-row justify-between"
						: "py-1 flex flex-column items-center"
				}
			>
				<ModeToggle />
				<Link target="_blank" rel="noreferrer" href="https://github.com/faberuser/kingsraid">
					<Button variant="outline" size="icon" className="bg-background">
						<Github className="h-[1.2rem] w-[1.2rem]" />
						<div className="sr-only">GitHub</div>
					</Button>
				</Link>
			</SidebarFooter>
		</Sidebar>
	)
}
