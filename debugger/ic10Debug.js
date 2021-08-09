"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ic10DebugSession = void 0;
const vscode_debugadapter_1 = require("vscode-debugadapter");
const path_1 = require("path");
const ic10Runtime_1 = require("./ic10Runtime");
const ic10_1 = require("ic10");
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
class ic10DebugSession extends vscode_debugadapter_1.LoggingDebugSession {
    static threadID = 1;
    _runtime;
    _variableHandles = new vscode_debugadapter_1.Handles();
    _cancelationTokens = new Map();
    _isLongrunning = new Map();
    _reportProgress = false;
    _progressId = 10000;
    _cancelledProgressId = undefined;
    _isProgressCancellable = true;
    _showHex = false;
    _useInvalidatedEvent = false;
    ic10;
    _variables;
    variableMap;
    constructor(fileAccessor) {
        super("ic10-debug.txt");
        this.ic10 = new ic10_1.InterpreterIc10();
        this.variableMap = new VariableMap(this, this.ic10);
        var self = this;
        this.ic10.setSettings({
            debugCallback: function (a, b) {
                this.output.debug = a + ' ' + JSON.stringify(b);
            },
            logCallback: function (a, b) {
                this.output.log = a + ' ' + b;
            },
            executionCallback: function (e) {
                this.output.error = `(${e.code}) - ${e.message}:`;
                if (e.obj) {
                    this.output.error += JSON.stringify(e.obj);
                }
                switch (e.lvl) {
                    case 0:
                        this.output.error = 'ERROR ' + this.output.error;
                        break;
                    case 1:
                        this.output.error = 'WARN ' + this.output.error;
                        break;
                    case 2:
                        this.output.error = 'INFO ' + this.output.error;
                        break;
                    case 3:
                    default:
                        this.output.error = 'LOG ' + this.output.error;
                        break;
                }
            },
        });
        this.setDebuggerLinesStartAt1(false);
        this.setDebuggerColumnsStartAt1(false);
        this._runtime = new ic10Runtime_1.ic10Runtime(fileAccessor, this.ic10);
        this._runtime.on('stopOnEntry', () => {
            this.sendEvent(new vscode_debugadapter_1.StoppedEvent('entry', ic10DebugSession.threadID));
        });
        this._runtime.on('stopOnStep', () => {
            this.sendEvent(new vscode_debugadapter_1.StoppedEvent('step', ic10DebugSession.threadID));
        });
        this._runtime.on('stopOnBreakpoint', () => {
            this.sendEvent(new vscode_debugadapter_1.StoppedEvent('breakpoint', ic10DebugSession.threadID));
        });
        this._runtime.on('stopOnDataBreakpoint', () => {
            this.sendEvent(new vscode_debugadapter_1.StoppedEvent('data breakpoint', ic10DebugSession.threadID));
        });
        this._runtime.on('stopOnException', (exception) => {
            if (exception) {
                this.sendEvent(new vscode_debugadapter_1.StoppedEvent(`exception(${exception})`, ic10DebugSession.threadID));
            }
            else {
                this.sendEvent(new vscode_debugadapter_1.StoppedEvent('exception', ic10DebugSession.threadID));
            }
        });
        this._runtime.on('breakpointValidated', (bp) => {
            this.sendEvent(new vscode_debugadapter_1.BreakpointEvent('changed', {
                verified: bp.verified,
                id: bp.id
            }));
        });
        this._runtime.on('output', (text, filePath, line, column) => {
            const e = new vscode_debugadapter_1.OutputEvent(`${text}\n`);
            if (text === 'start' || text === 'startCollapsed' || text === 'end') {
                e.body.group = text;
                e.body.output = `group-${text}\n`;
            }
            e.body.source = this.createSource(filePath);
            e.body.line = this.convertDebuggerLineToClient(line);
            e.body.column = this.convertDebuggerColumnToClient(column);
            this.sendEvent(e);
        });
        this._runtime.on('end', () => {
            this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
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
                filter: 'namedException',
                label: "Named Exception",
                description: `Break on named exceptions. Enter the exception's name as the Condition.`,
                default: false,
                supportsCondition: true,
                conditionDescription: `Enter the exception's name`
            },
            {
                filter: 'otherExceptions',
                label: "Other Exceptions",
                description: 'This is a other exception',
                default: true,
                supportsCondition: false
            }
        ];
        response.body.supportsExceptionInfoRequest = true;
        this.sendResponse(response);
        this.sendEvent(new vscode_debugadapter_1.InitializedEvent());
    }
    configurationDoneRequest(response, args) {
        super.configurationDoneRequest(response, args);
    }
    async launchRequest(response, args) {
        vscode_debugadapter_1.logger.setup(args.trace ? vscode_debugadapter_1.Logger.LogLevel.Verbose : vscode_debugadapter_1.Logger.LogLevel.Stop, false);
        await this._runtime.start(args.program, !!args.stopOnEntry, !!args.noDebug);
        this.sendResponse(response);
    }
    async setBreakPointsRequest(response, args) {
        const path = args.source.path;
        const clientLines = args.lines || [];
        this._runtime.clearBreakpoints(path);
        const actualBreakpoints0 = clientLines.map(async (l) => {
            const { verified, line, id } = await this._runtime.setBreakPoint(path, this.convertClientLineToDebugger(l));
            const bp = new vscode_debugadapter_1.Breakpoint(verified, this.convertDebuggerLineToClient(line));
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
                    case 'namedException':
                        namedException = args.filterOptions[0].condition;
                        break;
                    case 'otherExceptions':
                        otherExceptions = true;
                        break;
                }
            }
        }
        if (args.filters) {
            if (args.filters.indexOf('otherExceptions') >= 0) {
                otherExceptions = true;
            }
        }
        this._runtime.setExceptionsFilters(namedException, otherExceptions);
        this.sendResponse(response);
    }
    exceptionInfoRequest(response, args) {
        response.body = {
            exceptionId: 'Exception ID',
            description: 'This is a descriptive description of the exception.',
            breakMode: 'always',
            details: {
                message: 'Message contained in the exception.',
                typeName: 'Short type name of the exception object',
                stackTrace: 'stack frame 1\nstack frame 2',
            }
        };
        this.sendResponse(response);
    }
    threadsRequest(response) {
        response.body = {
            threads: [
                new vscode_debugadapter_1.Thread(ic10DebugSession.threadID, "thread 1")
            ]
        };
        this.sendResponse(response);
    }
    stackTraceRequest(response, args) {
        const startFrame = typeof args.startFrame === 'number' ? args.startFrame : 0;
        const maxLevels = typeof args.levels === 'number' ? args.levels : 1000;
        const endFrame = startFrame + maxLevels;
        const stk = this._runtime.stack(startFrame, endFrame);
        response.body = {
            stackFrames: stk.frames.map(f => {
                const sf = new vscode_debugadapter_1.StackFrame(f.index, f.name, this.createSource(f.file), this.convertDebuggerLineToClient(f.line));
                if (typeof f.column === 'number') {
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
                new vscode_debugadapter_1.Scope("Local", this._variableHandles.create("local"), false),
                new vscode_debugadapter_1.Scope("Global", this._variableHandles.create("global"), true)
            ]
        };
        this.sendResponse(response);
    }
    async variablesRequest(response, args, request) {
        const id = this._variableHandles.get(args.variablesReference);
        if (id) {
            if (id == "local" || id == "global") {
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
        if (args.context === 'repl') {
            const matches = /new +([0-9]+)/.exec(args.expression);
            if (matches && matches.length === 2) {
                const mbp = await this._runtime.setBreakPoint(this._runtime.sourceFile, this.convertClientLineToDebugger(parseInt(matches[1])));
                const bp = new vscode_debugadapter_1.Breakpoint(mbp.verified, this.convertDebuggerLineToClient(mbp.line), undefined, this.createSource(this._runtime.sourceFile));
                bp.id = mbp.id;
                this.sendEvent(new vscode_debugadapter_1.BreakpointEvent('new', bp));
                reply = `breakpoint created`;
            }
            else {
                const matches = /del +([0-9]+)/.exec(args.expression);
                if (matches && matches.length === 2) {
                    const mbp = this._runtime.clearBreakPoint(this._runtime.sourceFile, this.convertClientLineToDebugger(parseInt(matches[1])));
                    if (mbp) {
                        const bp = new vscode_debugadapter_1.Breakpoint(false);
                        bp.id = mbp.id;
                        this.sendEvent(new vscode_debugadapter_1.BreakpointEvent('removed', bp));
                        reply = `breakpoint deleted`;
                    }
                }
                else {
                    const matches = /progress/.exec(args.expression);
                    if (matches && matches.length === 1) {
                        if (this._reportProgress) {
                            reply = `progress started`;
                            this.progressSequence();
                        }
                        else {
                            reply = `frontend doesn't support progress (capability 'supportsProgressReporting' not set)`;
                        }
                    }
                }
            }
        }
        if (args.context === 'hover') {
            reply = this.getHover(args);
        }
        response.body = {
            result: reply,
            variablesReference: 0
        };
        this.sendResponse(response);
    }
    async progressSequence() {
        const ID = '' + this._progressId++;
        await timeout(100);
        const title = this._isProgressCancellable ? 'Cancellable operation' : 'Long running operation';
        const startEvent = new vscode_debugadapter_1.ProgressStartEvent(ID, title);
        startEvent.body.cancellable = this._isProgressCancellable;
        this._isProgressCancellable = !this._isProgressCancellable;
        this.sendEvent(startEvent);
        this.sendEvent(new vscode_debugadapter_1.OutputEvent(`start progress: ${ID}\n`));
        let endMessage = 'progress ended';
        for (let i = 0; i < 100; i++) {
            await timeout(500);
            this.sendEvent(new vscode_debugadapter_1.ProgressUpdateEvent(ID, `progress: ${i}`));
            if (this._cancelledProgressId === ID) {
                endMessage = 'progress cancelled';
                this._cancelledProgressId = undefined;
                this.sendEvent(new vscode_debugadapter_1.OutputEvent(`cancel progress: ${ID}\n`));
                break;
            }
        }
        this.sendEvent(new vscode_debugadapter_1.ProgressEndEvent(ID, endMessage));
        this.sendEvent(new vscode_debugadapter_1.OutputEvent(`end progress: ${ID}\n`));
        this._cancelledProgressId = undefined;
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
                response.body.accessTypes = ["write"];
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
            const dataId = dbp.dataId + `_${dbp.accessType ? dbp.accessType : 'write'}`;
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
            this._cancelationTokens.set(args.requestId, true);
        }
        if (args.progressId) {
            this._cancelledProgressId = args.progressId;
        }
    }
    customRequest(command, response, args) {
        command = command.trim();
        if (['ic10.debug.variables.write', 'ic10.debug.device.write', 'ic10.debug.device.slot.write', 'ic10.debug.stack.push', 'ic10.debug.remove.push'].indexOf(command) >= 0) {
            try {
                var regex = /(.+)\[.+\]/gm;
                var name = regex.exec(args.variable.variable.name);
                if (name) {
                    args.variableName = name[1];
                }
                else {
                    args.variableName = args.variable.variable.name;
                }
                var container = regex.exec(args.variable.container.name);
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
        switch (command) {
            case 'ic10.debug.variables.write':
                try {
                    this.ic10.memory.cell(args.variableName, Number(args.value));
                }
                catch (e) {
                    this.sendEvent(new vscode_debugadapter_1.InvalidatedEvent(['variables']));
                }
                break;
            case 'ic10.debug.device.write':
                try {
                    var device = regex.exec(args.variable.container.name);
                    args.debug = device;
                    this.ic10.memory.cell(args.containerName, args.variableName, Number(args.value));
                }
                catch (e) {
                    this.sendEvent(new vscode_debugadapter_1.InvalidatedEvent(['variables']));
                }
                break;
            case 'ic10.debug.device.slot.write':
                break;
            case 'ic10.debug.stack.push':
                break;
            case 'ic10.debug.remove.push':
                break;
            default:
                super.customRequest(command, response, args);
                break;
        }
        this.sendResponse(response);
    }
    createSource(filePath) {
        return new vscode_debugadapter_1.Source(path_1.basename(filePath), this.convertDebuggerPathToClient(filePath), undefined, undefined, 'ic10-adapter-data');
    }
    getHover(args) {
        var response = args.expression;
        try {
            response = String(this.ic10.memory.cell(args.expression));
        }
        catch (e) {
        }
        return response;
    }
}
exports.ic10DebugSession = ic10DebugSession;
class VariableMap {
    map;
    ic10;
    counter = 1000;
    scope;
    constructor(scope, ic10) {
        this.ic10 = ic10;
        this.scope = scope;
        this.map = {};
    }
    init(id) {
        this.map = new Object;
        for (var cellsKey in this.ic10.memory.cells) {
            try {
                cellsKey = String(cellsKey);
                let val = this.ic10.memory.cells[cellsKey].get();
                let alias = this.ic10.memory.cells[cellsKey].alias;
                let name = this.ic10.memory.cells[cellsKey].name;
                let _name = '';
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
        var stack = this.ic10.memory.cells[16];
        if (stack instanceof ic10_1.MemoryStack) {
            this.var2variable('Stack', stack.getStack(), id);
        }
        for (var environKey in this.ic10.memory.environ) {
            if (this.ic10.memory.environ.hasOwnProperty(environKey)) {
                try {
                    let val = this.ic10.memory.environ[environKey];
                    let alias = val.alias;
                    let name = val.name;
                    let _name = '';
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
        for (var aliasesKey in this.ic10.memory.aliases) {
            if (this.ic10.memory.aliases.hasOwnProperty(aliasesKey)) {
                try {
                    let val = this.ic10.memory.aliases[aliasesKey];
                    let name = String(val.name);
                    if (val instanceof ic10_1.ConstantCell) {
                        this.var2variable(name, val.get(), id);
                    }
                }
                catch (e) {
                }
            }
        }
    }
    get(id) {
        return this.map[id];
    }
    var2variable(name, value, id, mc = null) {
        if (!(id in this.map)) {
            this.map[id] = new Object;
        }
        if (value === null) {
            value = 0;
        }
        var type = value.constructor.name;
        switch (type) {
            case "String":
                this.map[id][name] = {
                    name: name,
                    type: "string",
                    value: String(value),
                    variablesReference: 0,
                    __vscodeVariableMenuContext: mc || "String",
                };
                return name;
            case "Number":
                this.map[id][name] = {
                    name: name,
                    type: "float",
                    value: String(value),
                    variablesReference: 0,
                    __vscodeVariableMenuContext: mc || "Number",
                };
                return name;
            case "Array":
                if (value.length != 0) {
                    this.map[id][name] = {
                        name: name,
                        type: 'array',
                        value: `Array (${value.length})`,
                        __vscodeVariableMenuContext: "Array",
                        variablesReference: this.scope._variableHandles.create(name),
                    };
                    for (const valueKey in value) {
                        if (value.hasOwnProperty(valueKey)) {
                            var index = `[${valueKey}]`;
                            var stack = this.ic10.memory.cells[16];
                            if (stack instanceof ic10_1.MemoryStack) {
                                if (parseInt(valueKey) == parseInt(String(stack.get()))) {
                                    index = `(${valueKey})`;
                                }
                            }
                            this.var2variable(index, value[valueKey], name, mc);
                        }
                    }
                }
                else {
                    this.map[id][name] = {
                        name: name,
                        type: 'array',
                        value: 'Array (0)',
                        variablesReference: 0,
                        __vscodeVariableMenuContext: "Array",
                    };
                }
                return name;
            case "Device":
            case "Chip":
                this.map[id][name] = {
                    name: name,
                    type: 'object',
                    value: `Object`,
                    __vscodeVariableMenuContext: "Object",
                    variablesReference: this.scope._variableHandles.create(name),
                };
                let arr = Object.keys(value.properties).sort();
                for (const valueKey of arr) {
                    if (value.properties.hasOwnProperty(valueKey)) {
                        this.var2variable(valueKey, value.properties[valueKey], name, 'Device');
                    }
                }
                return name;
            case "Slot":
                this.map[id][name] = {
                    name: name,
                    type: 'object',
                    value: `Object`,
                    __vscodeVariableMenuContext: "Object",
                    variablesReference: this.scope._variableHandles.create(name),
                };
                let _arr = Object.keys(value.properties).sort();
                for (const valueKey of _arr) {
                    if (value.properties.hasOwnProperty(valueKey)) {
                        this.var2variable(valueKey, value.properties[valueKey], name, 'Slot');
                    }
                }
                return name;
            default:
                return name;
        }
    }
}
//# sourceMappingURL=ic10Debug.js.map