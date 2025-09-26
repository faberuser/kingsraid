import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarHeader,
	SidebarFooter,
} from "@/components/ui/sidebar"
import { Home, UserRound, Amphora, ShieldHalf } from "lucide-react"
import Link from "next/link"
import { ModeToggle } from "@/components/theme-toggle"

// Menu items.
const items = [
	{
		title: "Home",
		url: "/",
		icon: Home,
	},
	{
		title: "Heroes",
		url: "/heroes",
		icon: UserRound,
	},
	{
		title: "Artifacts",
		url: "/artifacts",
		icon: Amphora,
	},
	{
		title: "Bosses",
		url: "/bosses",
		icon: ShieldHalf,
	},
]

interface AppSidebarProps {
	title: string
}

export default function AppSidebar({ title }: AppSidebarProps) {
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
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild className="py-6">
										<Link href={item.url} className="space-x-2 pl-5">
											<item.icon />
											<span className="text-lg">{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="px-5 py-4 border-t">
				<ModeToggle />
			</SidebarFooter>
		</Sidebar>
	)
}
