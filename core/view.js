"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ic10ViewProvider = void 0;
class Ic10ViewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
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
    _getHtmlForWebview() {
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
			
				
				<title>Cat Colors</title>
			</head>
			<body>
				<ul class="color-list">
				</ul>
				<button class="add-color-button">Add Color</button>
			</body>
			</html>`;
    }
}
exports.Ic10ViewProvider = Ic10ViewProvider;
Ic10ViewProvider.viewType = 'Ic10ViewProvider';
//# sourceMappingURL=view.js.map