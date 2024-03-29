/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import {EventEmitter} from "events"
import {InterpreterIc10} from "ic10"
import {parseEnvironment} from "./utils";
import path from "path";

export interface FileAccessor {
    readFile(path: string): Promise<string>;
}

export interface Iic10Breakpoint {
    id: number;
    line: number;
    verified: boolean;
}

interface IStepInTargets {
    id: number;
    label: string;
}

interface IStackFrame {
    index: number;
    name: string;
    file: string;
    line: number;
    column?: number;
}

interface IStack {
    count: number;
    frames: IStackFrame[];
}

/**
 *  ic10 runtime with minimal debugger functionality.
 */
export class ic10Runtime extends EventEmitter {

    // the contents (= lines) of the one and only file
    private _sourceLines: string[] = []
    // This is the next line that will be 'executed'
    private _currentLine = 0
    private _currentColumn: number | undefined
    // maps from sourceFile to array of ic10 breakpoints
    private _breakPoints = new Map<string, Iic10Breakpoint[]>()
    // so that the frontend can match events with breakpoints.
    private _breakpointId = 1
    private _breakAddresses = new Set<string>()

    // since we want to send breakpoint events, we will assign an id to every event
    private _noDebug = false
    private _namedException: string | undefined
    private _otherExceptions = false
    private readonly ic10: InterpreterIc10

    constructor(private _fileAccessor: FileAccessor, ic10: InterpreterIc10) {
        super()
        this.ic10 = ic10
    }

    // the initial (and one and only) file we are 'debugging'
    private _sourceFile: string = ""

    public get sourceFile() {
        return this._sourceFile
    }

    /**
     * Start executing the given program.
     */
    public async start(program: string, stopOnEntry: boolean, noDebug: boolean): Promise<void> {

        this._noDebug = noDebug

        await this.loadSource(program)
        this._currentLine = 0

        await this.verifyBreakpoints(this._sourceFile)
        parseEnvironment(this.ic10, this._sourceFile)
        if (stopOnEntry) {
            // we step once
            this.step(false, "stopOnEntry")
        } else {
            // we just start to run until we hit a breakpoint or an exception
            this.step(false, "stopOnBreakpoint")
        }
    }

    /**
     * Continue execution to the end/beginning.
     */
    public continue(reverse = false) {
        this.run(reverse, undefined)
    }

    /**
     * Step to the next/previous not empty line.
     */
    public step(reverse = false, event = "stopOnStep") {
        this.run(reverse, event)
    }

    /**
     * "Step into" for ic10 debug means: go to next character
     */
    public stepIn(targetId: number | undefined) {
        if (typeof targetId === "number") {
            this._currentColumn = targetId
            this.sendEvent("stopOnStep")
        } else {
            if (typeof this._currentColumn === "number") {
                if (this._currentColumn <= this._sourceLines[this._currentLine].length) {
                    this._currentColumn += 1
                }
            } else {
                this._currentColumn = 1
            }
            this.sendEvent("stopOnStep")
        }
    }

    /**
     * "Step out" for ic10 debug means: go to previous character
     */
    public stepOut() {
        if (typeof this._currentColumn === "number") {
            this._currentColumn -= 1
            if (this._currentColumn === 0) {
                this._currentColumn = undefined
            }
        }
        this.sendEvent("stopOnStep")
    }

    public getStepInTargets(frameId: number): IStepInTargets[] {

        const line = this._sourceLines[this._currentLine].trim()

        // every word of the current line becomes a stack frame.
        const words = line.split(/\s+/)

        // return nothing if frameId is out of range
        if (frameId < 0 || frameId >= words.length) {
            return []
        }

        // pick the frame for the given frameId
        const frame = words[frameId]

        const pos = line.indexOf(frame)

        // make every character of the frame a potential "step in" target
        return frame.split("").map((c, ix) => {
            return {
                id: pos + ix,
                label: `target: ${c}`
            }
        })
    }

