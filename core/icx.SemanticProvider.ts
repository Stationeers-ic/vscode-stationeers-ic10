import vscode, {CancellationToken, ProviderResult, SemanticTokens, TextDocument, workspace} from "vscode";
import * as fs from "fs";


interface IParsedToken {
	line: number;
	startCharacter: number;
	length: number;
	tokenType: string;
	tokenModifiers: string[];
}

export const tokenTypes = new Map<string, number>();
export const tokenModifiers = new Map<string, number>();
export const legend = (function () {
	const tokenTypesLegend = [
		'comment', 'keyword', 'number', 'function',
		'variable', 'parameter', 'property', 'label'
	];
	tokenTypesLegend.forEach((tokenType, index) => tokenTypes.set(tokenType, index));

	const tokenModifiersLegend = [
		'declaration',
	];
	tokenModifiersLegend.forEach((tokenModifier, index) => tokenModifiers.set(tokenModifier, index));

	return new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();

export class IcxSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {

	provideDocumentSemanticTokens(document: TextDocument, token: CancellationToken): ProviderResult<SemanticTokens> {
		const allTokens = IcxSemanticTokensProvider._parseText(document.getText());
		const builder = new vscode.SemanticTokensBuilder();
		fs.writeFileSync('C:\\OSPanel\\domains\\vscode-stationeers-ic10\\log\\allTokens.json', JSON.stringify(allTokens))

		allTokens.forEach((token) => {
			builder.push(
				new vscode.Range(new vscode.Position(token.line, token.startCharacter), new vscode.Position(token.line, token.length)),
				token.tokenType,
				token.tokenModifiers
			);
		});
		return builder.build();
	}

	private static _parseText(text: string): IParsedToken[] {
		const r: IParsedToken[] = [];
		const lines = text.split(/\r\n|\r|\n/);
		var vars: Set<string> = new Set();

		const re = /var\\s+([\\w\\d]+).+/
		lines.forEach((line, index) => {

			if (re.test(line)) {
				var match = re.exec(line)
				vars.add(match[1])
			}
		})

		lines.forEach((line, index) => {
			for (let value of vars) {
				var pos: number = 0
				var ranges = []
				var range: number = 0
				do {
					pos
					range = line.indexOf(value, pos)
					if (range >= 0) {
						ranges.push({x: range, y: value.length})
					}
					pos += value.length
				} while (range >= 0)
				for (let rrr of ranges) {
					r.push({
						line: index,
						startCharacter: rrr.x,
						length: rrr.y,
						tokenType: 'variable',
						tokenModifiers: ['declaration']
					});
				}
			}
		})
		fs.writeFileSync('C:\\OSPanel\\domains\\vscode-stationeers-ic10\\log\\test.json', JSON.stringify(r))
		return r;
	}
}