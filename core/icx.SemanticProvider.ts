import vscode, {CancellationToken, ProviderResult, SemanticTokens, TextDocument, workspace} from "vscode";

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

			var re = /\b(var|alias)\b\s+\b([\w\d]+)\b.+/
			lines.forEach((line) => {
				try {
					if (re.test(line)) {
						var match = re.exec(line)
						vars.push(match[2])
					}
				} catch (e) {
				}
			})

			lines.forEach((line, index) => {
				try {
					for (let value of vars) {
						var find = new RegExp(`\\b` + value + '\\b', 'y')

						try {
							for (let i = 0; i < line.length; i++) {
								find.lastIndex = i
								var match = find.exec(line)
								if (match && match[0] == value) {
									r.push({
										line: index,
										startCharacter: match.index,
										length: value.length,
										tokenType: 0,
									});
								}
							}
						} catch (e) {
						}
					}
				} catch (e) {
				}
			})
			return r;
		} catch (e) {
		}
		return [];
	}

}