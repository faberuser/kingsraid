import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
} from "@/components/ui/sidebar"

interface AppSidebarProps {
	setNewPath: any
	title: string
}

export default function AppSidebar({ setNewPath, title }: AppSidebarProps) {
	return (
		<Sidebar className="dark:border-gray-600">
			<SidebarContent className="ctscroll">
				<SidebarGroup>
					<SidebarGroupLabel>
						<div
							onClick={() => setNewPath("")}
							className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-50"
						>
							<span className="text-base mt-1">{title}</span>
						</div>
					</SidebarGroupLabel>
					<SidebarGroupContent className="mt-2">
						<SidebarMenu>TEST</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	)
}
