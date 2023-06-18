/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
import {
    Breakpoint,
    BreakpointEvent,
    Handles,
    InitializedEvent,
    InvalidatedEvent,
    Logger,
    logger,
    LoggingDebugSession,
    OutputEvent,
    ProgressEndEvent,
    ProgressStartEvent,
    ProgressUpdateEvent,
    Scope,
    Source,
    StackFrame,
    StoppedEvent,
    TerminatedEvent,
    Thread
} from "@vscode/debugadapter"
import {DebugProtocol} from "@vscode/debugprotocol"
import {basename} from "path"
import {FileAccessor, ic10Runtime, Iic10Breakpoint} from "./ic10Runtime"
import {Ic10Error} from "ic10/src/Ic10Error"
import {InterpreterIc10} from "ic10"
import {MemoryStack} from "ic10/src/MemoryStack"
import {ConstantCell} from "ic10/src/ConstantCell"
import {Slot} from "ic10/src/Slot"
import {RegisterCell} from "ic10/src/RegisterCell"
import {isDevice, isDeviceOutput, isIcHousing, isSlot} from "ic10/src/types";
import {DeviceOutput} from "ic10/src/DeviceOutput";
import {Device} from "ic10/src/devices/Device";
import {parseEnvironment} from "./utils";
import {IcHousing} from "ic10/src/devices/IcHousing";

function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * This interface describes the ic10-debug specific launch attributes
 * (which are not part of the Debug Adapter Protocol).
 * The schema for these attributes lives in the package.json of the ic10-debug extension.
 * The interface should always match this schema.
 */
interface ILaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
    /** An absolute path to the "program" to debug. */
    program: string;
    /** Automatically stop target after launch. If not specified, target does not stop. */
    stopOnEntry?: boolean;
    /** enable logging the Debug Adapter Protocol */
    trace?: boolean;
    /** run without debugging */
    noDebug?: boolean;
}

export class ic10DebugSession extends LoggingDebugSession {

    // we don't support multiple threads, so we can use a hardcoded ID for the default thread
    private static threadID = 1
    public _variableHandles = new Handles<string>()
    variableMap: VariableMap
    // a ic10 runtime (or debugger)
    private _runtime: ic10Runtime
    private _cancelActionTokens = new Map<number, boolean>()
    private _reportProgress = false
    private _progressId = 10000
    private _cancelledProgressId: string | undefined = undefined
    private _isProgressCancellable = true
    private _useInvalidatedEvent = false
    private readonly ic10: InterpreterIc10

    /**
     * Creates a new debug adapter that is used for one debug session.
     * We configure the default implementation of a debug adapter here.
     */
    public constructor(fileAccessor: FileAccessor) {
        super("ic10-debug.txt")
        this.ic10 = new InterpreterIc10()
        this.variableMap = new VariableMap(this, this.ic10)
        this.ic10.setSettings({
            executionCallback: function (e: Ic10Error) {
                // this.output.error = `[${e.functionName}:${e.line}] (${e.code}) - ${e.message}:`
                this.output.error = `${e.message}:`
                if (e.obj) {
                    this.output.error += JSON.stringify(e.obj)
                }
                switch (e.lvl) {
                    case 0:
                        this.output.error = "ERROR " + this.output.error
                        break
                    case 1:
                        this.output.error = "WARN " + this.output.error
                        break
                    case 2:
                        this.output.error = "INFO " + this.output.error
                        break
                    case 3:
                    default:
                        this.output.error = "LOG " + this.output.error
                        break

                }
            },
        })
        // this debugger uses zero-based lines and columns
        this.setDebuggerLinesStartAt1(false)
        this.setDebuggerColumnsStartAt1(false)

        this._runtime = new ic10Runtime(fileAccessor, this.ic10)

        // setup event handlers
        this._runtime.on("stopOnEntry", () => {
            this.sendEvent(new StoppedEvent("entry", ic10DebugSession.threadID))
        })
        this._runtime.on("stopOnStep", () => {
            this.sendEvent(new StoppedEvent("step", ic10DebugSession.threadID))
        })
        this._runtime.on("stopOnBreakpoint", () => {
            this.sendEvent(new StoppedEvent("breakpoint", ic10DebugSession.threadID))
        })
        this._runtime.on("stopOnDataBreakpoint", () => {
            this.sendEvent(new StoppedEvent("data breakpoint", ic10DebugSession.threadID))
        })
        this._runtime.on("stopOnException", (exception) => {
            if (exception) {
                this.sendEvent(new StoppedEvent(`exception(${exception})`, ic10DebugSession.threadID))
            } else {
                this.sendEvent(new StoppedEvent("exception", ic10DebugSession.threadID))
            }
        })
        this._runtime.on("breakpointValidated", (bp: Iic10Breakpoint) => {
            this.sendEvent(new BreakpointEvent("changed", {
                verified: bp.verified,
                id: bp.id
            } as DebugProtocol.Breakpoint))
        })
        this._runtime.on("output", (text, filePath, line, column) => {
            const e: DebugProtocol.OutputEvent = new OutputEvent(`${text}\n`)

            if (text === "start" || text === "startCollapsed" || text === "end") {
                e.body.group = text
                e.body.output = `group-${text}\n`
            }

            e.body.source = this.createSource(filePath)
            e.body.line = this.convertDebuggerLineToClient(line)
            e.body.column = this.convertDebuggerColumnToClient(column)
            this.sendEvent(e)
        })
        this._runtime.on("end", () => {
            this.sendEvent(new TerminatedEvent())
        })
    }

