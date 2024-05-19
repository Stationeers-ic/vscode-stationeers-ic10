import { TextDocument } from "vscode-languageserver-textdocument"
import {
	ColorInformation,
	ColorPresentation,
	ColorPresentationParams,
	CompletionParams,
	Definition,
	DefinitionLink,
	DefinitionParams,
	Diagnostic,
	DiagnosticSeverity,
	DocumentDiagnosticReport,
	DocumentDiagnosticReportKind,
	DocumentFormattingParams,
	DocumentSymbol,
	Hover,
	HoverParams,
	MarkupKind,
	Range,
	RenameParams,
	SemanticTokens,
	SemanticTokensBuilder,
	TextEdit,
	WorkspaceEdit
} from "vscode-languageserver/node"
import { log } from "../devtools/log"

import { findErrorsInCode, instructions, LexerError } from "ic10"
import constant from "../data/constant.json"
import { findSimilarColor, format, getWordFromPosition, isIn, splitWords } from "../helpers"
import { Colors, TokenModifiers, TokenTypes } from "./constants"

export type Defines = {
	name: string
	line: number
	type: "const" | "var" | "label"
	value: string
}

export class Document {
	public diagnostic: Diagnostic[] = []
	public defines: Defines[] = []
	public text: string = ""
	// public env!: DevEnv<{}>
	// public ic10!: InterpreterIc10<DevEnv<{}>>
	public errors: Record<number, LexerError> = {}

	constructor(public textDocument: TextDocument) {
		this.reset()
	}

	public static __inits: Record<string, Document> = {}

	static init(textDocument?: TextDocument): Document | undefined {
		if (!textDocument) {
			return undefined
		}
		if (Document.__inits[textDocument.uri] !== undefined) {
			// log("return saved instance")
			Document.__inits[textDocument.uri].setTextDocument(textDocument)
		} else {
			log("create new instance")
			Document.__inits[textDocument.uri] = new Document(textDocument)
		}
		return Document.__inits[textDocument.uri]
	}

	setTextDocument(textDocument: TextDocument) {
		this.textDocument = textDocument
		this.reset()
	}

	reset() {
		this.diagnostic = []
		this.defines = []
		this.text = this.textDocument.getText()
		this.tokensBuilder = new SemanticTokensBuilder()
		// this.env = new DevEnv()
		// this.ic10 = new InterpreterIc10(this.env, this.text)
		this.parse()
	}

	parse() {
		this.text.split("\n").forEach((line, index) => {
			if (line.trim().startsWith("define")) {
				const [_, name, value] = line.split(" ")
				this.defines.push({
					name,
					line: index,
					type: "const",
					value,
				})
			}
			if (line.trim().startsWith("alias")) {
				const [_, name, value] = line.split(" ")
				this.defines.push({
					name,
					line: index,
					type: "var",
					value,
				})
			}
			if (line.trim().endsWith(":")) {
				const name = line.trim().slice(0, -1)
				this.defines.push({
					name,
					line: index,
					type: "label",
					value: index.toString(),
				})
			}
		})
	}

	async onHover(params: HoverParams): Promise<Hover | undefined> {
		let text: string[] = []
		const [word, range] = getWordFromPosition(params.position, this.text)
		if (!word) return undefined
		// log("Hover search", word, params.position, range)
		const define = this.defines.find((define) => {
			if (define.name.trim() == word.trim()) {
				return true
			}
			return false
		})
		if (define) {
			text.push(`${word} is a ${define.type} with value ${define.value}`)
		}
		if (isIn(word, instructions)) {
			text.push(instructions[word].description)
			text.push(instructions[word].example)
		}

		if (isIn(word, constant)) {
			text.push(`Constant ${word} with value ${constant[word]}`)
		}

		if (text.length === 0) {
			return undefined
		}
		log("Hover", word, text, range)
		return {
			contents: {
				kind: MarkupKind.Markdown,
				value: text.join("\n\n"),
			},
			range: range,
		} satisfies Hover
	}

