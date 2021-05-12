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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IcxSemanticTokensProvider = exports.legend = exports.tokenModifiers = exports.tokenTypes = void 0;
const vscode_1 = __importDefault(require("vscode"));
const fs = __importStar(require("fs"));
exports.tokenTypes = new Map();
exports.tokenModifiers = new Map();
exports.legend = (function () {
    const tokenTypesLegend = [
        'comment', 'keyword', 'number', 'function',
        'variable', 'parameter', 'property', 'label'
    ];
    tokenTypesLegend.forEach((tokenType, index) => exports.tokenTypes.set(tokenType, index));
    const tokenModifiersLegend = [
        'declaration',
    ];
    tokenModifiersLegend.forEach((tokenModifier, index) => exports.tokenModifiers.set(tokenModifier, index));
    return new vscode_1.default.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();
class IcxSemanticTokensProvider {
    provideDocumentSemanticTokens(document, token) {
        const allTokens = IcxSemanticTokensProvider._parseText(document.getText());
        const builder = new vscode_1.default.SemanticTokensBuilder();
        fs.writeFileSync('C:\\OSPanel\\domains\\vscode-stationeers-ic10\\log\\allTokens.json', JSON.stringify(allTokens));
        allTokens.forEach((token) => {
            builder.push(new vscode_1.default.Range(new vscode_1.default.Position(token.line, token.startCharacter), new vscode_1.default.Position(token.line, token.length)), token.tokenType, token.tokenModifiers);
        });
        return builder.build();
    }
    static _parseText(text) {
        const r = [];
        const lines = text.split(/\r\n|\r|\n/);
        var vars = new Set();
        const re = /var\\s+([\\w\\d]+).+/;
        lines.forEach((line, index) => {
            if (re.test(line)) {
                var match = re.exec(line);
                vars.add(match[1]);
            }
        });
        lines.forEach((line, index) => {
            for (let value of vars) {
                var pos = 0;
                var ranges = [];
                var range = 0;
                do {
                    pos;
                    range = line.indexOf(value, pos);
                    if (range >= 0) {
                        ranges.push({ x: range, y: value.length });
                    }
                    pos += value.length;
                } while (range >= 0);
                for (let rrr of ranges) {
                    r.push({
                        line: index,
                        startCharacter: rrr.x,
                        length: rrr.y,
                        tokenType: 'variable',
                        tokenModifiers: ['declaration']
                    });
                }
            }
        });
        fs.writeFileSync('C:\\OSPanel\\domains\\vscode-stationeers-ic10\\log\\test.json', JSON.stringify(r));
        return r;
    }
}
exports.IcxSemanticTokensProvider = IcxSemanticTokensProvider;
//# sourceMappingURL=icx.SemanticProvider.js.map