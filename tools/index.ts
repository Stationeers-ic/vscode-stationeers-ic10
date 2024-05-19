import fs from "fs/promises"
import tmLanguage from "./../syntaxes/ic10.tmLanguage.json"

const functions: Record<string, { name: string; description: string; example: string }> = await (
	await fetch("https://assets.ic10.dev/languages/EN/instructions.json")
).json()
const logics: { data: { name: string; description: string }[] } = await (
	await fetch("https://assets.ic10.dev/languages/EN/logics.json")
).json()
const constant: Record<string, number> = await (await fetch("https://assets.ic10.dev/consts.json")).json()
const devices: { data: { PrefabName: string; PrefabHash: number }[] } = await (
	await fetch("https://assets.ic10.dev/languages/EN/devices.json")
).json()

await fs.writeFile("./src/data/functions.json", JSON.stringify(functions))
await fs.writeFile("./src/data/logics.json", JSON.stringify(logics))
await fs.writeFile("./src/data/constant.json", JSON.stringify(constant))
await fs.writeFile("./src/data/devices.json", JSON.stringify(devices))

const instructions: string[] = []
const logic: string[] = []
const snippets: Record<string, { prefix: string; body: string[]; description: string }> = {}
Object.entries(functions).forEach(([keu, element]) => {
	instructions.push(element.name)
	snippets[element.name] = {
		prefix: element.name,
		body: [element.name],
		description: element.description,
	}
})
logics.data.forEach((element) => {
	logic.push(element.name)
	snippets[element.name] = {
		prefix: element.name,
		body: [element.name],
		description: element.description,
	}
})
Object.keys(constant).forEach((element) => {
	snippets[element] = {
		prefix: element,
		body: [element],
		description: constant[element].toString(),
	}
})

devices.data.forEach((element) => {
	snippets[element.PrefabName] = {
		prefix: element.PrefabName,
		body: [`HASH("${element.PrefabName}")`],
		description: `Device: ${element.PrefabName}`,
	}
})

tmLanguage.repository.instructions.match = `\\b(?:${instructions.join("|")})\\b`
tmLanguage.repository.logic.match = `\\b(?:${logic.join("|")})\\b`
tmLanguage.repository.constant.match = `\\b(?:${Object.keys(constant).join("|")})\\b`

await fs.writeFile("./syntaxes/ic10.tmLanguage.json", JSON.stringify(tmLanguage, null, 2))

await fs.writeFile("./snippets/ic10.json", JSON.stringify(snippets, null, 2))