	async onDocumentColor(): Promise<ColorInformation[]> {
		const colors: ColorInformation[] = []
		const text = this.textDocument.getText()
		let lastIndex = 0
		text.split("\n").forEach((line, index) => {
			Object.entries(Colors).forEach(([key, color]) => {
				const start = line.indexOf(key)
				if (start !== -1) {
					colors.push({
						color,
						range: {
							start: this.textDocument.positionAt(lastIndex + start),
							end: this.textDocument.positionAt(lastIndex + start + key.length),
						},
					})
				}
			})
			// +1 for the newline character
			lastIndex += line.length + 1
		})
		return colors
	}

	async onColorPresentation(params: ColorPresentationParams): Promise<ColorPresentation[]> {
		params.color
		const colors: ColorPresentation[] = []
		const key = findSimilarColor(params.color, Colors)
		const val = Object.entries(constant).find(([i]) => i === key)
		colors.push({
			label: key + ` [${val?.[1]}]`,
			textEdit: {
				range: params.range,
				newText: key,
			},
		})
		return colors
	}

	async diagnostics(): Promise<DocumentDiagnosticReport> {
		return {
			kind: DocumentDiagnosticReportKind.Full,
			items: await this.validateTextDocument(),
		} satisfies DocumentDiagnosticReport
	}
	public tokensBuilder!: SemanticTokensBuilder

	async semantic(): Promise<SemanticTokens> {
		const parseVars = (line: string, index: number) => {
			const words = splitWords(line)
			words.forEach((word) => {
				const define = this.defines.find((define) => {
					if (define.name.trim() == word.word.trim()) {
						return true
					}
					return false
				})
				if (define) {
					switch (define.type) {
						case "const":
							this.pushToken(
								index,
								word.start,
								define.name.length,
								TokenTypes.keyword,
								TokenModifiers.declaration,
							)
							break
						case "var":
							this.pushToken(
								index,
								word.start,
								define.name.length,
								TokenTypes.variable,
								TokenModifiers.declaration,
							)
							break
						case "label":
							this.pushToken(
								index,
								word.start,
								define.name.length,
								TokenTypes.type,
								TokenModifiers.declaration,
							)
							break
					}
				}
			})
		}
		const parseHash = (line: string, index: number) => {
			const start = line.indexOf('HASH("')
			if (start !== -1) {
				this.pushToken(index, start, 4, "keyword")
				this.pushToken(index, start + 4, 2, "operator")
				const end = line.indexOf('")', start + 6)
				if (end !== -1) {
					const str = line.slice(start + 6, end)
					this.pushToken(index, start + 6, str.length, "string")
					this.pushToken(index, end, 2, "operator")
				}
			}
		}
		const parseConst = (line: string, index: number) => {
			const words = splitWords(line)
			const cc = Object.keys(constant)
			words.forEach((word) => {
				const c = cc.find((con) => con == word.word.trim())
				if (c) {
					const ccc = c.split(".")
					if (ccc.length === 2) {
						this.pushToken(index, word.start, ccc[0].length, TokenTypes.enum, TokenModifiers.declaration)
						this.pushToken(
							index,
							word.start + ccc[0].length + 1,
							ccc[1].length,
							TokenTypes.enumMember,
							TokenModifiers.declaration,
						)
					} else {
						this.pushToken(
							index,
							word.start,
							word.word.length,
							TokenTypes.keyword,
							TokenModifiers.declaration,
						)
					}
				}
			})
		}

		this.text.split("\n").forEach((line, index) => {
			parseVars(line, index)
			parseConst(line, index)
			parseHash(line, index)
		})

		return this.tokensBuilder.build()
	}

	pushToken(
		line: number,
		char: number,
		length: number,
		tokenType: TokenTypes,
		tokenModifiers: TokenModifiers = TokenModifiers.declaration,
	) {
		this.tokensBuilder.push(
			line,
			char,
			length,
			Object.values(TokenTypes).indexOf(tokenType),
			Object.values(TokenModifiers).indexOf(tokenModifiers),
		)
	}

	async onCompletion(params: CompletionParams) {
		return undefined
		// return {
		// 	isIncomplete: false,
		// 	items: [
		// 		{
		// 			label: "Hello",
		// 			kind: 1,
		// 			detail: "Hello",
		// 			documentation: "Hello",
		// 		},
		// 	],
		// } satisfies CompletionList
	}

