"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IcxSemanticTokensProvider = exports.legend = exports.tokenModifiers = exports.tokenTypes = void 0;
const vscode_1 = __importDefault(require("vscode"));
exports.tokenTypes = new Map();
exports.tokenModifiers = new Map();
exports.legend = (function () {
    const tokenTypesLegend = [
        'parameter', 'keyword', 'number', 'function',
        'variable', 'property', 'label'
    ];
    tokenTypesLegend.forEach((tokenType, index) => exports.tokenTypes.set(tokenType, index));
    const tokenModifiersLegend = [
        'declaration', 'definition'
    ];
    tokenModifiersLegend.forEach((tokenModifier, index) => exports.tokenModifiers.set(tokenModifier, index));
    return new vscode_1.default.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();
class IcxSemanticTokensProvider {
    provideDocumentSemanticTokens(document, token) {
        var allTokens = this._parseText(document.getText());
        var builder = new vscode_1.default.SemanticTokensBuilder(exports.legend);
        allTokens.forEach((token) => {
            builder.push(token.line, token.startCharacter, token.length, token.tokenType);
        });
        return builder.build();
    }
    _parseText(text) {
        try {
            var r = [];
            var lines = text.split(/\r\n|\r|\n/);
            var vars = [];
            var re = /\b(var|alias)\b\s+\b([\w\d]+)\b.+/;
            lines.forEach((line) => {
                try {
                    if (re.test(line)) {
                        var match = re.exec(line);
                        vars.push(match[2]);
                    }
                }
                catch (e) {
                }
            });
            lines.forEach((line, index) => {
                try {
                    for (let value of vars) {
                        var find = new RegExp(`\\b` + value + '\\b', 'y');
                        try {
                            for (let i = 0; i < line.length; i++) {
                                find.lastIndex = i;
                                var match = find.exec(line);
                                if (match && match[0] == value) {
                                    r.push({
                                        line: index,
                                        startCharacter: match.index,
                                        length: value.length,
                                        tokenType: 0,
                                    });
                                }
                            }
                        }
                        catch (e) {
                        }
                    }
                }
                catch (e) {
                }
            });
            return r;
        }
        catch (e) {
        }
        return [];
    }
}
exports.IcxSemanticTokensProvider = IcxSemanticTokensProvider;
//# sourceMappingURL=icx.SemanticProvider.js.map