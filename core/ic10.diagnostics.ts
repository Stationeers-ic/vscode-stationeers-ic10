import * as vscode from "vscode";

export const Ic10DiagnosticsName = 'ic10_diagnostic';
var functions = require('../media/ic10.functions.json')

class DiagnosticsError {
	public range: vscode.Range
	public message: string
	public lvl: number
	
	constructor(message: string, lvl, start: number, length: number, line) {
		this.message = message
		this.lvl = lvl
		this.range = new vscode.Range(line, start, line, start + length)
	}
}

class Ic10Diagnostics {
	constructor() {
	
	}
	
	clear(doc: vscode.TextDocument, container: vscode.DiagnosticCollection) {
		container.set(doc.uri, []);
	}
	
	run(doc: vscode.TextDocument, container: vscode.DiagnosticCollection): void {
		const diagnostics: vscode.Diagnostic[] = [];
		for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
			
			console.log(lineIndex)
			try {
				this.parseLine(doc, lineIndex)
			} catch (e: DiagnosticsError | any) {
				if (e instanceof DiagnosticsError) {
					diagnostics.push(this.createDiagnostic(e.range, e.message, e.lvl))
				}
			}
		}
		if (doc.lineCount > 128) {
			
			diagnostics.push(this.createDiagnostic(new vscode.Range(128, 0, 128, 1), 'Max line', vscode.DiagnosticSeverity.Error))
		}
		container.set(doc.uri, diagnostics);
	}
	
	parseLine(doc: vscode.TextDocument, lineIndex) {
		const lineOfText = doc.lineAt(lineIndex);
		if (lineOfText.text.trim().length > 0) {
			var text = lineOfText.text.trim()
			console.log(functions)
			var test = functions.some((substring) => {
				if (text.startsWith('#')) {
					return true;
				}
				text = text.replace(/#.+$/, '')
				text = text.trim()
				if (text.endsWith(':')) {
					return true;
				}
				if (text.startsWith(substring)) {
					return true;
				} else {
					return false;
				}
			})
			if (!test) {
				throw new DiagnosticsError(`Unknown function "${text}"`, vscode.DiagnosticSeverity.Error, 0, text.length, lineIndex)
			}
		}
	}
	
	createDiagnostic(range: vscode.Range, message: string, lvl: number): vscode.Diagnostic {
		
		// create range that represents, where in the document the word is
		const diagnostic = new vscode.Diagnostic(range, message,
			lvl);
		diagnostic.code = Ic10DiagnosticsName;
		return diagnostic;
	}
	
}

export var ic10Diagnostics = new Ic10Diagnostics
