"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = exports.icxOptions = exports.icSidebar = exports.LANG_ICX = exports.LANG_IC10 = void 0;
const vscode = __importStar(require("vscode"));
const vscode_1 = require("vscode");
const ic10_vscode_1 = require("./ic10-vscode");
const path_1 = __importDefault(require("path"));
const ic10_formatter_1 = require("./ic10.formatter");
const icX_SemanticProvider_1 = require("./icX.SemanticProvider");
const sidebarView_1 = require("./sidebarView");
const ic10_diagnostics_1 = require("./ic10.diagnostics");
const icx_compiler_1 = require("icx-compiler");
const icX_diagnostics_1 = require("./icX.diagnostics");
const icX_formatter_1 = require("./icX.formatter");
const err_1 = require("icx-compiler/src/err");
const icX_vscode_1 = require("./icX-vscode");
const ic10_1 = __importDefault(require("ic10"));
const utils_1 = require("../debugger/utils");
const LOCALE_KEY = vscode.env.language;
const ic10_hover = new ic10_vscode_1.Ic10Vscode();
const icX_hover = new icX_vscode_1.IcXVscode();
exports.LANG_IC10 = "ic10";
exports.LANG_ICX = "icX";
const interpreterIc10 = new ic10_1.default(null);
let interpreterIc10State = 0;
let leftCodeLength;
const onChangeCallbacks = {
    ChangeActiveTextEditor: [],
    ChangeTextEditorSelection: [],
    SaveTextDocument: []
};
exports.icxOptions = {
    comments: false,
    aliases: false,
    loop: false,
    constants: false,
};
function activate(ctx) {
    view(ctx);
    formatter(ctx);
    command(ctx);
    semantic(ctx);
    statusBar(ctx);
    diagnostic(ctx);
    hover(ctx);
    icxStart();
    onChange(ctx);
}
exports.activate = activate;
function icxStart() {
    onChangeCallbacks.SaveTextDocument.push(() => {
        if (vscode.window.activeTextEditor.document.languageId == exports.LANG_ICX) {
            vscode.commands.executeCommand(exports.LANG_ICX + ".compile");
        }
    });
}
function hover(ctx) {
    try {
        ctx.subscriptions.push(vscode.languages.registerHoverProvider(exports.LANG_IC10, {
            provideHover(document, position) {
                const word = document.getWordRangeAtPosition(position);
                const text = document.getText(word);
                return new vscode_1.Hover(ic10_hover.getHover(text));
            }
        }));
        ctx.subscriptions.push(vscode.languages.registerHoverProvider(exports.LANG_ICX, {
            provideHover(document, position) {
                const word = document.getWordRangeAtPosition(position);
                const text = document.getText(word);
                return new vscode_1.Hover(icX_hover.getHover(text));
            }
        }));
    }
    catch (e) {
    }
}
function formatter(ctx) {
    try {
        function replaceTextInDocument(newText, document) {
            const firstLine = document.lineAt(0);
            const lastLine = document.lineAt(document.lineCount - 1);
            const range = new vscode.Range(0, firstLine.range.start.character, document.lineCount - 1, lastLine.range.end.character);
            return vscode.TextEdit.replace(range, newText);
        }
        try {
            vscode.languages.registerDocumentFormattingEditProvider(exports.LANG_IC10, {
                provideDocumentFormattingEdits(document) {
                    try {
                        const formatter = new ic10_formatter_1.ic10Formatter(document);
                        return [replaceTextInDocument(formatter.resultText, document)];
                    }
                    catch (e) {
                    }
                }
            });
        }
        catch (e) {
        }
        try {
            vscode.languages.registerDocumentFormattingEditProvider(exports.LANG_ICX, {
                provideDocumentFormattingEdits(document) {
                    try {
                        const formatter = new icX_formatter_1.icXFormatter(document, exports.icxOptions);
                        return [replaceTextInDocument(formatter.resultText, document)];
                    }
                    catch (e) {
                    }
                }
            });
        }
        catch (e) {
        }
    }
    catch (e) {
    }
}
function command(ctx) {
    try {
        ctx.subscriptions.push(vscode.commands.registerCommand(exports.LANG_IC10 + ".run", () => {
            if (!interpreterIc10State) {
                vscode.window.showInformationMessage("Running");
                const code = vscode.window.activeTextEditor.document.getText();
                const title = path_1.default.basename(vscode.window.activeTextEditor.document.fileName);
                interpreterIc10State = 1;
                const panel = vscode.window.createWebviewPanel("ic10.debug", `${title}-Debug`, vscode.ViewColumn.Two);
                const settings = {
                    debug: true,
                    tickTime: 500,
                    debugCallback: function () {
                        panel.webview.html += ic10_hover.htmlLog(...arguments) + "<br>";
                    },
                    logCallback: function () {
                        panel.webview.html += ic10_hover.htmlLog(...arguments) + "<br>";
                    },
                    executionCallback: function (e) {
                        panel.webview.html += ic10_hover.htmlLog(...arguments) + "<br>";
                    },
                };
                const ic10 = interpreterIc10.setSettings(settings).init(code);
                (0, utils_1.parseEnvironment)(ic10, vscode.window.activeTextEditor.document.uri.fsPath);
                ic10.run().then();
            }
        }));
        ctx.subscriptions.push(vscode.commands.registerCommand(exports.LANG_IC10 + ".stop", () => {
            if (interpreterIc10State) {
                vscode.window.showInformationMessage("Stop");
                interpreterIc10.stop();
            }
        }));
        ctx.subscriptions.push(vscode.commands.registerCommand(exports.LANG_IC10 + ".debug.variables.write", (variable) => {
            const ds = vscode.debug.activeDebugSession;
            const input = vscode.window.createInputBox();
            input.title = "set " + variable.variable.name;
            input.show();
            input.onDidAccept(function () {
                ds.customRequest("ic10.debug.variables.write", { variable: variable, value: input.value });
                input.hide();
            });
        }));
        ctx.subscriptions.push(vscode.commands.registerCommand(exports.LANG_ICX + ".compile", () => {
            try {
                const code = vscode.window.activeTextEditor.document.getText();
                const icx = new icx_compiler_1.icX(code, exports.icxOptions);
                const compiled = icx.getCompiled();
                if (compiled) {
                    const content = Buffer.from(compiled);
                    const file = vscode.window.activeTextEditor.document.uri + ".ic10";
                    vscode.window.showInformationMessage("Compiling output: " + file);
                    vscode.workspace.fs.writeFile(vscode.Uri.parse(file), content);
                }
                else {
                    vscode.window.showErrorMessage("compiling error: " + compiled);
                }
            }
            catch (e) {
                if (e instanceof err_1.Errors || e instanceof err_1.Err) {
                    vscode.window.showErrorMessage("compiling error: " + e.getUserMessage());
                }
                else {
                    vscode.window.showErrorMessage("compiling error", JSON.stringify(e));
                }
                console.error(e);
            }
        }));
        ctx.subscriptions.push(vscode.commands.registerCommand(exports.LANG_ICX + ".open.wiki", async () => {
            const panel = vscode.window.createWebviewPanel('icX.wiki', 'wiki', vscode.ViewColumn.Beside, {
                enableScripts: true,
                retainContextWhenHidden: true,
                enableForms: true,
                enableCommandUris: true,
                enableFindWidget: true
            });
            const _disposables = [];
            panel.onDidDispose(() => this.dispose(), null, _disposables);
            panel.onDidChangeViewState(e => {
                if (panel.visible) {
                    this._update();
                }
            }, null, _disposables);
            panel.webview.onDidReceiveMessage(message => {
                switch (message.command) {
                    case "alert":
                        vscode.window.showErrorMessage(message.text);
                        return;
                }
            }, null, _disposables);
            const ext = path_1.default.extname(vscode.window.activeTextEditor.document.uri.path).replace(".", "");
            panel.webview.html = `
<style>
html,body,iframe{
    margin: 0;
    padding: 0;
    border: none;
}
</style>
<iframe style="width: calc(100vw - 20px);height: calc(100vh - 20px);" botder="0" src="https://icx.traineratwot.site/wiki/${ext}"></iframe>
`;
        }));
    }
    catch (e) {
        vscode.window.showErrorMessage("Commands: " + e.toString());
        console.error(e);
    }
}
function semantic(ctx) {
    try {
        ctx.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider({ language: exports.LANG_IC10, scheme: "file" }, new icX_SemanticProvider_1.IcxSemanticTokensProvider, icX_SemanticProvider_1.legend));
        ctx.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider({ language: exports.LANG_ICX, scheme: "file" }, new icX_SemanticProvider_1.IcxSemanticTokensProvider, icX_SemanticProvider_1.legend));
    }
    catch (e) {
    }
}
function view(ctx) {
    console.time("view");
    try {
        exports.icSidebar = new sidebarView_1.Ic10SidebarViewProvider(ctx.extensionUri);
        ctx.subscriptions.push(vscode.window.registerWebviewViewProvider(sidebarView_1.Ic10SidebarViewProvider.viewType, exports.icSidebar));
        onChangeCallbacks.ChangeTextEditorSelection.push(() => {
            renderIc10();
        });
        onChangeCallbacks.ChangeTextEditorSelection.push(() => {
            renderIcX();
        });
        onChangeCallbacks.ChangeActiveTextEditor.push(() => {
            exports.icSidebar.clear();
            renderIcX();
            renderIc10();
        });
        renderIcX();
        renderIc10();
        exports.icSidebar.start();
    }
    catch (e) {
        console.error(e);
    }
    console.timeEnd("view");
}
function statusBar(ctx) {
    try {
        leftCodeLength = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        ctx.subscriptions.push(leftCodeLength);
        onChangeCallbacks.ChangeTextEditorSelection.push(() => {
            updateStatusBarItem();
        });
        updateStatusBarItem();
        function updateStatusBarItem() {
            const n = getNumberLeftLines();
            if (n) {
                if (LOCALE_KEY == "ru2") {
                    leftCodeLength.text =
                        `осталось ${n[0]} ${n[1]} строк`;
                }
                else {
                    leftCodeLength.text =
                        `${n[0]}${n[1]} line(s) left`;
                }
                leftCodeLength.show();
            }
            else {
                leftCodeLength.hide();
            }
        }
    }
    catch (e) {
    }
}
function ChangeActiveTextEditor(editor) {
    if (vscode.window.activeTextEditor.document.languageId == exports.LANG_IC10 || vscode.window.activeTextEditor.document.languageId == exports.LANG_ICX) {
        onChangeCallbacks.ChangeActiveTextEditor.forEach((e) => {
            e.call(null, editor);
        });
    }
}
function ChangeTextEditorSelection(editor) {
    if (vscode.window.activeTextEditor.document.languageId == exports.LANG_IC10 || vscode.window.activeTextEditor.document.languageId == exports.LANG_ICX) {
        onChangeCallbacks.ChangeTextEditorSelection.forEach((e) => {
            e.call(null, editor);
        });
    }
}
function SaveTextDocument() {
    if (vscode.window.activeTextEditor.document.languageId == exports.LANG_IC10 || vscode.window.activeTextEditor.document.languageId == exports.LANG_ICX) {
        onChangeCallbacks.SaveTextDocument.forEach((e) => {
            e.call(null);
        });
    }
}
function onChange(ctx) {
    ctx.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(ChangeActiveTextEditor));
    ctx.subscriptions.push(vscode.workspace.onDidSaveTextDocument(SaveTextDocument));
    ctx.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(ChangeTextEditorSelection));
}
function getNumberLeftLines() {
    const text = vscode.window.activeTextEditor.document.getText();
    if (vscode.window.activeTextEditor.document.languageId == exports.LANG_IC10) {
        let left = 128;
        const a = " ▁▃▅▉";
        if (text) {
            left = left - text.split("\n").length;
        }
        const x = a[Math.ceil(left / 32)] ?? "";
        return [x, left];
    }
    else {
        return false;
    }
}
function diagnostic(context) {
    try {
        const ic10DiagnosticsCollection = vscode.languages.createDiagnosticCollection("ic10");
        const icXDiagnosticsCollection = vscode.languages.createDiagnosticCollection("icX");
        context.subscriptions.push(ic10DiagnosticsCollection);
        context.subscriptions.push(icXDiagnosticsCollection);
        onChangeCallbacks.ChangeTextEditorSelection.push(() => {
            if (vscode.window.activeTextEditor.document.languageId == exports.LANG_IC10) {
                ic10_diagnostics_1.ic10Diagnostics.run(vscode.window.activeTextEditor.document, ic10DiagnosticsCollection);
                icX_diagnostics_1.icXDiagnostics.clear(vscode.window.activeTextEditor.document, icXDiagnosticsCollection);
            }
            else {
                ic10_diagnostics_1.ic10Diagnostics.clear(vscode.window.activeTextEditor.document, ic10DiagnosticsCollection);
            }
            if (vscode.window.activeTextEditor.document.languageId == exports.LANG_ICX) {
                icX_diagnostics_1.icXDiagnostics.run(vscode.window.activeTextEditor.document, icXDiagnosticsCollection);
                ic10_diagnostics_1.ic10Diagnostics.clear(vscode.window.activeTextEditor.document, ic10DiagnosticsCollection);
            }
            else {
                icX_diagnostics_1.icXDiagnostics.clear(vscode.window.activeTextEditor.document, icXDiagnosticsCollection);
            }
        });
        onChangeCallbacks.ChangeActiveTextEditor.push(() => {
            if (vscode.window.activeTextEditor.document.languageId == exports.LANG_ICX) {
                icX_diagnostics_1.icXDiagnostics.run(vscode.window.activeTextEditor.document, icXDiagnosticsCollection);
                ic10_diagnostics_1.ic10Diagnostics.clear(vscode.window.activeTextEditor.document, ic10DiagnosticsCollection);
            }
            else {
                icX_diagnostics_1.icXDiagnostics.clear(vscode.window.activeTextEditor.document, icXDiagnosticsCollection);
            }
            if (vscode.window.activeTextEditor.document.languageId == exports.LANG_IC10) {
                ic10_diagnostics_1.ic10Diagnostics.run(vscode.window.activeTextEditor.document, ic10DiagnosticsCollection);
                icX_diagnostics_1.icXDiagnostics.clear(vscode.window.activeTextEditor.document, icXDiagnosticsCollection);
            }
            else {
                ic10_diagnostics_1.ic10Diagnostics.clear(vscode.window.activeTextEditor.document, ic10DiagnosticsCollection);
            }
        });
    }
    catch (e) {
    }
}
function deactivate() {
}
exports.deactivate = deactivate;
function renderIcX() {
    exports.icSidebar.section("settings", `
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
				`, exports.LANG_ICX);
    exports.icSidebar.events.icxComments = (data) => {
        exports.icxOptions.comments = Boolean(data.value);
    };
    exports.icSidebar.events.icxAliases = (data) => {
        exports.icxOptions.aliases = Boolean(data.value);
    };
    exports.icSidebar.events.icxLoop = (data) => {
        exports.icxOptions.loop = Boolean(data.value);
    };
    exports.icSidebar.events.icxConstants = (data) => {
        exports.icxOptions.constants = Boolean(data.value);
    };
}
function renderIc10() {
    const a = getNumberLeftLines();
    if (a) {
        const b = Math.abs(a[1] - 128);
        const p = b / 128 * 100;
        exports.icSidebar.section("leftLineCounter", `
					<p>Left lines ${a[1]}</p>
					<div id="leftLineCounter" class="progress" data-percent="${p}" data-value="${b}"  data-max="128" data-min="0">
					  <div></div>
					</div>
					`, exports.LANG_IC10, -10);
    }
    else {
        exports.icSidebar.section("leftLineCounter", ``, -10);
    }
}
//# sourceMappingURL=main.js.map