"use strict"
import * as vscode from "vscode"
import {Hover} from "vscode"
import {Ic10Vscode} from "./ic10-vscode"
import path from "path"
import {ic10Formatter} from "./ic10.formatter"
import {IcxSemanticTokensProvider, legend} from "./icX.SemanticProvider"
import {Ic10SidebarViewProvider} from "./sidebarView"
import {ic10Diagnostics} from "./ic10.diagnostics"
import {icX} from "icx-compiler"
import {icXDiagnostics} from "./icX.diagnostics"
import {icXFormatter} from "./icX.formatter"
import {Err, Errors} from "icx-compiler/src/err"
import {IcXVscode} from "./icX-vscode"
import InterpreterIc10 from "ic10"
import {Ic10Error} from "ic10/src/Ic10Error"


const LOCALE_KEY: string = vscode.env.language
const ic10_hover = new Ic10Vscode()
const icX_hover = new IcXVscode()
export const LANG_KEY = "ic10"
export const LANG_KEY2 = "icX"
const interpreterIc10 = new InterpreterIc10(null)
let interpreterIc10State = 0
let leftCodeLength: vscode.StatusBarItem
export var icSidebar: Ic10SidebarViewProvider
const onChangeCallbacks: {
    ChangeActiveTextEditor: Array<Function>
    ChangeTextEditorSelection: Array<Function>
    SaveTextDocument: Array<Function>
} = {
    ChangeActiveTextEditor: [],
    ChangeTextEditorSelection: [],
    SaveTextDocument: []
}
export const icxOptions: {
    comments: boolean
    aliases: boolean
    loop: boolean
    constants: boolean
} = {
    comments: false,
    aliases: false,
    loop: false,
    constants: false,
}

export function activate(ctx: vscode.ExtensionContext) {
    // console.info('activate 1c10')
    view(ctx)
    //-------------
    formatter(ctx)
    command(ctx)
    semantic(ctx)
    statusBar(ctx)
    diagnostic(ctx)
    hover(ctx)
    icxStart()
    //-------------
    onChange(ctx)
}

function icxStart() {
    onChangeCallbacks.SaveTextDocument.push(() => {
        // console.log('onSaveTextDocument')
        if (vscode.window.activeTextEditor.document.languageId == LANG_KEY2) {
            vscode.commands.executeCommand(LANG_KEY2 + ".compile")
        }
    })
}

function hover(ctx: vscode.ExtensionContext) {
    // console.time('hover')
    try {
        ctx.subscriptions.push(vscode.languages.registerHoverProvider(LANG_KEY, {
            provideHover(document, position) {
                const word = document.getWordRangeAtPosition(position)
                const text = document.getText(word)
                return new Hover(ic10_hover.getHover(text))
            }
        }))
        ctx.subscriptions.push(vscode.languages.registerHoverProvider(LANG_KEY2, {
            provideHover(document, position) {
                const word = document.getWordRangeAtPosition(position)
                const text = document.getText(word)
                return new Hover(icX_hover.getHover(text))
            }
        }))
    } catch (e) {
        // console.error(e)
    }
    // console.timeEnd('hover')
}

function formatter(ctx: vscode.ExtensionContext) {
    // console.time('formatter')
    try {
        function replaceTextInDocument(newText: string, document: vscode.TextDocument) {
            const firstLine = document.lineAt(0)
            const lastLine = document.lineAt(document.lineCount - 1)
            const range = new vscode.Range(
                0,
                firstLine.range.start.character,
                document.lineCount - 1,
                lastLine.range.end.character
            )
            return vscode.TextEdit.replace(range, newText)
        }

        try {

            vscode.languages.registerDocumentFormattingEditProvider(LANG_KEY, {
                provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
                    try {
                        const formatter = new ic10Formatter(document)
                        return [replaceTextInDocument(formatter.resultText, document)]
                    } catch (e) {

                    }
                }
            })
        } catch (e) {
            // console.error(e)
        }
        try {
            vscode.languages.registerDocumentFormattingEditProvider(LANG_KEY2, {
                provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
                    try {
                        const formatter = new icXFormatter(document, icxOptions)
                        return [replaceTextInDocument(formatter.resultText, document)]
                    } catch (e) {

                    }
                }
            })
        } catch (e) {
            // console.error(e)
        }
    } catch (e) {
        // console.error(e)
    }
    // console.timeEnd('formatter')
}