    /**
     * The 'initialize' request is the first request called by the frontend
     * to interrogate the features the debug adapter provides.
     */
    protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {

        if (args.supportsProgressReporting) {
            this._reportProgress = true
        }
        if (args.supportsInvalidatedEvent) {
            this._useInvalidatedEvent = true
        }

        // build and return the capabilities of this debug adapter:
        response.body = response.body || {}

        // the adapter implements the configurationDoneRequest.
        response.body.supportsConfigurationDoneRequest = true

        // make VS Code use 'evaluate' when hovering over source
        response.body.supportsEvaluateForHovers = true

        // make VS Code show a 'step back' button
        response.body.supportsStepBack = true

        // make VS Code support data breakpoints
        response.body.supportsDataBreakpoints = true

        // make VS Code support completion in REPL
        response.body.supportsCompletionsRequest = true
        response.body.completionTriggerCharacters = [".", "["]

        // make VS Code send cancelRequests
        response.body.supportsCancelRequest = true

        // make VS Code send the breakpointLocations request
        response.body.supportsBreakpointLocationsRequest = true

        // make VS Code provide "Step in Target" functionality
        response.body.supportsStepInTargetsRequest = true

        // the adapter defines two exceptions filters, one with support for conditions.
        response.body.supportsExceptionFilterOptions = true
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
        ]

        // make VS Code send exceptionInfoRequests
        response.body.supportsExceptionInfoRequest = true

        this.sendResponse(response)

