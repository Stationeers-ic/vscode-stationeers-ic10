import * as vscode                                   from "vscode";
import {DiagnosticsError, errorMsg, Ic10Diagnostics} from "./ic10.diagnostics";
import {icX}                                         from "icx-compiler";
import {icSidebar, icxOptions, LANG_KEY2}            from "./main";
import {Err, Errors}                                 from "icx-compiler/src/err";

const manual: {
	"type": string,
	"op1": string | null,
	"op2": string | null,
	"op3": string | null,
	"op4": string | null,
	"description": {
		"preview": string | null,
		"text": string | null
	}
}[]                       = require('../languages/en.json');
const functions: string[] = require('../media/ic10.functions.json');
require('../media/ic10.keyword.json');
export const IcXDiagnosticsName = 'icX_diagnostic';


class IcXDiagnostics extends Ic10Diagnostics {
	private InFunction: number | false = false;
	private blockCount: number         = 0;
	private endCount: number           = 0;

	constructor() {
		super()
	}

	prepare(doc: vscode.TextDocument) {
		this.jumps   = [];
		this.aliases = [];
		this.errors.reset()
		this.blockCount = 0
		this.endCount   = 0
		this.InFunction = false
		for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
			try {
				this.parseLine(doc, lineIndex)
				const text = doc.lineAt(lineIndex).text
				if (text.trim() === "end") {
					this.endCount++
				}
			} catch (e) {
				console.warn(e)
			}
		}
		if (this.blockCount !== this.endCount) {
			this.errors.push(new DiagnosticsError(`some block is not closed. blockCount:${this.blockCount}, endCount:${this.endCount}`, 0, 0, 0, doc.lineCount))
		}
	}

	run(doc: vscode.TextDocument, container: vscode.DiagnosticCollection): void {
		const diagnostics: vscode.Diagnostic[] = [];
		const code                             = doc.getText();
		const compiler                         = new icX(code, icxOptions);
		// console.log(test)
		this.prepare(doc)
		const test = compiler.analyze();
		if (test.error instanceof Errors) {
			if (test.error.isError()) {
				for (const eKey in test.error.e) {
					const err = test.error.e[eKey];
					if (err instanceof Err) {
						const l = doc.lineAt(err.line);
						diagnostics.push(this.createDiagnostic(l.range, err.getUserMessage(), vscode.DiagnosticSeverity.Error))
					}
				}
			}
		}
		try {
			const linesCount = test.result.split('\n').length;
			if (linesCount > 128) {
				diagnostics.push(this.createDiagnostic(new vscode.Range(0, 0, 0, 1), 'Max line', vscode.DiagnosticSeverity.Error))
			}
			this.view(test, linesCount)
		} catch (e) {

		}
		for (const de of this.errors.values) {
			diagnostics.push(this.createDiagnostic(de.range, de.message, de.lvl))
		}
		container.set(doc.uri, diagnostics);
	}

	view(test, linesCount) {
		const b    = Math.abs(test.vars.empty.length - 15);
		const p    = b / 15 * 100;
		const b2   = Math.abs(linesCount - 128);
		const p2   = linesCount / 128 * 100;
		let errors = '<ul>'
		this.errors.values.forEach((item) => {
			errors += "<ol style=\"color:var(--vscode-editorError-foreground) !important;\">[" + item.line + "]: " + item.message + "</ol>"
		})
		let content = `
      <fieldset title="Stats">
							<ul>
								<ol>
									<span>vars:</span>
									<ol>
										<span>temp:</span>	<span>${test.vars.temps.length}</span>
									</ol>
									<ol>
										<span>aliases:</span>	<span>${test.vars.aliases.length}</span>
									</ol>
									<ol>
										<span>left vars:</span>	<span>${test.vars.empty.length}</span>
										<ol>
											<div id="leftVarsCounter" class="progress" data-percent="${p}" data-value="${b}"  data-max="15" data-min="0">
												<div></div>
											</div>
										</ol>	
									</ol>
								</ol>
								<ol>
								    <ol>
										<span>left ic10 lines:</span>	<span>${b2}</span>
										<ol>
											<div id="leftVarsCounter" class="progress" data-percent="${p2}" data-value="${b2}"  data-max="128" data-min="0">
												<div></div>
											</div>
										</ol>
									</ol>
								</ol>
							 </ul>
						</fieldset>
						<br>
					
    `
		if (this.errors.values.length > 0) {
			content += `
<fieldset title="errors">
	${errors}
</fieldset>`
		}
		icSidebar.section('icxStats', content, LANG_KEY2)
		let comments: any  = test.use.has('comments');
		let aliases: any   = test.use.has('aliases');
		let loop: any      = test.use.has('loop');
		let constants: any = test.use.has('constants');
		comments           = comments ? comments : icxOptions.comments
		aliases            = aliases ? aliases : icxOptions.aliases
		loop               = loop ? loop : icxOptions.loop
		constants          = constants ? constants : icxOptions.constants
		if (comments) {
			comments = 'checked';
		} else {
			comments = '';
		}
		if (aliases) {
			aliases = 'checked';
		} else {
			aliases = '';
		}
		if (loop) {
			loop = 'checked';
		} else {
			loop = '';
		}
		if (constants) {
			constants = 'checked';
		} else {
			constants = '';
		}
		icSidebar.section('settings', `
					<form name="settings" id="form-settings">
						<fieldset title="Settings">
							<ul>
								<ol>
									<input type="checkbox" data-fn="icxComments" ${comments} name="comments" id="comments">
									<label for="comments" class="disabledSelect">Enable comments</label>
								</ol>
								<ol>
									<input type="checkbox" data-fn="icxAliases" ${aliases} name="aliases" id="aliases">
									<label for="aliases" class="disabledSelect">Enable aliases</label>
								</ol>
								<ol>
									<input type="checkbox" data-fn="icxLoop" ${loop} name="loop" id="loop">
									<label for="loop" class="disabledSelect">use loop</label>
								</ol>
                                <ol>
									<input type="checkbox" data-fn="icxConstants" ${constants} name="constants" id="constants">
									<label for="constants" class="disabledSelect">use constants</label>
								</ol>
							 </ul>
						</fieldset>
					</form>
				`, LANG_KEY2)
	}

	parseLine(doc: vscode.TextDocument, lineIndex) {
		const lineOfText = doc.lineAt(lineIndex);
		if (lineOfText.text.trim().length > 0) {
			let text = lineOfText.text.trim();
			functions.some((substring) => {
				if (text.startsWith('#')) {
					if (text.startsWith('#log') || text.startsWith('debug')) {
						this.errors.push(new DiagnosticsError(`Debug function: "${text}"`, 2, 0, text.length, lineIndex))
						return true;
					}
					return true;
				}
				const words = text.split(/ +/);
				text        = text.replace(/#.+$/, '')
				text        = text.trim()
				if (text.endsWith(':')) {
					this.jumps.push(text)
					return true;
				}
				if (text.startsWith('alias')) {
					this.aliases.push(words[1])
				}
				if (text.startsWith('var')) {
					this.aliases.push(words[1])
				}
				if (text.startsWith('define')) {
					this.aliases.push(words[1])
				}
				if (text.startsWith('const')) {
					this.aliases.push(words[1])
				}
				if (text.startsWith("if")) {
					this.blockCount++
					this.analyzeIF(words, text, lineIndex)
					return true;
				}
				if (this.InFunction !== false) {
					if (text.startsWith("function") && this.InFunction !== lineIndex) {
						this.errors.push(new DiagnosticsError(`Do not create function in function`, 0, 0, text.length, lineIndex))
					}
					if (text.trim() === "end") {
						this.InFunction = false
					}
				} else {
					if (text.startsWith("function")) {
						this.blockCount++
						this.InFunction = lineIndex
					}
				}
				if (text.startsWith(substring)) {
					this.analyzeFunctionInputs(words, text, lineIndex)
					return true;
				}
				if (text.startsWith(substring)) {
					this.analyzeFunctionInputs(words, text, lineIndex)
				}
				return false
			}, this);
			this.aliases = [...new Set(this.aliases)];
		}
		//console.log(this.aliases)
	}

	analyzeFunctionInputs(words: string[], text: string, lineIndex: number): errorMsg | true {
		const fn  = words[0] ?? null;
		const op1 = words[1] ?? null;
		const op2 = words[2] ?? null;
		const op3 = words[3] ?? null;
		const op4 = words[4] ?? null;

		if (!manual.hasOwnProperty(fn)) {
			return true;
			//return {length: fn.length, msg: `Unknown function "${fn}"`, lvl: 0};
		} else {
			const rule = manual[fn];
			if (fn === 'return') {
				if (!this.InFunction) {
					this.errors.push(new DiagnosticsError(`"return" must be in function`, 0, 0, text.length, lineIndex))
				}
				return true;
			}
			if (rule.type == 'Function') {
				if (op1 !== null && this.empty(rule.op1)) {
					this.errors.push(new DiagnosticsError(`this function have\`t any Arguments: "${text}"`, 0, 0, text.length, lineIndex))
					return true;
				}
				if (!this.empty(op1) && !this.empty(rule.op1)) {
					this.parseOpRule(rule.op1, op1, text.indexOf(op1, fn.length), text, lineIndex)
				} else if (this.empty(op1) && !this.empty(rule.op1)) {
					this.errors.push(new DiagnosticsError(`missing first "Argument": "${text}"`, 0, 0, text.length, lineIndex))
				}
				if (!this.empty(op2) && !this.empty(rule.op2)) {
					this.parseOpRule(rule.op2, op2, text.indexOf(op2, fn.length + op1.length), text, lineIndex)
				} else if (this.empty(op2) && !this.empty(rule.op2)) {
					this.errors.push(new DiagnosticsError(`missing second "Argument": "${text}"`, 0, 0, text.length, lineIndex))
				}
				if (!this.empty(op3) && !this.empty(rule.op3)) {
					this.parseOpRule(rule.op3, op3, text.indexOf(op3, fn.length + op1.length + op2.length), text, lineIndex)
				} else if (this.empty(op3) && !this.empty(rule.op3)) {
					this.errors.push(new DiagnosticsError(`missing third "Argument": "${text}"`, 0, 0, text.length, lineIndex))
				}
				if (!this.empty(op4) && !this.empty(rule.op4)) {
					this.parseOpRule(rule.op4, op4, text.indexOf(op4, fn.length + op1.length + op2.length + op3.length), text, lineIndex)
				} else if (this.empty(op4) && !this.empty(rule.op4)) {
					this.errors.push(new DiagnosticsError(`missing fourth "Argument": "${text}"`, 0, 0, text.length, lineIndex))
				}
			} else {
				return true;
			}
		}
		return true;
	}

	analyzeIF(words: string[], text: string, lineIndex: number): errorMsg | true {
		if (text.includes("&")) {
			if (!text.includes("&&")) {
				this.errors.push(new DiagnosticsError(`Incorrect 'and'  operator "$" must be "&&"`, 0, 0, text.length, lineIndex))
			}
		}
		if (text.includes("|")) {
			if (!text.includes("||")) {
				this.errors.push(new DiagnosticsError(`Incorrect 'or'  operator "|" must be "||"`, 0, 0, text.length, lineIndex))
			}
		}
		if (text.includes("=")) {
			if (!text.includes("==") && !text.includes("~=") && !text.includes("!=") && !text.includes("<=") && !text.includes(">=")) {
				this.errors.push(new DiagnosticsError(`Incorrect operator must be "==" or "!=" or "~=" or ">=" or "<="`, 0, 0, text.length, lineIndex))
			}
		}
		return true;
	}

	createDiagnostic(range: vscode.Range, message: string, lvl: number): vscode.Diagnostic {

		// create range that represents, where in the document the word is
		const diagnostic = new vscode.Diagnostic(range, message,
												 lvl);
		diagnostic.code  = IcXDiagnosticsName;
		return diagnostic;
	}
}

export var icXDiagnostics = new IcXDiagnostics
