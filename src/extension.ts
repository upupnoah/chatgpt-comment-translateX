import { ITranslateRegistry } from 'comment-translate-manager';
import * as vscode from 'vscode';
import { ChatGPTTranslate } from './chatgptTranslate';

export function activate(context: vscode.ExtensionContext) {


    //Expose the plug-in
    return {
        extendTranslate: function (registry: ITranslateRegistry) {
            registry('chatgpt', ChatGPTTranslate);
        }
    };
}

// this method is called when your extension is deactivated
export function deactivate() { }
