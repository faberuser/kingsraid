import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Home, UserRound, Amphora, ShieldHalf } from "lucide-react"

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
			<SidebarContent className="ctscroll">
				<SidebarGroup>
					<SidebarGroupLabel>
						<div
							// onClick={() => setNewPath("")}
							className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-50"
						>
							<span className="text-base mt-1">{title}</span>
						</div>
					</SidebarGroupLabel>
					<SidebarGroupContent className="mt-5">
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild className="py-6">
										<a href={item.url} className="space-x-2 pl-5">
											<item.icon />
											<span className="text-lg">{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	)
}
