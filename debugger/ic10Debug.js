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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariableMap = exports.ic10DebugSession = void 0;
const debugadapter_1 = require("@vscode/debugadapter");
const path_1 = require("path");
const ic10Runtime_1 = require("./ic10Runtime");
const ic10_1 = require("ic10");
const MemoryStack_1 = require("ic10/src/MemoryStack");
const ConstantCell_1 = require("ic10/src/ConstantCell");
const Slot_1 = require("ic10/src/Slot");
const types_1 = require("ic10/src/types");
const utils_1 = require("./utils");
const fs = __importStar(require("fs"));
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
class ic10DebugSession extends debugadapter_1.LoggingDebugSession {
    static threadID = 1;
    _variableHandles = new debugadapter_1.Handles();
    variableMap;
    _runtime;
    _cancelActionTokens = new Map();
    _reportProgress = false;
    _progressId = 10000;
    _cancelledProgressId = undefined;
    _isProgressCancellable = true;
    _useInvalidatedEvent = false;
    ic10;
    env;
    file;
    constructor(fileAccessor) {
        super("ic10-debug.txt");
        this.ic10 = new ic10_1.InterpreterIc10();
        this.variableMap = new VariableMap(this, this.ic10);
        this.ic10.setSettings({
            executionCallback: function (e) {
                this.output.error = `${e.message}:`;
                if (e.obj) {
                    this.output.error += JSON.stringify(e.obj);
                }
                switch (e.lvl) {
                    case 0:
                        this.output.error = "ERROR " + this.output.error;
                        break;
                    case 1:
                        this.output.error = "WARN " + this.output.error;
                        break;
                    case 2:
                        this.output.error = "INFO " + this.output.error;
                        break;
                    case 3:
                    default:
                        this.output.error = "LOG " + this.output.error;
                        break;
                }
            },
        });
        this.setDebuggerLinesStartAt1(false);
        this.setDebuggerColumnsStartAt1(false);
        this._runtime = new ic10Runtime_1.ic10Runtime(fileAccessor, this.ic10);
        this._runtime.on("stopOnEntry", () => {
            this.sendEvent(new debugadapter_1.StoppedEvent("entry", ic10DebugSession.threadID));
        });
        this._runtime.on("stopOnStep", () => {
            this.sendEvent(new debugadapter_1.StoppedEvent("step", ic10DebugSession.threadID));
        });
        this._runtime.on("stopOnBreakpoint", () => {
            this.sendEvent(new debugadapter_1.StoppedEvent("breakpoint", ic10DebugSession.threadID));
        });
        this._runtime.on("stopOnDataBreakpoint", () => {
            this.sendEvent(new debugadapter_1.StoppedEvent("data breakpoint", ic10DebugSession.threadID));
        });
        this._runtime.on("stopOnException", (exception) => {
            if (exception) {
                this.sendEvent(new debugadapter_1.StoppedEvent(`exception(${exception})`, ic10DebugSession.threadID));
            }
            else {
                this.sendEvent(new debugadapter_1.StoppedEvent("exception", ic10DebugSession.threadID));
            }
        });
        this._runtime.on("breakpointValidated", (bp) => {
            this.sendEvent(new debugadapter_1.BreakpointEvent("changed", {
                verified: bp.verified,
                id: bp.id
            }));
        });
        this._runtime.on("output", (text, filePath, line, column) => {
            const e = new debugadapter_1.OutputEvent(`${text}\n`);
            if (text === "start" || text === "startCollapsed" || text === "end") {
                e.body.group = text;
                e.body.output = `group-${text}\n`;
            }
            e.body.source = this.createSource(filePath);
            e.body.line = this.convertDebuggerLineToClient(line);
            e.body.column = this.convertDebuggerColumnToClient(column);
            this.sendEvent(e);
        });
        this._runtime.on("end", () => {
            this.sendEvent(new debugadapter_1.TerminatedEvent());
        });
    }
    initializeRequest(response, args) {
        if (args.supportsProgressReporting) {
            this._reportProgress = true;
        }
        if (args.supportsInvalidatedEvent) {
            this._useInvalidatedEvent = true;
        }
        response.body = response.body || {};
        response.body.supportsConfigurationDoneRequest = true;
        response.body.supportsEvaluateForHovers = true;
        response.body.supportsStepBack = true;
        response.body.supportsDataBreakpoints = true;
        response.body.supportsCompletionsRequest = true;
        response.body.completionTriggerCharacters = [".", "["];
        response.body.supportsCancelRequest = true;
        response.body.supportsBreakpointLocationsRequest = true;
        response.body.supportsStepInTargetsRequest = true;
        response.body.supportsExceptionFilterOptions = true;
        response.body.exceptionBreakpointFilters = [
            {
                filter: "namedException",
                label: "Named Exception",
                description: `Break on named exceptions. Enter the exception's name as the Condition.`,
                default: false,
                supportsCondition: true,
                conditionDescription: `Enter the exception's name`
            },
            {
                filter: "otherExceptions",
                label: "Other Exceptions",
                description: "This is a other exception",
                default: true,
                supportsCondition: false
            }
        ];
        response.body.supportsExceptionInfoRequest = true;
        this.sendResponse(response);
        this.sendEvent(new debugadapter_1.InitializedEvent());
    }
    configurationDoneRequest(response, args) {
        super.configurationDoneRequest(response, args);
    }
    async launchRequest(response, args) {
        debugadapter_1.logger.setup(args.trace ? debugadapter_1.Logger.LogLevel.Verbose : debugadapter_1.Logger.LogLevel.Stop, false);
        this.file = args.program;
        this.env = (0, utils_1.parseEnvironment)(this.ic10, this.file);
        await this._runtime.start(args.program, !!args.stopOnEntry, !!args.noDebug);
        this.sendResponse(response);
    }
    async setBreakPointsRequest(response, args) {
        const path = args.source.path;
        const clientLines = args.lines || [];
        this._runtime.clearBreakpoints(path);
        const actualBreakpoints0 = clientLines.map(async (l) => {
            const { verified, line, id } = await this._runtime.setBreakPoint(path, this.convertClientLineToDebugger(l));
            const bp = new debugadapter_1.Breakpoint(verified, this.convertDebuggerLineToClient(line));
            bp.id = id;
            return bp;
        });
        const actualBreakpoints = await Promise.all(actualBreakpoints0);
        response.body = {
            breakpoints: actualBreakpoints
        };
        this.sendResponse(response);
    }
    breakpointLocationsRequest(response, args, request) {
        if (args.source.path) {
            const bps = this._runtime.getBreakpoints(args.source.path, this.convertClientLineToDebugger(args.line));
            response.body = {
                breakpoints: bps.map(col => {
                    return {
                        line: args.line,
                        column: this.convertDebuggerColumnToClient(col)
                    };
                })
            };
        }
        else {
            response.body = {
                breakpoints: []
            };
        }
        this.sendResponse(response);
    }
    async setExceptionBreakPointsRequest(response, args) {
        let namedException = undefined;
        let otherExceptions = false;
        if (args.filterOptions) {
            for (const filterOption of args.filterOptions) {
                switch (filterOption.filterId) {
                    case "namedException":
                        namedException = args.filterOptions[0].condition;
                        break;
                    case "otherExceptions":
                        otherExceptions = true;
                        break;
                }
            }
        }
        if (args.filters) {
            if (args.filters.indexOf("otherExceptions") >= 0) {
                otherExceptions = true;
            }
        }
        this._runtime.setExceptionsFilters(namedException, otherExceptions);
        this.sendResponse(response);
    }
    exceptionInfoRequest(response, args) {
        response.body = {
            exceptionId: "Exception ID",
            description: "This is a descriptive description of the exception.",
            breakMode: "always",
            details: {
                message: "Message contained in the exception.",
                typeName: "Short type name of the exception object",
                stackTrace: "stack frame 1\nstack frame 2",
            }
        };
        this.sendResponse(response);
    }
    threadsRequest(response) {
        response.body = {
            threads: [
                new debugadapter_1.Thread(ic10DebugSession.threadID, "thread 1")
            ]
        };
        this.sendResponse(response);
    }
    stackTraceRequest(response, args) {
        const startFrame = typeof args.startFrame === "number" ? args.startFrame : 0;
        const maxLevels = typeof args.levels === "number" ? args.levels : 1000;
        const endFrame = startFrame + maxLevels;
        const stk = this._runtime.stack(startFrame, endFrame);
        response.body = {
            stackFrames: stk.frames.map(f => {
                const sf = new debugadapter_1.StackFrame(f.index, f.name, this.createSource(f.file), this.convertDebuggerLineToClient(f.line));
                if (typeof f.column === "number") {
                    sf.column = this.convertDebuggerColumnToClient(f.column);
                }
                return sf;
            }),
            totalFrames: stk.count
        };
        this.sendResponse(response);
    }
    scopesRequest(response, args) {
        response.body = {
            scopes: [
                new debugadapter_1.Scope("Constants", this._variableHandles.create("Constants"), false),
                new debugadapter_1.Scope("Registers", this._variableHandles.create("Registers"), false),
                new debugadapter_1.Scope("Stack", this._variableHandles.create("Stack"), false),
            ]
        };
        let db = 'DB [Socket]';
        if (!this.ic10?.memory.environ.get('db')) {
            db = `🟡 ${db}`;
        }
        else if (this.ic10?.memory.environ.get('db').properties.Error > 0) {
            db = `🔴 ${db}`;
        }
        else {
            db = `🟢 ${db}`;
        }
        response.body.scopes.push(new debugadapter_1.Scope(db, this._variableHandles.create('db'), false));
        const dd = {
            'D0': this.ic10.memory.environ.d0 || undefined,
            'D1': this.ic10.memory.environ.d1 || undefined,
            'D2': this.ic10.memory.environ.d2 || undefined,
            'D3': this.ic10.memory.environ.d3 || undefined,
            'D4': this.ic10.memory.environ.d4 || undefined,
            'D5': this.ic10.memory.environ.d5 || undefined,
        };
        for (const ddKey in dd) {
            let name = ddKey;
            if (dd[ddKey]) {
                name = `⚪ ${ddKey.toUpperCase()} [${dd[ddKey].name}]`;
            }
            else {
                name = `⚫ ${ddKey.toUpperCase()}`;
            }
            response.body.scopes.push(new debugadapter_1.Scope(name, this._variableHandles.create(ddKey.toLowerCase()), false));
        }
        fs.writeFileSync("C:\\projects\\vscode-stationeers-ic10\\test.json", JSON.stringify(response));
        this.sendResponse(response);
    }
    async variablesRequest(response, args, request) {
        const id = this._variableHandles.get(args.variablesReference);
        if (id) {
            if (["Constants", "Registers", "Devices", "Stack", "d0", "d1", "d2", "d3", "d4", "d5", "db"].includes(id)) {
                this.variableMap.init(id);
            }
            response.body = {
                variables: Object.values(this.variableMap.get(id))
            };
            this.sendResponse(response);
        }
        else {
            response.body = {
                variables: []
            };
            this.sendResponse(response);
        }
    }
    continueRequest(response, args) {
        this._runtime.continue();
        this.sendResponse(response);
    }
    reverseContinueRequest(response, args) {
        this._runtime.continue(true);
        this.sendResponse(response);
    }
    nextRequest(response, args) {
        this._runtime.step();
        this.sendResponse(response);
    }
    stepBackRequest(response, args) {
        this._runtime.step(true);
        this.sendResponse(response);
    }
    stepInTargetsRequest(response, args) {
        const targets = this._runtime.getStepInTargets(args.frameId);
        response.body = {
            targets: targets.map(t => {
                return { id: t.id, label: t.label };
            })
        };
        this.sendResponse(response);
    }
    stepInRequest(response, args) {
        this._runtime.stepIn(args.targetId);
        this.sendResponse(response);
    }
    stepOutRequest(response, args) {
        this._runtime.stepOut();
        this.sendResponse(response);
    }
    async evaluateRequest(response, args) {
        let reply = undefined;
        if (args.context === "repl") {
            const matches = /new +(\d+)/.exec(args.expression);
            if (matches && matches.length === 2) {
                const mbp = await this._runtime.setBreakPoint(this._runtime.sourceFile, this.convertClientLineToDebugger(parseInt(matches[1])));
                const bp = new debugadapter_1.Breakpoint(mbp.verified, this.convertDebuggerLineToClient(mbp.line), undefined, this.createSource(this._runtime.sourceFile));
                bp.id = mbp.id;
                this.sendEvent(new debugadapter_1.BreakpointEvent("new", bp));
                reply = `breakpoint created`;
            }
            else {
                const matches = /del +(\d+)/.exec(args.expression);
                if (matches && matches.length === 2) {
                    const mbp = this._runtime.clearBreakPoint(this._runtime.sourceFile, this.convertClientLineToDebugger(parseInt(matches[1])));
                    if (mbp) {
                        const bp = new debugadapter_1.Breakpoint(false);
                        bp.id = mbp.id;
                        this.sendEvent(new debugadapter_1.BreakpointEvent("removed", bp));
                        reply = `breakpoint deleted`;
                    }
                }
                else {
                    const matches = /progress/.exec(args.expression);
                    if (matches && matches.length === 1) {
                        if (this._reportProgress) {
                            reply = `progress started`;
                            await this.progressSequence();
                        }
                        else {
                            reply = `frontend doesn't support progress (capability 'supportsProgressReporting' not set)`;
                        }
                    }
                }
            }
        }
        if (args.context === "hover") {
            reply = this.getHover(args);
        }
        response.body = {
            result: reply,
            variablesReference: 0
        };
        this.sendResponse(response);
    }
    dataBreakpointInfoRequest(response, args) {
        response.body = {
            dataId: null,
            description: "cannot break on data access",
            accessTypes: undefined,
            canPersist: false
        };
        if (args.variablesReference && args.name) {
            const id = this._variableHandles.get(args.variablesReference);
            if (id === "global") {
                response.body.dataId = args.name;
                response.body.description = args.name;
                response.body.accessTypes = ["read", "write", "readWrite"];
                response.body.canPersist = true;
            }
            else {
                response.body.dataId = args.name;
                response.body.description = args.name;
                response.body.accessTypes = ["read", "write", "readWrite"];
                response.body.canPersist = true;
            }
        }
        this.sendResponse(response);
    }
    setDataBreakpointsRequest(response, args) {
        this._runtime.clearAllDataBreakpoints();
        response.body = {
            breakpoints: []
        };
        for (const dbp of args.breakpoints) {
            const dataId = dbp.dataId + `_${dbp.accessType ? dbp.accessType : "write"}`;
            const ok = this._runtime.setDataBreakpoint(dataId);
            response.body.breakpoints.push({
                verified: ok
            });
        }
        this.sendResponse(response);
    }
    completionsRequest(response, args) {
        response.body = {
            targets: [
                {
                    label: "item 10",
                    sortText: "10"
                },
                {
                    label: "item 1",
                    sortText: "01"
                },
                {
                    label: "item 2",
                    sortText: "02"
                },
                {
                    label: "array[]",
                    selectionStart: 6,
                    sortText: "03"
                },
                {
                    label: "func(arg)",
                    selectionStart: 5,
                    selectionLength: 3,
                    sortText: "04"
                }
            ]
        };
        this.sendResponse(response);
    }
    cancelRequest(response, args) {
        if (args.requestId) {
            this._cancelActionTokens.set(args.requestId, true);
        }
        if (args.progressId) {
            this._cancelledProgressId = args.progressId;
        }
    }
    customRequest(command, response, args) {
        const regex = /(.+)\[.+]/gm;
        command = command.trim();
        if (["ic10.debug.variables.write",
            "ic10.debug.device.write",
            "ic10.debug.device.slot.write",
            "ic10.debug.stack.push",
            "ic10.debug.remove.push"].indexOf(command) >= 0) {
            try {
                const name = regex.exec(args.variable.variable.name);
                if (name) {
                    args.variableName = name[1];
                }
                else {
                    args.variableName = args.variable.variable.name;
                }
                const container = regex.exec(args.variable.container.name);
                if (container) {
                    args.containerName = container[1];
                }
                else {
                    args.containerName = args.variable.container.name;
                }
            }
            catch (e) {
            }
        }
        const containerName = args.containerName.replace('🟢', '').replace('🔴', '').replace('🟡', '').replace('⚪', '').replace('⚫', '').trim().toLowerCase();
        args.containerName = containerName;
        switch (command) {
            case "ic10.debug.variables.write":
                try {
                    switch (containerName) {
                        case 'registers':
                            this.ic10.memory.getRegister(args.variableName).value = Number(args.value);
                            break;
                        case 'db':
                        case 'd0':
                        case 'd1':
                        case 'd2':
                        case 'd3':
                        case 'd4':
                        case 'd5':
                            this.ic10.memory.environ.get(containerName).set(args.variableName, Number(args.value));
                            break;
                        case 'zero':
                            this.ic10.memory.stack.getStack()[args.variableName] = Number(args.value);
                            break;
                        case 'constants':
                            this.ic10.memory.define(args.variableName, Number(args.value));
                            break;
                    }
                }
                catch (e) {
                    this.sendEvent(new debugadapter_1.InvalidatedEvent(["variables"]));
                }
                break;
            default:
                super.customRequest(command, response, args);
                break;
        }
        this.sendResponse(response);
    }
    async progressSequence() {
        const ID = "" + this._progressId++;
        await timeout(100);
        const title = this._isProgressCancellable ? "Cancellable operation" : "Long running operation";
        const startEvent = new debugadapter_1.ProgressStartEvent(ID, title);
        startEvent.body.cancellable = this._isProgressCancellable;
        this._isProgressCancellable = !this._isProgressCancellable;
        this.sendEvent(startEvent);
        this.sendEvent(new debugadapter_1.OutputEvent(`start progress: ${ID}\n`));
        let endMessage = "progress ended";
        for (let i = 0; i < 100; i++) {
            await timeout(500);
            this.sendEvent(new debugadapter_1.ProgressUpdateEvent(ID, `progress: ${i}`));
            if (this._cancelledProgressId === ID) {
                endMessage = "progress cancelled";
                this._cancelledProgressId = undefined;
                this.sendEvent(new debugadapter_1.OutputEvent(`cancel progress: ${ID}\n`));
                break;
            }
        }
        this.sendEvent(new debugadapter_1.ProgressEndEvent(ID, endMessage));
        this.sendEvent(new debugadapter_1.OutputEvent(`end progress: ${ID}\n`));
        this._cancelledProgressId = undefined;
    }
    createSource(filePath) {
        return new debugadapter_1.Source((0, path_1.basename)(filePath), this.convertDebuggerPathToClient(filePath), undefined, undefined, "ic10-adapter-data");
    }
    getHover(args) {
        let response = args.expression;
        if (args.expression.includes('env')) {
            return this.env;
        }
        try {
            response = String(this.ic10.memory.getValue(args.expression));
        }
        catch (e) {
            try {
                response = String(this.ic10.memory.getDevice(args.expression).properties.PrefabHash);
            }
            catch (e) {
                try {
                    response = String(this.ic10.memory.getRegister(args.expression).value);
                }
                catch (e) {
                }
            }
        }
        return response;
    }
}
exports.ic10DebugSession = ic10DebugSession;
class VariableMap {
    scope;
    map;
    ic10;
    constructor(scope, ic10) {
        this.ic10 = ic10;
        this.scope = scope;
        this.map = {};
    }
    init(id) {
        this.map = {};
        if (id == 'Registers') {
            for (let cellsKey in this.ic10.memory.cells) {
                try {
                    cellsKey = String(cellsKey);
                    const cell = this.ic10.memory.cells[cellsKey];
                    let val = cell.value;
                    let name = cell.name;
                    let alias = this.ic10.memory.aliasesRevert[name] || '';
                    let _name = "";
                    if (alias) {
                        _name = name + `[${alias}]`;
                    }
                    else {
                        _name = name;
                    }
                    this.var2variable(_name, val, id);
                }
                catch (e) {
                }
            }
        }
        if (id == 'Stack') {
            const stack = this.ic10.memory.stack;
            if (stack instanceof MemoryStack_1.MemoryStack) {
                this.var2variable("Stack", stack, id);
            }
        }
        if (["d0", "d1", "d2", "d3", "d4", "d5"].includes(id)) {
            try {
                const device = this.ic10.memory.environ.get(id);
                Object.entries(device.properties).forEach(([name, value]) => {
                    this.var2variable(name, value, id);
                });
                if (Object.keys(device.reagents.Contents).length) {
                    this.map[id][`${id}.Contents`] = {
                        name: `Reagents.Contents`,
                        type: "object",
                        value: `Object`,
                        __vscodeVariableMenuContext: "Object",
                        variablesReference: this.scope._variableHandles.create(`${id}.Contents`),
                    };
                    Object.entries(device.reagents.Contents).map(([key, val]) => {
                        this.var2variable(key, val, `${id}.Contents`);
                    });
                }
                if (Object.keys(device.reagents.Recipe).length) {
                    this.map[id][`${id}.Recipe`] = {
                        name: `Reagents.Recipes`,
                        type: "object",
                        value: `Object`,
                        __vscodeVariableMenuContext: "Object",
                        variablesReference: this.scope._variableHandles.create(`${id}.Recipe`),
                    };
                    Object.entries(device.reagents.Recipe).map(([key, val]) => {
                        this.var2variable(key, val, `${id}.Recipe`);
                    });
                }
                if (Object.keys(device.reagents.Required).length) {
                    this.map[id][`${id}.Required`] = {
                        name: `Reagents.Required`,
                        type: "object",
                        value: `Object`,
                        __vscodeVariableMenuContext: "Object",
                        variablesReference: this.scope._variableHandles.create(`${id}.Required`),
                    };
                    Object.entries(device.reagents.Required).map(([key, val]) => {
                        this.var2variable(key, val, `${id}.Required`);
                    });
                }
                this.var2variable('Slots', device.slots, id);
                for (let i = 0; i < 7; i++) {
                    const channel = device.getChannel(i);
                    this.var2variable(`Output ${i}`, channel, id);
                }
            }
            catch (e) {
                fs.writeFileSync("C:\\projects\\vscode-stationeers-ic10\\test3.json", JSON.stringify(this.ic10.memory.environ), { flag: 'a' });
            }
        }
        if (id === 'Constants') {
            for (const aliasesKey in this.ic10.memory.aliases) {
                if (this.ic10.memory.aliases.hasOwnProperty(aliasesKey)) {
                    try {
                        let val = this.ic10.memory.aliases[aliasesKey];
                        if (val instanceof ConstantCell_1.ConstantCell) {
                            this.var2variable(val.name, val.value, id);
                        }
                    }
                    catch (e) {
                    }
                }
            }
        }
    }
    get(id) {
        try {
            const device = this.ic10.memory.getDevice(id);
            Object.entries(device.properties).forEach(([name, value]) => {
                this.var2variable(name, value, id);
            });
            return this.map[id];
        }
        catch (e) {
        }
        if (id in this.map) {
            return this.map[id];
        }
        return [];
    }
    var2variable(name, value, id, mc = null) {
        if (!(id in this.map)) {
            this.map[id] = {};
        }
        if (value === null) {
            value = 0;
        }
        const type = value.constructor.name;
        if (typeof value === 'number') {
            this.map[id][name] = {
                name: name,
                type: "float",
                value: String(value),
                variablesReference: 0,
                __vscodeVariableMenuContext: mc || "Number",
            };
            return name;
        }
        if ((0, types_1.isDevice)(value) || (0, types_1.isIcHousing)(value)) {
            this.map[id][name] = {
                name: name,
                type: "object",
                value: `Object`,
                __vscodeVariableMenuContext: "Object",
                variablesReference: this.scope._variableHandles.create(name),
            };
            return name;
        }
        if (value instanceof MemoryStack_1.MemoryStack) {
            const arr = value.getStack();
            let b = 0;
            for (const valueKey in arr) {
                if (arr.hasOwnProperty(valueKey)) {
                    let index = `${valueKey}`;
                    if (arr[valueKey]) {
                        this.var2variable(index, arr[valueKey], name);
                    }
                    else {
                        b++;
                        this.var2variable(index, arr[valueKey], 'zero');
                    }
                }
            }
            this.map[id]['zero'] = {
                name: 'zero',
                type: "array",
                value: `Array (${b})`,
                __vscodeVariableMenuContext: "Array",
                variablesReference: this.scope._variableHandles.create('zero'),
            };
        }
        if ((0, types_1.isDeviceOutput)(value)) {
            if (!value.isEmpty()) {
                const arr = value.toArray();
                this.map[id][name] = {
                    name: name,
                    type: "array",
                    value: `Array (${arr.length})`,
                    __vscodeVariableMenuContext: "Array",
                    variablesReference: this.scope._variableHandles.create(name),
                };
                arr.forEach((val, index) => {
                    if (val)
                        this.var2variable(`Channel ${index}`, val, name, mc);
                });
            }
        }
        if (Array.isArray(value)) {
            if (value.length != 0) {
                this.map[id][name] = {
                    name: name,
                    type: "array",
                    value: `Array (${value.length})`,
                    __vscodeVariableMenuContext: "Array",
                    variablesReference: this.scope._variableHandles.create(name),
                };
                for (const valueKey in value) {
                    if (value.hasOwnProperty(valueKey)) {
                        let index = `${valueKey}`;
                        if (!(value[valueKey] instanceof Slot_1.Slot)) {
                            index = `[${valueKey}]`;
                            const stack = this.ic10.memory.cells[16];
                            if (stack instanceof MemoryStack_1.MemoryStack) {
                            }
                        }
                        this.var2variable(index, value[valueKey], name, mc);
                    }
                }
            }
            else {
                this.map[id][name] = {
                    name: name,
                    type: "array",
                    value: "Array (0)",
                    variablesReference: 0,
                    __vscodeVariableMenuContext: "Array",
                };
            }
            return name;
        }
        if ((0, types_1.isSlot)(value)) {
            this.map[id][name] = {
                name: name,
                type: "object",
                value: `Object`,
                __vscodeVariableMenuContext: "Object",
                variablesReference: this.scope._variableHandles.create(name),
            };
            let _arr = Object.keys(value.properties).sort();
            for (const valueKey of _arr) {
                if (value.properties.hasOwnProperty(valueKey)) {
                    this.var2variable(valueKey, value.properties[valueKey], name, "Slot");
                }
            }
            return name;
        }
        if (typeof value === 'string') {
            this.map[id][name] = {
                name: name,
                type: "string",
                value: String(value),
                variablesReference: 0,
                __vscodeVariableMenuContext: mc || "String",
            };
            return name;
        }
        return name;
    }
}
exports.VariableMap = VariableMap;
//# sourceMappingURL=ic10Debug.js.map