	async onDocumentSymbol() {
		// хлебные крошки
		const symbols: DocumentSymbol[] = []

		// symbols.push({
		// 	name: "test",
		// 	kind: SymbolKind.Variable,
		// 	range: {
		// 		start: this.textDocument.positionAt(6),
		// 		end: this.textDocument.positionAt(10),
		// 	},
		// 	selectionRange: {
		// 		start: this.textDocument.positionAt(6),
		// 		end: this.textDocument.positionAt(10),
		// 	},
		// })
		return symbols
	}

	async validateTextDocument(): Promise<Diagnostic[]> {
		const errors: LexerError[] = findErrorsInCode(this.text)
		errors.forEach((error) => {
			const range: Range = {
				start: {
					line: error.line.index,
					character: error.line.start,
				},
				end: {
					line: error.line.index,
					character: error.line.end,
				},
			}
			this.errors[error.line.index] = error
			let message = ""
			switch (error.type) {
				case "UNEXPECTED_TOKEN":
					if (error.expected === undefined) {
						message = `Unexpected token ${error.received}`
						break
					} else {
						if (error.expected.length > 1) {
							message = `Unexpected token ${error.received}, expected ${error.expected?.join(", ")}`
							break
						} else {
							message = `Unexpected token ${error.received}, expected ${error.expected[0]}`
							break
						}
					}
				case "MISSING_TOKEN":
					if (error.expected === undefined) {
						message = "Missing token"
						break
					}
					if (error.expected.length > 1) {
						message = `Missing tokens ${error.expected?.join(", ")}`
						break
					} else {
						message = `Missing token ${error.expected[0]}`
						break
					}
				case "UNRECOGNIZED_INSTRUCTION":
					const token = error.token?.value
					message = `Unrecognized instruction ${token}`
					break
			}
			if (error.suggested) {
				message += `, did you mean ${error.suggested}?`
			}
			this.error(range, message)
		})

		return this.diagnostic
	}

	async onDefinition(params: DefinitionParams): Promise<Definition | DefinitionLink[] | undefined> {
		const [word, pos] = getWordFromPosition(params.position, this.text)
		const define = this.defines.find((define) => define.name.trim() == word.trim())
		if (!define) {
			return undefined
		}
		return {
			uri: this.textDocument.uri,
			range: {
				start: {
					line: define.line,
					character: 0,
				},
				end: {
					line: define.line,
					character: 0,
				},
			},
		} satisfies Definition
	}

	async onDocumentFormatting(params: DocumentFormattingParams): Promise<TextEdit[] | null | undefined> {
		log("Formatting BEFORE", this.text.length)
		let text = format(this.text)
		log("Formatting AFTER", this.text.length)
		return [
			TextEdit.replace(
				{
					start: { line: 0, character: 0 },
					end: { line: this.textDocument.lineCount, character: 0 },
				},
				text,
			),
		]
	}

	async onRenameRequest(params: RenameParams): Promise<WorkspaceEdit | null | undefined> {
		await this.semantic()
		const [word, range] = getWordFromPosition(params.position, this.text)
		const fond = this.defines.find((o) => o.name === word)
		if (!fond) {
			return null
		}
		log("Rename", word, range, fond)
		const changes: Record<string, TextEdit[]> = {
			[this.textDocument.uri]: [],
		}
		this.text.split("\n").forEach((line, index) => {
			const words = splitWords(line)
			words.forEach((word) => {
				if (word.word === fond?.name && word.start > 0) {
					changes[this.textDocument.uri].push(
						TextEdit.replace(
							{
								start: { line: index, character: word.start },
								end: { line: index, character: word.start + word.word.length },
							},
							params.newName,
						),
					)
				}
			})
		})
		if (!changes[this.textDocument.uri].length) {
			return null
		}
		return {
			changes: changes,
		}
	}

	error(range: Range, message: string) {
		this.diagnostic.push({
			severity: DiagnosticSeverity.Error,
			range: range,
			message,
			source: "ic10",
		})
	}

	warning(range: Range, message: string) {
		this.diagnostic.push({
			severity: DiagnosticSeverity.Warning,
			range: range,
			message,
			source: "ic10",
		})
	}
}