        // since this debug adapter can accept configuration requests like 'setBreakpoint' at any time,
        // we request them early by sending an 'initializeRequest' to the frontend.
        // The frontend will end the configuration sequence by calling 'configurationDone' request.
        this.sendEvent(new InitializedEvent())
    }

    /**
     * Called at the end of the configuration sequence.
     * Indicates that all breakpoints etc. have been sent to the DA and that the 'launch' can start.
     */
    protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments): void {
        super.configurationDoneRequest(response, args)

        // notify the launchRequest that configuration has finished
    }

    protected async launchRequest(response: DebugProtocol.LaunchResponse, args: ILaunchRequestArguments) {

        // make sure to 'Stop' the buffered logging if 'trace' is not set
        logger.setup(args.trace ? Logger.LogLevel.Verbose : Logger.LogLevel.Stop, false)
        parseEnvironment(this.ic10, args.program)

        await this._runtime.start(args.program, !!args.stopOnEntry, !!args.noDebug)

        this.sendResponse(response)
    }

    protected async setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments): Promise<void> {

        const path = args.source.path as string
        const clientLines = args.lines || []

        // clear all breakpoints for this file
        this._runtime.clearBreakpoints(path)

        // set and verify breakpoint locations
        const actualBreakpoints0 = clientLines.map(async l => {
            const {verified, line, id} = await this._runtime.setBreakPoint(path, this.convertClientLineToDebugger(l))
            const bp = new Breakpoint(verified, this.convertDebuggerLineToClient(line)) as DebugProtocol.Breakpoint
            bp.id = id
            return bp
        })
        const actualBreakpoints = await Promise.all<DebugProtocol.Breakpoint>(actualBreakpoints0)

        // send back the actual breakpoint positions
        response.body = {
            breakpoints: actualBreakpoints
        }
        this.sendResponse(response)
    }

    protected breakpointLocationsRequest(response: DebugProtocol.BreakpointLocationsResponse, args: DebugProtocol.BreakpointLocationsArguments, request?: DebugProtocol.Request): void {

        if (args.source.path) {
            const bps = this._runtime.getBreakpoints(args.source.path, this.convertClientLineToDebugger(args.line))
            response.body = {
                breakpoints: bps.map(col => {
                    return {
                        line: args.line,
                        column: this.convertDebuggerColumnToClient(col)
                    }
                })
            }
        } else {
            response.body = {
                breakpoints: []
            }
        }
        this.sendResponse(response)
    }

    protected async setExceptionBreakPointsRequest(response: DebugProtocol.SetExceptionBreakpointsResponse, args: DebugProtocol.SetExceptionBreakpointsArguments): Promise<void> {

        let namedException: string | undefined = undefined
        let otherExceptions = false

        if (args.filterOptions) {
            for (const filterOption of args.filterOptions) {
                switch (filterOption.filterId) {
                    case "namedException":
                        namedException = args.filterOptions[0].condition
                        break
                    case "otherExceptions":
                        otherExceptions = true
                        break
                }
            }
        }

        if (args.filters) {
            if (args.filters.indexOf("otherExceptions") >= 0) {
                otherExceptions = true
            }
        }

        this._runtime.setExceptionsFilters(namedException, otherExceptions)

        this.sendResponse(response)
    }

    protected exceptionInfoRequest(response: DebugProtocol.ExceptionInfoResponse, args: DebugProtocol.ExceptionInfoArguments) {
        response.body = {
            exceptionId: "Exception ID",
            description: "This is a descriptive description of the exception.",
            breakMode: "always",
            details: {
                message: "Message contained in the exception.",
                typeName: "Short type name of the exception object",
                stackTrace: "stack frame 1\nstack frame 2",
            }
        }
        this.sendResponse(response)
    }

    protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {

        // runtime supports no threads so just return a default thread.
        response.body = {
            threads: [
                new Thread(ic10DebugSession.threadID, "thread 1")
            ]
        }
        this.sendResponse(response)
    }

    protected stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments): void {

        const startFrame = typeof args.startFrame === "number" ? args.startFrame : 0
        const maxLevels = typeof args.levels === "number" ? args.levels : 1000
        const endFrame = startFrame + maxLevels

        const stk = this._runtime.stack(startFrame, endFrame)

        response.body = {
            stackFrames: stk.frames.map(f => {
                const sf = new StackFrame(f.index, f.name, this.createSource(f.file), this.convertDebuggerLineToClient(f.line))
                if (typeof f.column === "number") {
                    sf.column = this.convertDebuggerColumnToClient(f.column)
                }
                return sf
            }),
            //no totalFrames: 				// VS Code has to probe/guess. Should result in a max. of two requests
            totalFrames: stk.count			// stk.count is the correct size, should result in a max. of two requests
            //totalFrames: 1000000 			// not the correct size, should result in a max. of two requests
            //totalFrames: endFrame + 20 	// dynamically increases the size with every requested chunk, results in paging
        }
        this.sendResponse(response)
    }

    protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments): void {

        response.body = {
            scopes: [
                new Scope("Constants", this._variableHandles.create("Constants"), false),
                new Scope("Registers", this._variableHandles.create("Registers"), true),
                new Scope("Stack", this._variableHandles.create("Stack"), true),
            ]
        }
        let db = 'DB [Socket]'
        if (!this.ic10?.memory.environ.get('db')) {
            db = `🟡 ${db}`
        } else if (this.ic10?.memory.environ.get('db').properties.Error > 0) {
            db = `🔴 ${db}`
        } else {
            db = `🟢 ${db}`
        }
        response.body.scopes.push(new Scope(db, this._variableHandles.create('db'), true))

        const dd = {
            'd0': this.ic10.memory.environ.d0 || null,
            'd1': this.ic10.memory.environ.d1 || null,
            'd2': this.ic10.memory.environ.d2 || null,
            'd3': this.ic10.memory.environ.d3 || null,
            'd4': this.ic10.memory.environ.d4 || null,
            'd5': this.ic10.memory.environ.d5 || null,
        }
        for (const ddKey in dd) {
            let name = ddKey
            if (dd[ddKey]) {
                name = '⚪ ' + ddKey
            } else {
                name = '⚫ ' + ddKey
            }
            response.body.scopes.push(new Scope(name, this._variableHandles.create(ddKey), true))
        }
        this.sendResponse(response)

    }

    protected async variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments, request?: DebugProtocol.Request) {
        const id = this._variableHandles.get(args.variablesReference)
        if (id) {
            if (["Constants", "Registers", "Devices", "Stack", "d0", "d1", "d2", "d3", "d4", "d5", "db"].includes(id)) {
                this.variableMap.init(id)
            }
            response.body = {
                variables: Object.values(this.variableMap.get(id))
            }
            this.sendResponse(response)
        } else {
            response.body = {
                variables: []
            }
            this.sendResponse(response)
        }
    }

    protected continueRequest(response: DebugProtocol.ContinueResponse, args: DebugProtocol.ContinueArguments): void {
        this._runtime.continue()
        this.sendResponse(response)
    }

    protected reverseContinueRequest(response: DebugProtocol.ReverseContinueResponse, args: DebugProtocol.ReverseContinueArguments): void {
        this._runtime.continue(true)
        this.sendResponse(response)
    }

    protected nextRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments): void {
        this._runtime.step()
        this.sendResponse(response)
    }

    protected stepBackRequest(response: DebugProtocol.StepBackResponse, args: DebugProtocol.StepBackArguments): void {
        this._runtime.step(true)
        this.sendResponse(response)
    }

    protected stepInTargetsRequest(response: DebugProtocol.StepInTargetsResponse, args: DebugProtocol.StepInTargetsArguments) {
        const targets = this._runtime.getStepInTargets(args.frameId)
        response.body = {
            targets: targets.map(t => {
                return {id: t.id, label: t.label}
            })
        }
        this.sendResponse(response)
    }

    protected stepInRequest(response: DebugProtocol.StepInResponse, args: DebugProtocol.StepInArguments): void {
        this._runtime.stepIn(args.targetId)
        this.sendResponse(response)
    }

    protected stepOutRequest(response: DebugProtocol.StepOutResponse, args: DebugProtocol.StepOutArguments): void {
        this._runtime.stepOut()
        this.sendResponse(response)
    }

    protected async evaluateRequest(response: DebugProtocol.EvaluateResponse, args: DebugProtocol.EvaluateArguments): Promise<void> {

        let reply: string | undefined = undefined

        if (args.context === "repl") {
            // 'evaluate' supports to create and delete breakpoints from the 'repl':
            const matches = /new +(\d+)/.exec(args.expression)
            if (matches && matches.length === 2) {
                const mbp = await this._runtime.setBreakPoint(this._runtime.sourceFile, this.convertClientLineToDebugger(parseInt(matches[1])))
                const bp = new Breakpoint(mbp.verified, this.convertDebuggerLineToClient(mbp.line), undefined, this.createSource(this._runtime.sourceFile)) as DebugProtocol.Breakpoint
                bp.id = mbp.id
                this.sendEvent(new BreakpointEvent("new", bp))
                reply = `breakpoint created`
            } else {
                const matches = /del +(\d+)/.exec(args.expression)
                if (matches && matches.length === 2) {
                    const mbp = this._runtime.clearBreakPoint(this._runtime.sourceFile, this.convertClientLineToDebugger(parseInt(matches[1])))
                    if (mbp) {
                        const bp = new Breakpoint(false) as DebugProtocol.Breakpoint
                        bp.id = mbp.id
                        this.sendEvent(new BreakpointEvent("removed", bp))
                        reply = `breakpoint deleted`
                    }
                } else {
                    const matches = /progress/.exec(args.expression)
                    if (matches && matches.length === 1) {
                        if (this._reportProgress) {
                            reply = `progress started`
                            await this.progressSequence()
                        } else {
                            reply = `frontend doesn't support progress (capability 'supportsProgressReporting' not set)`
                        }
                    }
                }
            }
        }

        if (args.context === "hover") {
            reply = this.getHover(args)
        }

        response.body = {
            result: reply,
            variablesReference: 0
        }
        this.sendResponse(response)
    }

    protected dataBreakpointInfoRequest(response: DebugProtocol.DataBreakpointInfoResponse, args: DebugProtocol.DataBreakpointInfoArguments): void {

        response.body = {
            dataId: null,
            description: "cannot break on data access",
            accessTypes: undefined,
            canPersist: false
        }

        if (args.variablesReference && args.name) {
            const id = this._variableHandles.get(args.variablesReference)
            if (id === "global") {
                response.body.dataId = args.name
                response.body.description = args.name
                response.body.accessTypes = ["read", "write", "readWrite"]
                response.body.canPersist = true
            } else {
                response.body.dataId = args.name
                response.body.description = args.name
                response.body.accessTypes = ["read", "write", "readWrite"]
                response.body.canPersist = true
            }
        }

        this.sendResponse(response)
    }

    protected setDataBreakpointsRequest(response: DebugProtocol.SetDataBreakpointsResponse, args: DebugProtocol.SetDataBreakpointsArguments): void {

        // clear all data breakpoints
        this._runtime.clearAllDataBreakpoints()

        response.body = {
            breakpoints: []
        }

        for (const dbp of args.breakpoints) {
            // assume that id is the "address" to break on
            const dataId = dbp.dataId + `_${dbp.accessType ? dbp.accessType : "write"}`
            const ok = this._runtime.setDataBreakpoint(dataId)
            response.body.breakpoints.push({
                verified: ok
            })
        }

        this.sendResponse(response)
    }

    protected completionsRequest(response: DebugProtocol.CompletionsResponse, args: DebugProtocol.CompletionsArguments): void {

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
        }
        this.sendResponse(response)
    }

    protected cancelRequest(response: DebugProtocol.CancelResponse, args: DebugProtocol.CancelArguments) {
        if (args.requestId) {
            this._cancelActionTokens.set(args.requestId, true)
        }
        if (args.progressId) {
            this._cancelledProgressId = args.progressId
        }
    }

    protected customRequest(command: string, response: DebugProtocol.Response, args: any) {
        const regex = /(.+)\[.+]/gm
        command = command.trim()

        if (["ic10.debug.variables.write",
            "ic10.debug.device.write",
            "ic10.debug.device.slot.write",
            "ic10.debug.stack.push",
            "ic10.debug.remove.push"].indexOf(command) >= 0) {
            try {
                const name = regex.exec(args.variable.variable.name)
                if (name) {
                    args.variableName = name[1]
                } else {
                    args.variableName = args.variable.variable.name
                }
                const container = regex.exec(args.variable.container.name)
                if (container) {
                    args.containerName = container[1]
                } else {
                    args.containerName = args.variable.container.name
                }
            } catch (e) {
            }
        }

        const containerName = args.containerName.replace('🟢', '').replace('🔴', '').replace('🟡', '').replace('⚪', '').replace('⚫', '').trim().toLowerCase()
        args.containerName = containerName
        // fs.writeFileSync(`C:\\projects\\vscode-stationeers-ic10\\${command}.json`, JSON.stringify(args))
        switch (command) {
            case "ic10.debug.variables.write":
                try {
                    switch (containerName) {
                        case 'registers':
                            this.ic10.memory.getRegister(args.variableName).value = Number(args.value)
                            break;
                        case 'db':
                        case 'd0':
                        case 'd1':
                        case 'd2':
                        case 'd3':
                        case 'd4':
                        case 'd5':
                            this.ic10.memory.environ.get(containerName).set(args.variableName, Number(args.value))
                            break;
                        case 'zero':
                            this.ic10.memory.stack.getStack()[args.variableName] = Number(args.value)
                            break;
                        case 'constants':
                            this.ic10.memory.define(args.variableName, Number(args.value))
                            break;

                    }
                } catch (e) {
                    this.sendEvent(new InvalidatedEvent(["variables"]))
                }
                break
            default:
                super.customRequest(command, response, args)
                break
        }
        this.sendResponse(response)
    }

    private async progressSequence() {

        const ID = "" + this._progressId++

        await timeout(100)

        const title = this._isProgressCancellable ? "Cancellable operation" : "Long running operation"
        const startEvent: DebugProtocol.ProgressStartEvent = new ProgressStartEvent(ID, title)
        startEvent.body.cancellable = this._isProgressCancellable
        this._isProgressCancellable = !this._isProgressCancellable
        this.sendEvent(startEvent)
        this.sendEvent(new OutputEvent(`start progress: ${ID}\n`))

        let endMessage = "progress ended"

        for (let i = 0; i < 100; i++) {
            await timeout(500)
            this.sendEvent(new ProgressUpdateEvent(ID, `progress: ${i}`))
            if (this._cancelledProgressId === ID) {
                endMessage = "progress cancelled"
                this._cancelledProgressId = undefined
                this.sendEvent(new OutputEvent(`cancel progress: ${ID}\n`))
                break
            }
        }
        this.sendEvent(new ProgressEndEvent(ID, endMessage))
        this.sendEvent(new OutputEvent(`end progress: ${ID}\n`))

        this._cancelledProgressId = undefined
    }

    //---- helpers

    private createSource(filePath: string): Source {
        return new Source(basename(filePath), this.convertDebuggerPathToClient(filePath), undefined, undefined, "ic10-adapter-data")
    }

    private getHover(args: DebugProtocol.EvaluateArguments) {
        let response = args.expression

        try {
            response = String(this.ic10.memory.getValue(args.expression))
        } catch (e) {
            try {
                response = String(this.ic10.memory.getDevice(args.expression).properties.PrefabHash)
            } catch (e) {
                try {
                    response = String(this.ic10.memory.getRegister(args.expression).value)
                } catch (e) {

                }
            }
        }
        return response
    }

}

