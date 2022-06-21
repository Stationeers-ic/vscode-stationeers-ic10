import vscode, {CancellationToken, ProviderResult, SemanticTokens, TextDocument} from "vscode";

// import * as fs from "fs";

interface IParsedToken {
	line: number;
	startCharacter: number;
	length: number;
	tokenType: number;
	tokenModifier?:number
}

export const tokenTypes = new Map<string, number>();
export const tokenModifiers = new Map<string, number>();
export const legend = (function () {
	const tokenTypesLegend = [
		'parameter', 'keyword', 'enumMember',
		'property','function',
		'variable', 'label'
	];
	tokenTypesLegend.forEach((tokenType, index) => tokenTypes.set(tokenType, index));
	
	const tokenModifiersLegend = [
		'declaration', 'readonly'
	];
	tokenModifiersLegend.forEach((tokenModifier, index) => tokenModifiers.set(tokenModifier, index));
	
	return new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();

export class IcxSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
	
	provideDocumentSemanticTokens(document: TextDocument, token: CancellationToken): ProviderResult<SemanticTokens> {
		const allTokens = this._parseText(document.getText());
		const builder   = new vscode.SemanticTokensBuilder(legend);
		allTokens.forEach((token) => {
			builder.push(
				token.line, token.startCharacter, token.length,
				token.tokenType,
			);
		});
		return builder.build();
	}
	
	_parseText(text: string): IParsedToken[] {
		try {
			let r: IParsedToken[] = [];
			const lines           = text.split(/\r\n|\r|\n/);
			const vars: string[]  = [];
			const keywords: string[] = [];
			const constants: string[] = [];

			lines.forEach((line) => {
				let match;
				try {
					let re = /\b(var|alias)\s+([\w\d]+).*/;
					if (re.test(line)) {
						match = re.exec(line);
						vars.push(match[2])
					}
					re = /\b(const|define)\s+([\w\d]+).*/;
					if (re.test(line)) {
						match = re.exec(line);
						constants.push(match[2])
					}
					re = /([\w\d]+):/;
					if (re.test(line)) {
						match = re.exec(line);
						keywords.push(match[1])
					}
				} catch (e) {
				}
			})
			
			lines.forEach((line, index) => {
				try {
					for (let value of vars) {
						r = this.pushToken(value, line, index, 0,null, r)
					}
					for (let value of keywords) {
						r = this.pushToken(value, line, index, 1,null, r)
					}
					for (let value of constants) {
						r = this.pushToken(value, line, index, 2,1, r)
					}
				} catch (e) {
				}
			})
			return r;
		} catch (e) {
		}
		return [];
	}
	
	pushToken(search, line, index, tokenType,tokenModifier, out:IParsedToken[]) {
		const find = new RegExp('\\b' + search + '\\b', 'y');
		try {
			for (let i = 0; i < line.length; i++) {
				if (line[i] == '#') {
					break;
				}
				find.lastIndex = i
				const match    = find.exec(line);
				if (match && match[0] == search) {
					const a: IParsedToken = {
						line          : index,
						startCharacter: match.index,
						length        : search.length,
						tokenType     : tokenType,
					};
					if(tokenModifier !== null){
						a.tokenModifier = tokenModifier
					}
					out.push(a);
				}
			}
		} catch (e) {
		}
		return out
	}
	
}
