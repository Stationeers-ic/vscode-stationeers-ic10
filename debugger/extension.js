'use strict';
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const Net = __importStar(require("net"));
const vscode = __importStar(require("vscode"));
const crypto_1 = require("crypto");
const os_1 = require("os");
const path_1 = require("path");
const process_1 = require("process");
const ic10Debug_1 = require("./ic10Debug");
const activateIc10Debug_1 = require("./activateIc10Debug");
const runMode = 'inline';
function activate(context) {
    switch (runMode) {
        case 'server':
            (0, activateIc10Debug_1.activateIc10Debug)(context, new ic10DebugAdapterServerDescriptorFactory());
            break;
        case 'namedPipeServer':
            (0, activateIc10Debug_1.activateIc10Debug)(context, new ic10DebugAdapterNamedPipeServerDescriptorFactory());
            break;
        case 'external':
        default:
            (0, activateIc10Debug_1.activateIc10Debug)(context, new DebugAdapterExecutableFactory());
            break;
        case 'inline':
            (0, activateIc10Debug_1.activateIc10Debug)(context);
            break;
    }
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
class DebugAdapterExecutableFactory {
    createDebugAdapterDescriptor(_session, executable) {
        if (!executable) {
            const command = "absolute path to my DA executable";
            const args = [
                "some args",
                "another arg"
            ];
            const options = {
                cwd: "working directory for executable",
                env: { "envVariable": "some value" }
            };
            executable = new vscode.DebugAdapterExecutable(command, args, options);
        }
        return executable;
    }
}
class ic10DebugAdapterServerDescriptorFactory {
    server;
    createDebugAdapterDescriptor(session, executable) {
        if (!this.server) {
            this.server = Net.createServer(socket => {
                const session = new ic10Debug_1.ic10DebugSession(activateIc10Debug_1.workspaceFileAccessor);
                session.setRunAsServer(true);
                session.start(socket, socket);
            }).listen(0);
        }
        return new vscode.DebugAdapterServer(this.server.address().port);
    }
    dispose() {
        if (this.server) {
            this.server.close();
        }
    }
}
class ic10DebugAdapterNamedPipeServerDescriptorFactory {
    server;
    createDebugAdapterDescriptor(session, executable) {
        if (!this.server) {
            const pipeName = (0, crypto_1.randomBytes)(10).toString('utf8');
            const pipePath = process_1.platform === "win32" ? (0, path_1.join)('\\\\.\\pipe\\', pipeName) : (0, path_1.join)((0, os_1.tmpdir)(), pipeName);
            this.server = Net.createServer(socket => {
                const session = new ic10Debug_1.ic10DebugSession(activateIc10Debug_1.workspaceFileAccessor);
                session.setRunAsServer(true);
                session.start(socket, socket);
            }).listen(pipePath);
        }
        return undefined;
    }
    dispose() {
        if (this.server) {
            this.server.close();
        }
    }
}
//# sourceMappingURL=extension.js.map