export class VariableMap {
    scope: ic10DebugSession
    private map: object
    private ic10: InterpreterIc10

    constructor(scope: ic10DebugSession, ic10: InterpreterIc10) {
        this.ic10 = ic10
        this.scope = scope
        this.map = {}
    }

    init(id: string) {
        this.map = {}
        if (id == 'Registers') {
            for (let cellsKey in this.ic10.memory.cells) {
                try {
                    cellsKey = String(cellsKey)
                    const cell = this.ic10.memory.cells[cellsKey]
                    let val = cell.value
                    let name = cell.name
                    let alias = this.ic10.memory.aliasesRevert[name] || ''
                    let _name = ""
                    if (alias) {
                        _name = name + `[${alias}]`
                    } else {
                        _name = name
                    }
                    this.var2variable(_name, val, id)
                } catch (e) {

                }
            }
        }
        if (id == 'Stack') {
            const stack: MemoryStack = this.ic10.memory.stack
            if (stack instanceof MemoryStack) {
                this.var2variable("Stack", stack, id)
            }
        }
        if (["db","d0", "d1", "d2", "d3", "d4", "d5"].includes(id)) {
            try {
                const device = this.ic10.memory.getDevice(id)
                Object.entries(device.properties).forEach(([name, value]) => {
                    this.var2variable(name, value, id)
                })
                if (Object.keys(device.reagents.Contents).length) {
                    this.map[id][`${id}.Contents`] = {
                        name: `Reagents.Contents`,
                        type: "object",
                        value: `Object`,
                        __vscodeVariableMenuContext: "Object",
                        variablesReference: this.scope._variableHandles.create(`${id}.Contents`),
                    } as DebugProtocol.Variable
                    Object.entries(device.reagents.Contents).map(([key, val]) => {
                        this.var2variable(key, val, `${id}.Contents`)
                    })
                }
                if (Object.keys(device.reagents.Recipe).length) {
                    this.map[id][`${id}.Recipe`] = {
                        name: `Reagents.Recipes`,
                        type: "object",
                        value: `Object`,
                        __vscodeVariableMenuContext: "Object",
                        variablesReference: this.scope._variableHandles.create(`${id}.Recipe`),
                    } as DebugProtocol.Variable
                    Object.entries(device.reagents.Recipe).map(([key, val]) => {
                        this.var2variable(key, val, `${id}.Recipe`)
                    })

                }
                if (Object.keys(device.reagents.Required).length) {
                    this.map[id][`${id}.Required`] = {
                        name: `Reagents.Required`,
                        type: "object",
                        value: `Object`,
                        __vscodeVariableMenuContext: "Object",
                        variablesReference: this.scope._variableHandles.create(`${id}.Required`),
                    } as DebugProtocol.Variable
                    Object.entries(device.reagents.Required).map(([key, val]) => {
                        this.var2variable(key, val, `${id}.Required`)
                    })
                }


                this.var2variable('Slots', device.slots, id)
                for (let i = 0; i < 7; i++) {
                    const channel: DeviceOutput = device.getChannel(i)
                    this.var2variable(`Output ${i}`, channel, id)
                }
            } catch (e) {

            }
        }
        if (id === 'Constants') {
            for (const aliasesKey in this.ic10.memory.aliases) {
                if (this.ic10.memory.aliases.hasOwnProperty(aliasesKey)) {
                    try {
                        let val = this.ic10.memory.aliases[aliasesKey]
                        if (val instanceof ConstantCell) {
                            this.var2variable(val.name, val.value, id)
                        }
                    } catch (e) {

                    }
                }
            }
        }
    }

