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
const ic10Debug_1 = require("./ic10Debug");
const fs_1 = require("fs");
const Net = __importStar(require("net"));
const fsAccessor = {
    async readFile(path) {
        return new Promise((resolve, reject) => {
            fs_1.readFile(path, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data.toString());
                }
            });
        });
    }
};
let port = 0;
const args = process.argv.slice(2);
args.forEach(function (val, index, array) {
    const portMatch = /^--server=(\d{4,5})$/.exec(val);
    if (portMatch) {
        port = parseInt(portMatch[1], 10);
    }
});
if (port > 0) {
    console.error(`waiting for debug protocol on port ${port}`);
    Net.createServer((socket) => {
        console.error('>> accepted connection from client');
        socket.on('end', () => {
            console.error('>> client connection closed\n');
        });
        const session = new ic10Debug_1.ic10DebugSession(fsAccessor);
        session.setRunAsServer(true);
        session.start(socket, socket);
    }).listen(port);
}
else {
    const session = new ic10Debug_1.ic10DebugSession(fsAccessor);
    process.on('SIGTERM', () => {
        session.shutdown();
    });
    session.start(process.stdin, process.stdout);
}
//# sourceMappingURL=debugAdapter.js.map