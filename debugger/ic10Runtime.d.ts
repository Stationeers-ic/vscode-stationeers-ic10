/// <reference types="node" />
import { EventEmitter } from "events";
import { InterpreterIc10 } from "ic10";
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
export declare class ic10Runtime extends EventEmitter {
    private _fileAccessor;
    private _sourceLines;
    private _currentLine;
    private _currentColumn;
    private _breakPoints;
    private _breakpointId;
    private _breakAddresses;
    private _noDebug;
    private _namedException;
    private _otherExceptions;
    private ic10;
    constructor(_fileAccessor: FileAccessor, ic10: InterpreterIc10);
    private _sourceFile;
    get sourceFile(): string;
    start(program: string, stopOnEntry: boolean, noDebug: boolean): Promise<void>;
    continue(reverse?: boolean): void;
    step(reverse?: boolean, event?: string): void;
    stepIn(targetId: number | undefined): void;
    stepOut(): void;
    getStepInTargets(frameId: number): IStepInTargets[];
    stack(startFrame: number, endFrame: number): IStack;
    getBreakpoints(path: string, line: number): number[];
    setBreakPoint(path: string, line: number): Promise<Iic10Breakpoint>;
    clearBreakPoint(path: string, line: number): Iic10Breakpoint | undefined;
    clearBreakpoints(path: string): void;
    setDataBreakpoint(address: string): boolean;
    setExceptionsFilters(namedException: string | undefined, otherExceptions: boolean): void;
    clearAllDataBreakpoints(): void;
    private loadSource;
    private run;
    private verifyBreakpoints;
    private fireEventsForLine;
    private sendEvent;
}
export {};