    get(id: any) {
        try {
            const device = this.ic10.memory.getDevice(id)
            Object.entries(device.properties).forEach(([name, value]) => {
                this.var2variable(name, value, id)
            })
            return this.map[id]
        } catch (e) {

        }
        if (id in this.map) {
            return this.map[id]
        }
        return []
    }

    public var2variable(name: string, value: string | number | Device | IcHousing | number[] | DeviceOutput | MemoryStack | Slot[] | Slot, id: string, mc: string = null) {
        if (!(id in this.map)) {
            this.map[id] = {}
        }
        if (value === null) {
            value = 0
        }
        const type = value.constructor.name

        if (typeof value === 'number') {
            this.map[id][name] = {
                name: name,
                type: "float",
                value: String(value),
                variablesReference: 0,
                __vscodeVariableMenuContext: mc || "Number",
            } as DebugProtocol.Variable
            return name
        }
        if (isDevice(value) || isIcHousing(value)) {
            this.map[id][name] = {
                name: name,
                type: "object",
                value: `Object`,
                __vscodeVariableMenuContext: "Object",
                variablesReference: this.scope._variableHandles.create(name),
            } as DebugProtocol.Variable
            return name
        }
        if (value instanceof MemoryStack) {
            const arr = value.getStack()
            let b = 0
            for (const valueKey in arr) {
                if (arr.hasOwnProperty(valueKey)) {
                    let index = `${valueKey}`
                    if (arr[valueKey]) {
                        this.var2variable(index, arr[valueKey], name)
                    } else {
                        b++
                        this.var2variable(index, arr[valueKey], 'zero')
                    }
                }
            }
            this.map[id]['zero'] = {
                name: 'zero',
                type: "array",
                value: `Array (${b})`,
                __vscodeVariableMenuContext: "Array",
                variablesReference: this.scope._variableHandles.create('zero'),
            } as DebugProtocol.Variable
        }
        if (isDeviceOutput(value)) {
            if (!value.isEmpty()) {
                const arr = value.toArray()
                this.map[id][name] = {
                    name: name,
                    type: "array",
                    value: `Array (${arr.length})`,
                    __vscodeVariableMenuContext: "Array",
                    variablesReference: this.scope._variableHandles.create(name),
                } as DebugProtocol.Variable
                arr.forEach((val, index) => {
                    if (val) this.var2variable(`Channel ${index}`, val, name, mc)
                })
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
                } as DebugProtocol.Variable
                for (const valueKey in value) {
                    if (value.hasOwnProperty(valueKey)) {
                        let index = `${valueKey}`
                        if (!(value[valueKey] instanceof Slot)) {
                            index = `[${valueKey}]`
                            const stack: RegisterCell | MemoryStack = this.ic10.memory.cells[16]
                            if (stack instanceof MemoryStack) {
                                // if (parseInt(valueKey) == parseInt(String(stack.get()))) {
                                // 	index = `(${valueKey})`
                                // }
                            }
                        }
                        this.var2variable(index, value[valueKey], name, mc)
                    }
                }

            } else {
                this.map[id][name] = {
                    name: name,
                    type: "array",
                    value: "Array (0)",
                    variablesReference: 0,
                    __vscodeVariableMenuContext: "Array",
                } as DebugProtocol.Variable
            }
            return name
        }
        if (isSlot(value)) {
            this.map[id][name] = {
                name: name,
                type: "object",
                value: `Object`,
                __vscodeVariableMenuContext: "Object",
                variablesReference: this.scope._variableHandles.create(name),
            } as DebugProtocol.Variable
            let _arr = Object.keys(value.properties).sort()
            for (const valueKey of _arr) {
                if (value.properties.hasOwnProperty(valueKey)) {
                    this.var2variable(valueKey, value.properties[valueKey], name, "Slot")
                }
            }
            return name
        }
        if (typeof value === 'string') {
            this.map[id][name] = {
                name: name,
                type: "string",
                value: String(value),
                variablesReference: 0,
                __vscodeVariableMenuContext: mc || "String",

            } as DebugProtocol.Variable
            return name
        }
        return name
    }
}

