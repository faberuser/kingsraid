import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserRound, Amphora, ShieldHalf, ArrowRight, Zap, Calculator } from "lucide-react"

const features = [
	{
		title: "Heroes",
		description: "Discover heroes, skills, gears, and costumes.",
		icon: UserRound,
		href: "/heroes",
		color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
	},
	{
		title: "Artifacts",
		description: "Browse through artifacts' effects/synergies.",
		icon: Amphora,
		href: "/artifacts",
		color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
	},
	{
		title: "Bosses",
		description: "Study boss skills, mechanics and strategies.",
		icon: ShieldHalf,
		href: "/bosses",
		color: "bg-red-500/10 text-red-600 dark:text-red-400",
	},
	{
		title: "Technomagic Gear",
		description: "Explore technomagic gear and their effects.",
		icon: Zap,
		href: "/technomagic-gear",
		color: "bg-green-500/10 text-green-600 dark:text-green-400",
	},
	{
		title: "Softcap",
		description: "Calculate actual stats after softcap adjustments.",
		icon: Calculator,
		href: "/softcap",
		color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
	},
]

export default function Home() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-black dark:to-gray-900">
			<div className="container mx-auto px-6 py-8">
				{/* Hero Section */}
				<div className="text-center mb-12">
					<div className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-[normal]">
						King's Raid Info
					</div>
					<div className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Comprehensive resource for Kings Raid heroes, artifacts, boss.
					</div>
				</div>

				{/* Features Grid */}
				<div className="flex flex-wrap justify-center gap-6">
					{features.map((feature) => (
						<Card
							key={feature.title}
							className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 w-full md:w-80"
						>
							<CardHeader className="pb-4">
								<div
									className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}
								>
									<feature.icon className="w-6 h-6" />
								</div>
								<CardTitle className="text-xl">{feature.title}</CardTitle>
								<CardDescription className="text-sm">{feature.description}</CardDescription>
							</CardHeader>
							<CardContent className="pt-0">
								<Button asChild variant="outline" className="w-full">
									<Link href={feature.href} className="flex items-center justify-center gap-2">
										Explore {feature.title}
										<ArrowRight className="w-4 h-4" />
									</Link>
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	)
}