function command(ctx: vscode.ExtensionContext) {
    // console.time('command')
    try {
        ctx.subscriptions.push(vscode.commands.registerCommand(LANG_KEY + ".run", () => {
            if (!interpreterIc10State) {
                vscode.window.showInformationMessage("Running")
                const code = vscode.window.activeTextEditor.document.getText()
                const title = path.basename(vscode.window.activeTextEditor.document.fileName)
                interpreterIc10State = 1
                const panel = vscode.window.createWebviewPanel(
                    "ic10.debug", // Identifies the type of the webview. Used internally
                    `${title}-Debug`, // Title of the panel displayed to the user
                    vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
                )
                const settings = {
                    debug: true,
                    tickTime: 500,
                    debugCallback: function () {
                        panel.webview.html += ic10_hover.htmlLog(...arguments) + "<br>"
                    },
                    logCallback: function () {
                        panel.webview.html += ic10_hover.htmlLog(...arguments) + "<br>"
                    },
                    executionCallback: function (e: Ic10Error) {
                        panel.webview.html += ic10_hover.htmlLog(...arguments) + "<br>"
                    },
                }
                interpreterIc10.setSettings(settings).init(code).run()
            }
        }))
        ctx.subscriptions.push(vscode.commands.registerCommand(LANG_KEY + ".stop", () => {
            if (interpreterIc10State) {
                vscode.window.showInformationMessage("Stop")
                interpreterIc10.stop()
            }
        }))
        ctx.subscriptions.push(vscode.commands.registerCommand(LANG_KEY + ".debug.variables.write", (variable) => {
            const ds = vscode.debug.activeDebugSession
            const input = vscode.window.createInputBox()
            input.title = "set " + variable.variable.name
            input.show()
            input.onDidAccept(function () {
                ds.customRequest("ic10.debug.variables.write", {variable: variable, value: input.value})
                input.hide()
            })
        }))
        ctx.subscriptions.push(vscode.commands.registerCommand(LANG_KEY + ".debug.device.write", (variable) => {
            const ds = vscode.debug.activeDebugSession
            const input = vscode.window.createInputBox()
            input.title = "set " + variable.variable.name
            input.show()
            input.onDidAccept(function () {
                ds.customRequest("ic10.debug.device.write", {variable: variable, value: input.value})
                input.hide()
            })
        }))
        ctx.subscriptions.push(vscode.commands.registerCommand(LANG_KEY + ".debug.device.slot.write", (variable) => {
            const ds = vscode.debug.activeDebugSession
            const input = vscode.window.createInputBox()
            input.title = "set " + variable.variable.name
            input.show()
            input.onDidAccept(function () {
                ds.customRequest("ic10.debug.device.slot.write", {variable: variable, value: input.value})
                input.hide()
            })
        }))
        ctx.subscriptions.push(vscode.commands.registerCommand(LANG_KEY + ".debug.stack.push", (variable) => {
            const ds = vscode.debug.activeDebugSession
            const input = vscode.window.createInputBox()
            input.title = "set " + variable.variable.name
            input.show()
            input.onDidAccept(function () {
                ds.customRequest("ic10.debug.stack.push", {variable: variable, value: input.value})
                input.hide()
            })
        }))
        ctx.subscriptions.push(vscode.commands.registerCommand(LANG_KEY + ".debug.remove.push", (variable) => {
            const ds = vscode.debug.activeDebugSession
            const input = vscode.window.createInputBox()
            input.title = "set " + variable.variable.name
            input.show()
            input.onDidAccept(function () {
                ds.customRequest("ic10.debug.remove.push", {variable: variable, value: input.value})
                input.hide()
            })
        }))
        ctx.subscriptions.push(vscode.commands.registerCommand(LANG_KEY2 + ".compile", () => {
            try {
                const code = vscode.window.activeTextEditor.document.getText()
                const title = path.basename(vscode.window.activeTextEditor.document.fileName).split(".")[0]
                // @ts-ignore
                const dir = path.dirname(vscode.window.activeTextEditor.document.uri._formatted)
                console.log(icxOptions)
                const icx = new icX(code, icxOptions)
                const compiled = icx.getCompiled()
                console.log(compiled)
                if (compiled) {
                    // console.log(compiled)
                    const content = Buffer.from(compiled)
                    const file = dir + "/" + title + ".ic10"
                    vscode.workspace.fs.writeFile(vscode.Uri.parse(file), content)// console.log('file', file)
                }
            } catch (e) {
                if (e instanceof Errors || e instanceof Err) {
                    vscode.window.showInformationMessage("compiling error: " + e.getUserMessage())
                } else {
                    vscode.window.showInformationMessage("compiling error", JSON.stringify(e))
                }
                console.error(e)
            }
        }))
        ctx.subscriptions.push(vscode.commands.registerCommand(LANG_KEY2 + ".open.wiki", () => {
            const panel = vscode.window.createWebviewPanel(
                "icX.wiki", // Identifies the type of the webview. Used internally
                `wiki`, // Title of the panel displayed to the user
                vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
            )
            const _disposables: vscode.Disposable[] = []
            // Listen for when the panel is disposed
            // This happens when the user closes the panel or when the panel is closed programmatically
            panel.onDidDispose(() => this.dispose(), null, _disposables)

            // Update the content based on view changes
            panel.onDidChangeViewState(
                e => {
                    if (panel.visible) {
                        this._update()
                    }
                },
                null,
                _disposables
            )

            // Handle messages from the webview
            panel.webview.onDidReceiveMessage(
                message => {
                    switch (message.command) {
                        case "alert":
                            vscode.window.showErrorMessage(message.text)
                            return
                    }
                },
                null,
                _disposables
            )

            panel.webview.html = "TEST"
        }))
    } catch (e) {
        console.error(e)
    }
    // console.timeEnd('command')

}

