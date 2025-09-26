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
import { Home, UserRound, Amphora, ShieldHalf, Github } from "lucide-react"
import Link from "next/link"
import { ModeToggle } from "@/components/theme-toggle"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

// Menu items
const items = [
	{ title: "Home", url: "/", icon: Home },
	{ title: "Heroes", url: "/heroes", icon: UserRound },
	{ title: "Artifacts", url: "/artifacts", icon: Amphora },
	{ title: "Bosses", url: "/bosses", icon: ShieldHalf },
]

interface AppSidebarProps {
	title: string
}

export default function AppSidebar({ title }: AppSidebarProps) {
	const pathname = usePathname()

	return (
		<Sidebar className="dark:border-gray-600">
			<SidebarHeader className="px-5 py-4 border-b">
				<Link href="/" className="text-2xl font-bold">
					{title}
				</Link>
			</SidebarHeader>

			<SidebarContent className="ctscroll">
				<SidebarGroup>
					<SidebarGroupContent className="mt-5">
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
												<span className="text-lg">{item.title}</span>
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
						<span className="sr-only">GitHub</span>
					</Button>
				</Link>
			</SidebarFooter>
		</Sidebar>
	)
}
