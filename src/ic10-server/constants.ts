import { Color } from "vscode-languageserver"

export const TokenTypes = {
	variable: "variable",
	function: "function",
	method: "method",
	constant: "constant",
	decorator: "decorator",
	parameter: "parameter",
	property: "property",
	string: "string",
	label: "label",
	macro: "macro",
	operator: "operator",
	keyword: "keyword",
	type: "type",
	enum: "enum",
	enumMember: "enumMember",
} as const
export const TokenModifiers = {
	declaration: "declaration",
	readonly: "readonly",
	deprecated: "deprecated",
	static: "static",
	defaultLibrary: "defaultLibrary",
	modification: "modification",
} as const

export type TokenTypes = (typeof TokenTypes)[keyof typeof TokenTypes]
export type TokenModifiers = (typeof TokenModifiers)[keyof typeof TokenModifiers]

export const Colors = {
	"Color.Blue": {
		red: 0.129411772,
		green: 0.164705887,
		blue: 0.647058845,
		alpha: 1,
	},
	"Color.Gray": {
		red: 0.482352942,
		green: 0.482352942,
		blue: 0.482352942,
		alpha: 1,
	},
	"Color.Green": {
		red: 0.247058824,
		green: 0.607843161,
		blue: 0.223529413,
		alpha: 1,
	},
	"Color.Orange": {
		red: 1,
		green: 0.4,
		blue: 0.168627456,
		alpha: 1,
	},
	"Color.Red": {
		red: 0.905882359,
		green: 0.007843138,
		blue: 0,
		alpha: 1,
	},
	"Color.Yellow": {
		red: 1,
		green: 0.7372549,
		blue: 0.105882354,
		alpha: 1,
	},
	"Color.White": {
		red: 0.905882359,
		green: 0.905882359,
		blue: 0.905882359,
		alpha: 1,
	},
	"Color.Black": {
		red: 0.03137255,
		green: 0.03529412,
		blue: 0.03137255,
		alpha: 1,
	},
	"Color.Brown": {
		red: 0.3882353,
		green: 0.235294119,
		blue: 0.168627456,
		alpha: 1,
	},
	"Color.Khaki": {
		red: 0.3882353,
		green: 0.3882353,
		blue: 0.247058824,
		alpha: 1,
	},
	"Color.Pink": {
		red: 0.894117653,
		green: 0.109803922,
		blue: 0.6,
		alpha: 1,
	},
	"Color.Purple": {
		red: 0.4509804,
		green: 0.172549024,
		blue: 0.654902,
		alpha: 1,
	},
} as const
