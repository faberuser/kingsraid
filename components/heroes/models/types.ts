import { ModelFile } from "@/model/Hero_Model"

export const weaponTypes = [
	"handle",
	"weapon",
	"weapon01",
	"weapon02",
	"weapon_blue",
	"weapon_red",
	"weapon_open",
	"weapon_close",
	"weapon_a",
	"weapon_b",
	"weapona",
	"weaponb",
	"weapon_r",
	"weapon_l",
	"weaponr",
	"weaponl",
	"weaponbottle",
	"weaponpen",
	"weaponscissors",
	"weaponskein",
	"shield",
	"sword",
	"lance",
	"gunblade",
	"axe",
	"arrow",
	"quiver",
	"sheath",
	"bag",
]

export interface ModelsProps {
	heroData: any
	heroModels: { [costume: string]: ModelFile[] }
	availableScenes?: Array<{ value: string; label: string }>
}

export interface ModelViewerProps {
	modelFiles: ModelFile[]
	availableAnimations: string[]
	selectedAnimation: string | null
	setSelectedAnimation: (s: string | null) => void
	isLoading: boolean
	setIsLoading: (loading: boolean) => void
	availableScenes?: Array<{ value: string; label: string }>
}

export const INITIAL_CAMERA_POSITION: [number, number, number] = [0, 1, 3]
export const INITIAL_CAMERA_TARGET: [number, number, number] = [0, 1, 0]
