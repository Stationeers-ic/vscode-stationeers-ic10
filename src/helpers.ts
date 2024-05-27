import type { Color, Position, Range } from "vscode-languageserver/node"

export function format(text: string): string {
	return text
		.replaceAll(/(?<!^)(?<![ \t])[ \t]+/gm, " ")
		.replaceAll(/[ \t]$/g, "\n\n")
		.replaceAll(/\n{2,}/g, "\n".repeat(2))
}
export function splitWords(line: string): { word: string; start: number }[] {
	const words = []
	let word = ""
	let i
	for (i = 0; i < line.length; i++) {
		if (isSingleWhitespace(line[i])) {
			words.push({
				word,
				start: i - word.length,
			})
			word = ""
		} else {
			word += line[i].toString()
		}
	}
	words.push({
		word,
		start: i - word.length,
	})
	return words
}
export function findSimilarColor(color: Color, colors: Record<string, Color>): string {
	let min = Infinity
	let minColor = ""
	Object.entries(colors).forEach(([key, value]) => {
		const diff = Math.abs(color.red - value.red) + Math.abs(color.green - value.green) + Math.abs(color.blue - value.blue)
		if (diff < min) {
			min = diff
			minColor = key
		}
	})
	return minColor
}
export function getWordFromPosition(position: Position, text: string): [string, Range] {
	const line = text.split("\n")[position.line]
	let forwardChar: string | null = null
	let backwardChar: string | null = null
	let limit = 90
	let a = position.character
	let b = position.character
	while (!isSingleWhitespace(forwardChar) && !isSingleWhitespace(backwardChar) && limit-- > 0) {
		if (!isSingleWhitespace(line[b])) {
			forwardChar = line[b++]
		}
		if (!isSingleWhitespace(line[a])) {
			if (a <= 0) {
				a = 0
				backwardChar = null
				continue
			}
			backwardChar = line[a--]
		}
	}
	if (a < 0) a = 0
	if (b > line.length) b = line.length

	return [
		line.slice(a, b).trim(),
		{
			start: { line: position.line, character: a },
			end: { line: position.line, character: b },
		},
	]
}
export function isSingleWhitespace(char: string | null): char is " " | "\t" | "\n" | "\r" | "\f" | "\v" {
	if (typeof char !== "string") return false
	return char.length === 1 && char.trim() === ""
}
export function isIn<T extends Record<string, any>>(str: any, obj: T): str is keyof T {
	return str in obj
}
export function getNonce() {
	let text = ""
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length))
	}
	return text
}
