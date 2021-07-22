'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
exports.deactivate = exports.activate = exports.icxOptions = exports.icSidebar = exports.LANG_KEY2 = exports.LANG_KEY = void 0;
const vscode = __importStar(require("vscode"));
const vscode_1 = require("vscode");
const ic10_vscode_1 = require("./ic10-vscode");
const ic10_1 = require("ic10");
const path_1 = __importDefault(require("path"));
const ic10_formatter_1 = require("./ic10.formatter");
const icx_SemanticProvider_1 = require("./icx.SemanticProvider");
const sidebarView_1 = require("./sidebarView");
const ic10_diagnostics_1 = require("./ic10.diagnostics");
const icx_compiler_1 = require("icx-compiler");
const icX_diagnostics_1 = require("./icX.diagnostics");
const LOCALE_KEY = vscode.env.language;
const ic10 = new ic10_vscode_1.Ic10Vscode();
exports.LANG_KEY = 'ic10';
exports.LANG_KEY2 = 'icX';
const interpreterIc10 = new ic10_1.InterpreterIc10(null);
var interpreterIc10State = 0;
var leftCodeLength;
var onChangeCallbacks = {
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
        if (vscode.window.activeTextEditor.document.languageId == exports.LANG_KEY2) {
            vscode.commands.executeCommand(exports.LANG_KEY2 + '.compile');
        }
    });
}
function hover(ctx) {
    try {
        ctx.subscriptions.push(vscode.languages.registerHoverProvider(exports.LANG_KEY, {
            provideHover(document, position, token) {
                var word = document.getWordRangeAtPosition(position);
                var text = document.getText(word);
                return new vscode_1.Hover(ic10.getHover(text));
            }
        }));
        ctx.subscriptions.push(vscode.languages.registerHoverProvider(exports.LANG_KEY2, {
            provideHover(document, position, token) {
                var word = document.getWordRangeAtPosition(position);
                var text = document.getText(word);
                return new vscode_1.Hover(ic10.getHover(text));
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
        vscode.languages.registerDocumentFormattingEditProvider(exports.LANG_KEY, {
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
}
function command(ctx) {
    try {
        ctx.subscriptions.push(vscode.commands.registerCommand(exports.LANG_KEY + '.run', () => {
            if (!interpreterIc10State) {
                vscode.window.showInformationMessage('Running');
                var code = vscode.window.activeTextEditor.document.getText();
                var title = path_1.default.basename(vscode.window.activeTextEditor.document.fileName);
                interpreterIc10State = 1;
                const panel = vscode.window.createWebviewPanel('ic10.debug', `${title}-Debug`, vscode.ViewColumn.Two);
                const settings = {
                    debug: true,
                    tickTime: 500,
                    debugCallback: function () {
                        panel.webview.html += ic10.htmlLog(...arguments) + "<br>";
                    },
                    logCallback: function () {
                        panel.webview.html += ic10.htmlLog(...arguments) + "<br>";
                    },
                    executionCallback: function (e) {
                        panel.webview.html += ic10.htmlLog(...arguments) + "<br>";
                    },
                };
                interpreterIc10.setSettings(settings).init(code).run();
            }
        }));
        ctx.subscriptions.push(vscode.commands.registerCommand(exports.LANG_KEY + '.stop', () => {
            if (interpreterIc10State) {
                vscode.window.showInformationMessage('Stop');
                interpreterIc10.stop();
            }
        }));
        ctx.subscriptions.push(vscode.commands.registerCommand(exports.LANG_KEY + '.debug.variables.write', (variable) => {
            const ds = vscode.debug.activeDebugSession;
            var input = vscode.window.createInputBox();
            input.title = 'set ' + variable.variable.name;
            input.show();
            input.onDidAccept(function () {
                ds.customRequest('ic10.debug.variables.write', { variable: variable, value: input.value });
                input.hide();
            });
        }));
        ctx.subscriptions.push(vscode.commands.registerCommand(exports.LANG_KEY + '.debug.device.write', (variable) => {
            const ds = vscode.debug.activeDebugSession;
            var input = vscode.window.createInputBox();
            input.title = 'set ' + variable.variable.name;
            input.show();
            input.onDidAccept(function () {
                ds.customRequest('ic10.debug.device.write', { variable: variable, value: input.value });
                input.hide();
            });
        }));
        ctx.subscriptions.push(vscode.commands.registerCommand(exports.LANG_KEY + '.debug.device.slot.write', (variable) => {
            const ds = vscode.debug.activeDebugSession;
            var input = vscode.window.createInputBox();
            input.title = 'set ' + variable.variable.name;
            input.show();
            input.onDidAccept(function () {
                ds.customRequest('ic10.debug.device.slot.write', { variable: variable, value: input.value });
                input.hide();
            });
        }));
        ctx.subscriptions.push(vscode.commands.registerCommand(exports.LANG_KEY + '.debug.stack.push', (variable) => {
            const ds = vscode.debug.activeDebugSession;
            var input = vscode.window.createInputBox();
            input.title = 'set ' + variable.variable.name;
            input.show();
            input.onDidAccept(function () {
                ds.customRequest('ic10.debug.stack.push', { variable: variable, value: input.value });
                input.hide();
            });
        }));
        ctx.subscriptions.push(vscode.commands.registerCommand(exports.LANG_KEY + '.debug.remove.push', (variable) => {
            const ds = vscode.debug.activeDebugSession;
            var input = vscode.window.createInputBox();
            input.title = 'set ' + variable.variable.name;
            input.show();
            input.onDidAccept(function () {
                ds.customRequest('ic10.debug.remove.push', { variable: variable, value: input.value });
                input.hide();
            });
        }));
        ctx.subscriptions.push(vscode.commands.registerCommand(exports.LANG_KEY2 + '.compile', () => {
            try {
                var code = vscode.window.activeTextEditor.document.getText();
                var title = path_1.default.basename(vscode.window.activeTextEditor.document.fileName).split('.')[0];
                var dir = path_1.default.dirname(vscode.window.activeTextEditor.document.uri._formatted);
                console.log(exports.icxOptions);
                var icx = new icx_compiler_1.icX(code, exports.icxOptions);
                var compiled = icx.getCompiled();
                console.log(compiled);
                if (compiled) {
                    var content = Buffer.from(compiled);
                    var file = dir + '/' + title + '.ic10';
                    vscode.workspace.fs.writeFile(vscode.Uri.parse(file), content);
                }
            }
            catch (e) {
                vscode.window.showInformationMessage('compiling error', e);
                console.error(e);
            }
        }));
    }
    catch (e) {
    }
}
function semantic(ctx) {
    try {
        ctx.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider({ language: exports.LANG_KEY, scheme: 'file' }, new icx_SemanticProvider_1.IcxSemanticTokensProvider, icx_SemanticProvider_1.legend));
        ctx.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider({ language: exports.LANG_KEY2, scheme: 'file' }, new icx_SemanticProvider_1.IcxSemanticTokensProvider, icx_SemanticProvider_1.legend));
    }
    catch (e) {
    }
}
function view(ctx) {
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
    }
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
    if (vscode.window.activeTextEditor.document.languageId == exports.LANG_KEY || vscode.window.activeTextEditor.document.languageId == exports.LANG_KEY2) {
        onChangeCallbacks.ChangeActiveTextEditor.forEach((e) => {
            e.call(null, editor);
        });
    }
}
function ChangeTextEditorSelection(editor) {
    if (vscode.window.activeTextEditor.document.languageId == exports.LANG_KEY || vscode.window.activeTextEditor.document.languageId == exports.LANG_KEY2) {
        onChangeCallbacks.ChangeTextEditorSelection.forEach((e) => {
            e.call(null, editor);
        });
    }
}
function SaveTextDocument() {
    if (vscode.window.activeTextEditor.document.languageId == exports.LANG_KEY || vscode.window.activeTextEditor.document.languageId == exports.LANG_KEY2) {
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
    var text = vscode.window.activeTextEditor.document.getText();
    if (vscode.window.activeTextEditor.document.languageId == exports.LANG_KEY) {
        var left = 128;
        var a = " ▁▃▅▉";
        if (text) {
            left = left - text.split('\n').length;
        }
        var x = a[Math.ceil(left / 32)] ?? '';
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
        onChangeCallbacks.ChangeTextEditorSelection.push((editor) => {
            if (vscode.window.activeTextEditor.document.languageId == exports.LANG_KEY) {
                ic10_diagnostics_1.ic10Diagnostics.run(vscode.window.activeTextEditor.document, ic10DiagnosticsCollection);
                icX_diagnostics_1.icXDiagnostics.clear(vscode.window.activeTextEditor.document, icXDiagnosticsCollection);
            }
            else {
                ic10_diagnostics_1.ic10Diagnostics.clear(vscode.window.activeTextEditor.document, ic10DiagnosticsCollection);
            }
            if (vscode.window.activeTextEditor.document.languageId == exports.LANG_KEY2) {
                icX_diagnostics_1.icXDiagnostics.run(vscode.window.activeTextEditor.document, icXDiagnosticsCollection);
                ic10_diagnostics_1.ic10Diagnostics.clear(vscode.window.activeTextEditor.document, ic10DiagnosticsCollection);
            }
            else {
                icX_diagnostics_1.icXDiagnostics.clear(vscode.window.activeTextEditor.document, icXDiagnosticsCollection);
            }
        });
        onChangeCallbacks.ChangeActiveTextEditor.push((editor) => {
            if (vscode.window.activeTextEditor.document.languageId == exports.LANG_KEY2) {
                icX_diagnostics_1.icXDiagnostics.run(vscode.window.activeTextEditor.document, icXDiagnosticsCollection);
                ic10_diagnostics_1.ic10Diagnostics.clear(vscode.window.activeTextEditor.document, ic10DiagnosticsCollection);
            }
            else {
                icX_diagnostics_1.icXDiagnostics.clear(vscode.window.activeTextEditor.document, icXDiagnosticsCollection);
            }
            if (vscode.window.activeTextEditor.document.languageId == exports.LANG_KEY) {
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
    exports.icSidebar.section('settings', `
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
				`, exports.LANG_KEY2);
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
    var a = getNumberLeftLines();
    if (a) {
        var b = Math.abs(a[1] - 128);
        var p = b / 128 * 100;
        exports.icSidebar.section('leftLineCounter', `
					<p>Left lines ${a[1]}</p>
					<div id="leftLineCounter" class="progress" percent="${p}" value="${b}"  max="128" min="0">
					  <div></div>
					</div>
					`, exports.LANG_KEY, -10);
    }
    else {
        exports.icSidebar.section('leftLineCounter', ``, -10);
    }
}
//# sourceMappingURL=main.js.map