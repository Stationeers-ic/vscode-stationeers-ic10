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
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceFileAccessor = exports.activateic10Debug = void 0;
const vscode = __importStar(require("vscode"));
const ic10Debug_1 = require("./ic10Debug");
function activateic10Debug(context, factory) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.ic10-debug.getProgramName', config => {
        return vscode.window.showInputBox({
            placeHolder: "Please enter the name of a markdown file in the workspace folder",
            value: "readme.md"
        });
    }));
    const provider = new ic10ConfigurationProvider();
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('ic10', provider));
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('ic10', {
        provideDebugConfigurations(folder) {
            return [
                {
                    name: "Dynamic Launch",
                    request: "launch",
                    type: "ic10",
                    program: "${file}"
                },
                {
                    name: "Another Dynamic Launch",
                    request: "launch",
                    type: "ic10",
                    program: "${file}"
                },
                {
                    name: "ic10 Launch",
                    request: "launch",
                    type: "ic10",
                    program: "${file}"
                }
            ];
        }
    }, vscode.DebugConfigurationProviderTriggerKind.Dynamic));
    if (!factory) {
        factory = new InlineDebugAdapterFactory();
    }
    context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('ic10', factory));
    if ('dispose' in factory) {
        context.subscriptions.push(factory);
    }
    context.subscriptions.push(vscode.languages.registerEvaluatableExpressionProvider('markdown', {
        provideEvaluatableExpression(document, position) {
            const wordRange = document.getWordRangeAtPosition(position);
            return wordRange ? new vscode.EvaluatableExpression(wordRange) : undefined;
        }
    }));
    context.subscriptions.push(vscode.languages.registerInlineValuesProvider('markdown', {
        provideInlineValues(document, viewport, context) {
            const allValues = [];
            for (let l = viewport.start.line; l <= context.stoppedLocation.end.line; l++) {
                const line = document.lineAt(l);
                var regExp = /local_[ifso]/ig;
                do {
                    var m = regExp.exec(line.text);
                    if (m) {
                        const varName = m[0];
                        const varRange = new vscode.Range(l, m.index, l, m.index + varName.length);
                        allValues.push(new vscode.InlineValueVariableLookup(varRange, varName, false));
                    }
                } while (m);
            }
            return allValues;
        }
    }));
}
exports.activateic10Debug = activateic10Debug;
class ic10ConfigurationProvider {
    resolveDebugConfiguration(folder, config, token) {
        if (!config.type && !config.request && !config.name) {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId === 'markdown') {
                config.type = 'ic10';
                config.name = 'Launch';
                config.request = 'launch';
                config.program = '${file}';
                config.stopOnEntry = true;
            }
        }
        if (!config.program) {
            return vscode.window.showInformationMessage("Cannot find a program to debug").then(_ => {
                return undefined;
            });
        }
        return config;
    }
}
exports.workspaceFileAccessor = {
    async readFile(path) {
        try {
            const uri = vscode.Uri.file(path);
            const bytes = await vscode.workspace.fs.readFile(uri);
            const contents = Buffer.from(bytes).toString('utf8');
            return contents;
        }
        catch (e) {
            try {
                const uri = vscode.Uri.parse(path);
                const bytes = await vscode.workspace.fs.readFile(uri);
                const contents = Buffer.from(bytes).toString('utf8');
                return contents;
            }
            catch (e) {
                return `cannot read '${path}'`;
            }
        }
    }
};
class InlineDebugAdapterFactory {
    createDebugAdapterDescriptor(_session) {
        return new vscode.DebugAdapterInlineImplementation(new ic10Debug_1.ic10DebugSession(exports.workspaceFileAccessor));
    }
}
//# sourceMappingURL=activateic10Debug.js.map