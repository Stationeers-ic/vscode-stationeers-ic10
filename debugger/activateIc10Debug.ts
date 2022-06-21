import * as vscode from 'vscode';
import { FileAccessor } from './ic10Runtime';
export declare function activateIc10Debug(context: vscode.ExtensionContext, factory?: vscode.DebugAdapterDescriptorFactory): void;
export declare const workspaceFileAccessor: FileAccessor;
