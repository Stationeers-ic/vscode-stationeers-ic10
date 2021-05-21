"use strict";
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
exports.Ic10SidebarViewProvider = void 0;
const vscode = __importStar(require("vscode"));
class Ic10SidebarViewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        this.sectionsNamed = {};
        this.sections = [];
    }
    resolveWebviewView(webviewView, context, _token) {
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };
        webviewView.webview.html = this._getHtmlForWebview();
        webviewView.webview.onDidReceiveMessage(data => {
        });
    }
    sendCommand(name, data) {
        this.view.webview.postMessage({ fn: name, data: data });
    }
    refresh(newContent = '') {
        this.sendCommand('update', newContent);
    }
    start() {
        setInterval(() => {
            if (this.update) {
                this.update = false;
                this.refresh(this.newContent);
            }
        }, 100);
    }
    section(name, content, lang, priority = 0) {
        if (!this.sectionsNamed.hasOwnProperty(name)) {
            this.sections.length;
            this.sectionsNamed[name] = this.sections.length;
            this.sections.push({ name, content, lang, priority });
        }
        else {
            this.sections[this.sectionsNamed[name]] = { name, content, lang, priority };
        }
        var newContent = "";
        var languageId = vscode.window.activeTextEditor.document.languageId;
        this.sections.sort((a, b) => {
            if (a.priority < b.priority) {
                return -1;
            }
            if (a.priority > b.priority) {
                return 1;
            }
            return 0;
        });
        for (const sectionsKey in this.sections) {
            var obj = this.sections[sectionsKey];
            if (obj.lang == 'both' || obj.lang == languageId) {
                newContent += `
				<section id="${obj.name}">
					${obj.content}
				</section>
			`;
            }
        }
        this.newContent = newContent;
        this.update = true;
    }
    clear() {
        this.sectionsNamed = new Set;
        this.sections = [];
    }
    _getHtmlForWebview(content = '') {
        const styleMainUri = this.view.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.css'));
        const scriptMainUri = this.view.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.js'));
        const nonce = this.getNonce();
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
			<meta charset="UTF-8">
				<!--
				\tUse a content security policy to only allow loading images from https or from our extension directory,
				\tand only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this.view.webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleMainUri}" rel="stylesheet">
			</head>
			<body>
				<div id="content">
					${content}
				</div>
				<script src="${scriptMainUri}" nonce="${nonce}"></script>
			</body>
			</html>`;
    }
    getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}
exports.Ic10SidebarViewProvider = Ic10SidebarViewProvider;
Ic10SidebarViewProvider.viewType = 'Ic10ViewProvider';
//# sourceMappingURL=sidebarView.js.map