    /**
     * Returns a fake 'stacktrace' where every 'stackframe' is a word from the current line.
     */
    public stack(startFrame: number, endFrame: number): IStack {

        const words = this._sourceLines[this._currentLine].trim().split(/\s+/)

        const frames = new Array<IStackFrame>()
        // every word of the current line becomes a stack frame.
        for (let i = startFrame; i < Math.min(endFrame, words.length); i++) {
            const name = words[i]	// use a word of the line as the stackframe name
            const stackFrame: IStackFrame = {
                index: i,
                name: `${name}(${i})`,
                file: this._sourceFile,
                line: this._currentLine
            }
            if (typeof this._currentColumn === "number") {
                stackFrame.column = this._currentColumn
            }
            frames.push(stackFrame)
        }
        return {
            frames: frames,
            count: words.length
        }
    }

    public getBreakpoints(path: string, line: number): number[] {

        const l = this._sourceLines[line]

        let sawSpace = true
        const bps: number[] = []
        for (let i = 0; i < l.length; i++) {
            if (l[i] !== " ") {
                if (sawSpace) {
                    bps.push(i)
                    sawSpace = false
                }
            } else {
                sawSpace = true
            }
        }

        return bps
    }

    /*
     * Set breakpoint in file with given line.
     */
    public async setBreakPoint(path: string, line: number): Promise<Iic10Breakpoint> {

        const bp: Iic10Breakpoint = {verified: false, line, id: this._breakpointId++}
        let bps = this._breakPoints.get(path)
        if (!bps) {
            bps = new Array<Iic10Breakpoint>()
            this._breakPoints.set(path, bps)
        }
        bps.push(bp)

        await this.verifyBreakpoints(path)

        return bp
    }

    /*
     * Clear breakpoint in file with given line.
     */
    public clearBreakPoint(path: string, line: number): Iic10Breakpoint | undefined {
        const bps = this._breakPoints.get(path)
        if (bps) {
            const index = bps.findIndex(bp => bp.line === line)
            if (index >= 0) {
                const bp = bps[index]
                bps.splice(index, 1)
                return bp
            }
        }
        return undefined
    }

    /*
     * Clear all breakpoints for file.
     */
    public clearBreakpoints(path: string): void {
        this._breakPoints.delete(path)
    }

    /*
     * Set data breakpoint.
     */
    public setDataBreakpoint(address: string): boolean {
        if (address) {
            this._breakAddresses.add(address)
            return true
        }
        return false
    }

    public setExceptionsFilters(namedException: string | undefined, otherExceptions: boolean): void {
        this._namedException = namedException
        this._otherExceptions = otherExceptions
    }

    /*
     * Clear all data breakpoints.
     */
    public clearAllDataBreakpoints(): void {
        this._breakAddresses.clear()
    }

    // private methods

    private async loadSource(file: string): Promise<void> {
        if (this._sourceFile !== file) {
            if(path.extname(file).toLowerCase() === '.icx'){
                file+=".ic10"
            }
            this._sourceFile = file
            const contents = await this._fileAccessor.readFile(file)
            try {
                this.ic10.init(contents)
            } catch (e) {
                // console.error(e)
            }
            this._sourceLines = contents.split(/\r?\n/)
        }
    }

    /**
     * Run through the file.
     * If stepEvent is specified only run a single step and emit the stepEvent.
     */
    private run(reverse = false, stepEvent?: string) {
        if (!reverse) {
            let ln = this.ic10.position
            let why
            let counter = 0
            do {
                    why = this.ic10.prepareLine(ln, true)
                    if (this.ic10?.output?.debug && this.ic10.ignoreLine.indexOf(ln) < 0) {
                        // this.sendEvent('output', '[debug]: ' + this.ic10.output.debug, this._sourceFile, ln - 1);
                        this.ic10.output.debug = ""
                    }
                    if (this.ic10?.output?.log) {
                        this.sendEvent("output", this.ic10.output.log, this._sourceFile, ln - 1)
                        this.ic10.output.log = ""
                    }
                    if (this.ic10?.output?.error && this.ic10.ignoreLine.indexOf(ln) < 0) {
                        this.sendEvent("output", this.ic10.output.error, this._sourceFile, ln - 1)
                        this.ic10.output.error = ""
                    }
                    if (this.fireEventsForLine(ln, stepEvent)) {
                        this._currentLine = ln
                        this._currentColumn = 0
                        return true
                    }
                    ln = this.ic10.position
                    if (counter++ > 1000) {
                        why = "timeOut"
                    }
            } while (why === true)
            switch (why) {
                case "timeOut":
                    this.sendEvent("output", "WHILE TRUE!!!!", this._sourceFile, ln)
                    this.sendEvent("stopOnBreakpoint")
                    break
                default:
                    this.sendEvent("end")
                    break
            }
        } else {
            this.sendEvent("output", "can`t go back", this._sourceFile, 0)
            this.sendEvent("stopOnBreakpoint")
        }
    }

