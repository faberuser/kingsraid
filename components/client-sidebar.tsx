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
import { Home, UserRound, Amphora, ShieldHalf, Github, Zap, Calculator } from "lucide-react"
import Link from "next/link"
import { ModeToggle } from "@/components/theme-toggle"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import GlobalSearch from "@/components/global-search"

// Menu items
const items = [
	{ title: "Home", url: "/", icon: Home },
	{ title: "Heroes", url: "/heroes", icon: UserRound },
	{ title: "Artifacts", url: "/artifacts", icon: Amphora },
	{ title: "Bosses", url: "/bosses", icon: ShieldHalf },
	{ title: "Technomagic Gear", url: "/technomagic-gear", icon: Zap },
	{ title: "Softcap", url: "/softcap", icon: Calculator },
]

interface ClientSidebarProps {
	searchData: {
		heroes: Array<{ name: string; infos?: { class?: string; title?: string } }>
		artifacts: Array<{ name: string; data?: { description?: string } }>
		bosses: Array<{ infos?: { class?: string; title?: string; race?: string } }>
	}
}

export default function ClientSidebar({ searchData }: ClientSidebarProps) {
	const pathname = usePathname()

	return (
		<Sidebar>
			<SidebarHeader className="px-5 py-4 border-b">
				<Link href="/" className="text-2xl font-bold">
					King's Raid
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