function semantic(ctx: vscode.ExtensionContext) {
    // console.time('semantic')
    try {
        ctx.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider(
                {language: LANG_KEY, scheme: "file"},
                new IcxSemanticTokensProvider,
                legend
            )
        )
        ctx.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider(
                {language: LANG_KEY2, scheme: "file"},
                new IcxSemanticTokensProvider,
                legend
            )
        )
    } catch (e) {
        // console.error(e)
    }
    // console.timeEnd('semantic')
}

function view(ctx: vscode.ExtensionContext) {
    console.time("view")
    try {
        icSidebar = new Ic10SidebarViewProvider(ctx.extensionUri)
        ctx.subscriptions.push(vscode.window.registerWebviewViewProvider(Ic10SidebarViewProvider.viewType, icSidebar))
        onChangeCallbacks.ChangeTextEditorSelection.push(() => {
            renderIc10()
        })
        onChangeCallbacks.ChangeTextEditorSelection.push(() => {
            renderIcX()
        })
        onChangeCallbacks.ChangeActiveTextEditor.push(() => {
            icSidebar.clear()
            renderIcX()
            renderIc10()
        })
        renderIcX()
        renderIc10()
        icSidebar.start()
    } catch (e) {
        console.error(e)
    }
    console.timeEnd("view")
}

function statusBar(ctx: vscode.ExtensionContext) {
    // console.time('statusBar')
    try {
        leftCodeLength = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100)
        ctx.subscriptions.push(leftCodeLength)
        onChangeCallbacks.ChangeTextEditorSelection.push(() => {
            updateStatusBarItem()
        })
        updateStatusBarItem()

        function updateStatusBarItem(): void {
            const n = getNumberLeftLines()
            if (n) {
                if (LOCALE_KEY == "ru2") {
                    leftCodeLength.text =
                        `осталось ${n[0]} ${n[1]} строк`

                } else {
                    leftCodeLength.text =
                        `${n[0]}${n[1]} line(s) left`

                }
                leftCodeLength.show()
            } else {
                leftCodeLength.hide()
            }
        }


    } catch (e) {
        // console.error(e)
    }
    // console.timeEnd('statusBar')
}

function ChangeActiveTextEditor(editor): void {
    if (vscode.window.activeTextEditor.document.languageId == LANG_KEY || vscode.window.activeTextEditor.document.languageId == LANG_KEY2) {
        onChangeCallbacks.ChangeActiveTextEditor.forEach((e) => {
            e.call(null, editor)
        })
    }
}

function ChangeTextEditorSelection(editor): void {
    if (vscode.window.activeTextEditor.document.languageId == LANG_KEY || vscode.window.activeTextEditor.document.languageId == LANG_KEY2) {

        onChangeCallbacks.ChangeTextEditorSelection.forEach((e) => {
            e.call(null, editor)
        })
    }
}

function SaveTextDocument(): void {
    if (vscode.window.activeTextEditor.document.languageId == LANG_KEY || vscode.window.activeTextEditor.document.languageId == LANG_KEY2) {
        onChangeCallbacks.SaveTextDocument.forEach((e) => {
            e.call(null)
        })
    }
}

function onChange(ctx) {
    ctx.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(ChangeActiveTextEditor))
    ctx.subscriptions.push(vscode.workspace.onDidSaveTextDocument(SaveTextDocument))
    ctx.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(ChangeTextEditorSelection))
}