    private async verifyBreakpoints(path: string): Promise<void> {

        if (this._noDebug) {
            return
        }

        const bps = this._breakPoints.get(path)
        if (bps) {
            await this.loadSource(path)
            bps.forEach(bp => {
                if (!bp.verified && bp.line < this._sourceLines.length) {
                    const srcLine = this._sourceLines[bp.line].trim()

                    // if a line is empty or starts with '+' we don't allow to set a breakpoint but move the breakpoint down
                    if (srcLine.length === 0 || srcLine.indexOf("+") === 0) {
                        bp.line++
                    }
                    // if a line starts with '-' we don't allow to set a breakpoint but move the breakpoint up
                    if (srcLine.indexOf("-") === 0) {
                        bp.line--
                    }
                    // don't set 'verified' to true if the line contains the word 'lazy'
                    // in this case the breakpoint will be verified 'lazy' after hitting it once.
                    if (srcLine.indexOf("lazy") < 0) {
                        bp.verified = true
                        this.sendEvent("breakpointValidated", bp)
                    }
                }
            })
        }
    }

    /**
     * Fire events if line has a breakpoint or the word 'exception' or 'exception(...)' is found.
     * Returns true if execution needs to stop.
     */
    private fireEventsForLine(ln: number, stepEvent?: string): boolean {

        if (this._noDebug) {
            return false
        }
        if(!this._sourceLines[ln]){
            return false
        }
        const line = this._sourceLines[ln].trim()

        // if 'log(...)' found in source -> send argument to debug // console
        //const matches = /log\((.*)\)/.exec(line);
        //if (matches && matches.length === 2) {
        //	this.sendEvent('output', matches[1], this._sourceFile, ln, matches.index);
        //}

        // if a word in a line matches a data breakpoint, fire a 'dataBreakpoint' event
        const words = line.split(" ")
        for (const word of words) {
            if (this._breakAddresses.has(word)) {
                this.sendEvent("stopOnDataBreakpoint")
                return true
            }
        }

        // if pattern 'exception(...)' found in source -> throw named exception
        const matches2 = /exception\((.*)\)/.exec(line)
        if (matches2 && matches2.length === 2) {
            const exception = matches2[1].trim()
            if (this._namedException === exception) {
                this.sendEvent("stopOnException", exception)
                return true
            } else {
                if (this._otherExceptions) {
                    this.sendEvent("stopOnException", undefined)
                    return true
                }
            }
        } else {
            // if word 'exception' found in source -> throw exception
            if (line.indexOf("exception") >= 0) {
                if (this._otherExceptions) {
                    this.sendEvent("stopOnException", undefined)
                    return true
                }
            }
        }

        // is there a breakpoint?
        const breakpoints = this._breakPoints.get(this._sourceFile)
        if (breakpoints) {
            const bps = breakpoints.filter(bp => bp.line === ln)
            if (bps.length > 0) {

                // send 'stopped' event
                this.sendEvent("stopOnBreakpoint")

                // the following shows the use of 'breakpoint' events to update properties of a breakpoint in the UI
                // if breakpoint is not yet verified, verify it now and send a 'breakpoint' update event
                if (!bps[0].verified) {
                    bps[0].verified = true
                    this.sendEvent("breakpointValidated", bps[0])
                }
                return true
            }
        }

        // non-empty line
        if (stepEvent && line.length > 0) {
            this.sendEvent(stepEvent)
            return true
        }

        // nothing interesting found -> continue
        return false
    }

    private sendEvent(event: string, ...args: any[]) {
        setImmediate(_ => {
            this.emit(event, ...args)
        })
    }
}
