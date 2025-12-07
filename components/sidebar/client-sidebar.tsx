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
} from "@/components/ui/sidebar"
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

	useEffect(() => {
		// Schedule the state update to avoid synchronous setState in effect
		const timer = setTimeout(() => setMounted(true), 0)
		return () => clearTimeout(timer)
	}, [])

	const logoSrc = mounted && resolvedTheme === "dark" ? "/images/logo-white.svg" : "/images/logo-black.svg"

	return (
		<Sidebar>
			<SidebarHeader className="px-5 py-4 border-b mt-1">
				<Link href="/" className="flex items-center space-x-2">
					{mounted && (
						<Image src={logoSrc} alt="King's Raid Logo" width={160} height={40} className="h-auto w-40" />
					)}
				</Link>
			</SidebarHeader>

			<SidebarContent className="gap-0">
				{/* Search Section */}
				<SidebarGroup>
					<SidebarGroupContent className="px-2 mt-2">
						<GlobalSearch searchData={searchData} />
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
									</SidebarMenuItem>
								)
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="px-5 py-4 border-t flex flex-row justify-between">
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