function getNumberLeftLines(): Array<any> | false {
    const text = vscode.window.activeTextEditor.document.getText()
    if (vscode.window.activeTextEditor.document.languageId == LANG_KEY) {
        let left = 128
        const a = " ▁▃▅▉"
        if (text) {
            left = left - text.split("\n").length
        }
        const x = a[Math.ceil(left / 32)] ?? ""
        return [x, left]
    } else {
        return false
    }
}

function diagnostic(context) {
    // console.time('diagnostic')

    try {
        const ic10DiagnosticsCollection = vscode.languages.createDiagnosticCollection("ic10")
        const icXDiagnosticsCollection = vscode.languages.createDiagnosticCollection("icX")
        context.subscriptions.push(ic10DiagnosticsCollection)
        context.subscriptions.push(icXDiagnosticsCollection)

        onChangeCallbacks.ChangeTextEditorSelection.push(() => {
            if (vscode.window.activeTextEditor.document.languageId == LANG_KEY) {
                ic10Diagnostics.run(vscode.window.activeTextEditor.document, ic10DiagnosticsCollection)
                icXDiagnostics.clear(vscode.window.activeTextEditor.document, icXDiagnosticsCollection)
            } else {
                ic10Diagnostics.clear(vscode.window.activeTextEditor.document, ic10DiagnosticsCollection)
            }
            if (vscode.window.activeTextEditor.document.languageId == LANG_KEY2) {
                icXDiagnostics.run(vscode.window.activeTextEditor.document, icXDiagnosticsCollection)
                ic10Diagnostics.clear(vscode.window.activeTextEditor.document, ic10DiagnosticsCollection)
            } else {
                icXDiagnostics.clear(vscode.window.activeTextEditor.document, icXDiagnosticsCollection)
            }
        })
        onChangeCallbacks.ChangeActiveTextEditor.push(() => {
            if (vscode.window.activeTextEditor.document.languageId == LANG_KEY2) {
                icXDiagnostics.run(vscode.window.activeTextEditor.document, icXDiagnosticsCollection)
                ic10Diagnostics.clear(vscode.window.activeTextEditor.document, ic10DiagnosticsCollection)
            } else {
                icXDiagnostics.clear(vscode.window.activeTextEditor.document, icXDiagnosticsCollection)
            }
            if (vscode.window.activeTextEditor.document.languageId == LANG_KEY) {
                ic10Diagnostics.run(vscode.window.activeTextEditor.document, ic10DiagnosticsCollection)
                icXDiagnostics.clear(vscode.window.activeTextEditor.document, icXDiagnosticsCollection)
            } else {
                ic10Diagnostics.clear(vscode.window.activeTextEditor.document, ic10DiagnosticsCollection)
            }
        })
    } catch (e) {
        // console.error(e)
    }
    // console.timeEnd('diagnostic')
}

export function deactivate() {
    // console.info('deactivate 1c10')
}

function renderIcX() {
    icSidebar.section("settings", `
					<form name="settings" id="form-settings">
						<fieldset title="Settings">
							<ul>
								<ol>
									<input type="checkbox" data-fn="icxComments" name="comments" id="comments">
									<label for="comments" class="disabledSelect">Enable comments</label>
								</ol>
								<ol>
									<input type="checkbox" data-fn="icxAliases" name="aliases" id="aliases">
									<label for="aliases" class="disabledSelect">Enable aliases</label>
								</ol>
								<ol>
									<input type="checkbox" data-fn="icxLoop" name="loop" id="loop">
									<label for="loop" class="disabledSelect">use loop</label>
								</ol>
								<ol>
									<input type="checkbox" data-fn="icxConstants" name="constants" id="constants">
									<label for="constants" class="disabledSelect">use constants</label>
								</ol>
							 </ul>
						</fieldset>
					</form>
				`, LANG_KEY2)

    icSidebar.events.icxComments = (data) => {
        icxOptions.comments = Boolean(data.value)
    }
    icSidebar.events.icxAliases = (data) => {
        icxOptions.aliases = Boolean(data.value)
    }
    icSidebar.events.icxLoop = (data) => {
        icxOptions.loop = Boolean(data.value)
    }
    icSidebar.events.icxConstants = (data) => {
        icxOptions.constants = Boolean(data.value)
    }
}

function renderIc10() {
    const a = getNumberLeftLines()
    if (a) {
        const b = Math.abs(a[1] - 128)
        const p = b / 128 * 100
        icSidebar.section("leftLineCounter", `
					<p>Left lines ${a[1]}</p>
					<div id="leftLineCounter" class="progress" data-percent="${p}" data-value="${b}"  data-max="128" data-min="0">
					  <div></div>
					</div>
					`, LANG_KEY, -10)
    } else {
        icSidebar.section("leftLineCounter", ``, -10)
    }
}
