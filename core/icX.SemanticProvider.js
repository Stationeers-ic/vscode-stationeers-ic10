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
        'parameter', 'keyword', 'enumMember',
        'property', 'function',
        'variable', 'label'
    ];
    tokenTypesLegend.forEach((tokenType, index) => exports.tokenTypes.set(tokenType, index));
    const tokenModifiersLegend = [
        'declaration', 'readonly'
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
            var keywords = [];
            var constants = [];
            lines.forEach((line) => {
                try {
                    var re = /\b(var|alias)\s+([\w\d]+).*/;
                    if (re.test(line)) {
                        var match = re.exec(line);
                        vars.push(match[2]);
                    }
                    var re = /\b(const|define)\s+([\w\d]+).*/;
                    if (re.test(line)) {
                        var match = re.exec(line);
                        constants.push(match[2]);
                    }
                    var re = /([\w\d]+):/;
                    if (re.test(line)) {
                        var match = re.exec(line);
                        keywords.push(match[1]);
                    }
                }
                catch (e) {
                }
            });
            lines.forEach((line, index) => {
                try {
                    for (let value of vars) {
                        r = this.pushToken(value, line, index, 0, null, r);
                    }
                    for (let value of keywords) {
                        r = this.pushToken(value, line, index, 1, null, r);
                    }
                    for (let value of constants) {
                        r = this.pushToken(value, line, index, 2, 1, r);
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
    pushToken(search, line, index, tokenType, tokenModifier, out) {
        var find = new RegExp('\\b' + search + '\\b', 'y');
        try {
            for (let i = 0; i < line.length; i++) {
                if (line[i] == '#') {
                    break;
                }
                find.lastIndex = i;
                var match = find.exec(line);
                if (match && match[0] == search) {
                    var a = {
                        line: index,
                        startCharacter: match.index,
                        length: search.length,
                        tokenType: tokenType,
                    };
                    if (tokenModifier !== null) {
                        a.tokenModifier = tokenModifier;
                    }
                    out.push(a);
                }
            }
        }
        catch (e) {
        }
        return out;
    }
}
exports.IcxSemanticTokensProvider = IcxSemanticTokensProvider;
//# sourceMappingURL=icX.SemanticProvider.js.map