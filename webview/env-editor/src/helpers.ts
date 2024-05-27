import { Connection } from "./types/devices"

export const grid = 20 as const
export const aside_node_height = 50 as const

export const matchColor = (type?: Connection | NormalConnection | null | undefined) => {
	if (!type) {
		return "var(--vscode-editorLineNumber-foreground)"
	}
	const n = normalizeConnection(type)
	switch (n) {
		case "port":
		case "data":
		case "power_data":
			return "var(--vscode-charts-green)"
		case "power":
			return "var(--vscode-charts-red)"
		case "liquid":
			return "var(--vscode-charts-blue)"
		case "gas":
			return "var(--vscode-charts-purple)"
		case "waste":
			return "var(--vscode-charts-orange)"
		case "item":
			return "var(--vscode-charts-yellow)"
	}
	if (type && type.startsWith("port")) {
		return "var(--vscode-charts-green)"
	}
	return "var(--vscode-editorLineNumber-foreground)"
}

export type HandleId = `${number}-${NormalConnection}-${Connection}`

export type NormalConnection =
	| "port"
	| "power"
	| "data"
	| "item"
	| "liquid"
	| "gas"
	| "waste"
	| "power_data"
	| "Landing"
	| "unknown"

export const normalizeConnection = (type: string): NormalConnection => {
	if (type.startsWith("port")) {
		return "port"
	}
	switch (type) {
		case "Connection":
		case "Power And Data Output":
		case "Power And Data Input":
		case "power_data":
			return "power_data"
		case "Data Input":
		case "Data Output":
		case "data":
			return "data"
		case "Power Input":
		case "Power Output":
		case "power":
			return "power"
		case "Pipe Liquid Output":
		case "Pipe Liquid Input":
		case "Pipe Liquid Output2":
		case "Pipe Liquid Input2":
		case "liquid":
			return "liquid"
		case "Pipe Output":
		case "Pipe Input":
		case "Pipe Output2":
		case "Pipe Input2":
		case "gas":
			return "gas"
		case "Pipe Waste":
		case "waste":
			return "waste"
		case "Chute Output":
		case "Chute Output2":
		case "Chute Input":
		case "item":
			return "item"
		case "Landing Pad Input":
		case "Landing":
			return "Landing"
	}
	return "unknown"
}

export const getHandleId = (type: Connection, normal?: NormalConnection, portId?: number): HandleId => {
	const n = normal ?? normalizeConnection(type)
	return `${portId ?? 0}-${n}-${type}` as HandleId
}
export const parseHandleId = (
	id: any,
): {
	port: number
	type: Connection
	normal: NormalConnection
} => {
	if (!id) {
		throw new Error("Invalid id")
	}
	const [port, normal, type] = id.split("-") as [string, NormalConnection, Connection]
	return {
		port: parseInt(port),
		type,
		normal,
	}
}

export function uuid() {
	return "xxxxxx".replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0,
			v = c === "x" ? r : (r & 0x3) | 0x8
		return v.toString(16)
	})
}
