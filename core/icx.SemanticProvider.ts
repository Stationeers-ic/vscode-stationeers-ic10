import vscode, {CancellationToken, ProviderResult, SemanticTokens, TextDocument} from "vscode";

// import * as fs from "fs";


interface IParsedToken {
	line: number;
	startCharacter: number;
	length: number;
	tokenType: number;
}

export const tokenTypes = new Map<string, number>();
export const tokenModifiers = new Map<string, number>();
export const legend = (function () {
	const tokenTypesLegend = [
		'parameter', 'keyword', 'number', 'function',
		'variable', 'property', 'label'
	];
	tokenTypesLegend.forEach((tokenType, index) => tokenTypes.set(tokenType, index));
	
	const tokenModifiersLegend = [
		'declaration', 'definition'
	];
	tokenModifiersLegend.forEach((tokenModifier, index) => tokenModifiers.set(tokenModifier, index));
	
	return new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();

export class IcxSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
	
	provideDocumentSemanticTokens(document: TextDocument, token: CancellationToken): ProviderResult<SemanticTokens> {
		var allTokens = this._parseText(document.getText());
		var builder = new vscode.SemanticTokensBuilder(legend);
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
			var r: IParsedToken[] = [];
			var lines = text.split(/\r\n|\r|\n/);
			var vars: string[] = [];
			var keywords: string[] = [];
			
			lines.forEach((line) => {
				try {
					var re = /\b(var|alias)\s+([\w\d]+).*/
					if (re.test(line)) {
						var match = re.exec(line)
						vars.push(match[2])
					}
					var re = /([\w\d]+):/
					if (re.test(line)) {
						var match = re.exec(line)
						keywords.push(match[1])
					}
				} catch (e) {
				}
			})
			
			lines.forEach((line, index) => {
				try {
					for (let value of vars) {
						r = this.pushToken(value, line, index, 0, r)
					}
					for (let value of keywords) {
						r = this.pushToken(value, line, index, 1, r)
					}
				} catch (e) {
				}
			})
			return r;
		} catch (e) {
		}
		return [];
	}
	
	pushToken(search, line, index, tokenType, out) {
		var find = new RegExp('\\b' + search + '\\b', 'y')
		try {
			for (let i = 0; i < line.length; i++) {
				if (line[i] == '#') {
					break;
				}
				find.lastIndex = i
				var match = find.exec(line)
				if (match && match[0] == search) {
					out.push({
						line: index,
						startCharacter: match.index,
						length: search.length,
						tokenType: tokenType,
					});
				}
			}
		} catch (e) {
		}
		return out
	}
	
}
