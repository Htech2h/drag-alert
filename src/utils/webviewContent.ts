import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';


// warn user  when they misspell dragAlert
export function registerSaveListener(context: vscode.ExtensionContext): void {
  const saveListener = vscode.workspace.onDidSaveTextDocument(async (document) => {
    const filePath = document.uri.fsPath;

    // Check for common misspellings
    if (filePath.endsWith('.dragaler') || filePath.endsWith('.dragalert')) {
      vscode.window.showWarningMessage(
        `The file ${path.basename(filePath)} has an incorrect extension. Use ".da" for DragAlert files.`
      );
    }
  });

  // Add the listener to the context's subscriptions
  context.subscriptions.push(saveListener);
}

