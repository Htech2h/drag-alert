import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

/////////// this is the drag alert window that user see
export function getWebviewContent(htmlFilePath: string): string {
  try {
    // Read the content of the HTML file
    return fs.readFileSync(htmlFilePath, 'utf8');
  } catch (error) {
    console.error(`Error reading HTML file at ${htmlFilePath}:`, error);
    return '';
  }
}
// warn user  when they misspell dragAlert
export function registerSaveListener(context: vscode.ExtensionContext): void {
  const saveListener = vscode.workspace.onDidSaveTextDocument(async (document) => {
    const filePath = document.uri.fsPath;

    // Check if the file ends with `.da`
    if (filePath.endsWith('.dragaler')) {
      
      vscode.window.showWarningMessage(
        `The file ${filePath} has a misspelled extension. Did you mean ".dragAlert"?`
      );
          
    }
  });

  // Add the listener to the context's subscriptions
  context.subscriptions.push(saveListener);
}

