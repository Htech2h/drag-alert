// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DragAlertEditorProvider } from './editorProvider';

import * as fs from 'fs';
import * as path from 'path';
import { error } from 'console';
import { registerSaveListener } from './utils/webviewContent';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      'dragAlert.editor',
      new DragAlertEditorProvider(context),
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
        supportsMultipleEditorsPerDocument: false,
      }
    )
  );
  
  // Register the file rename save listener
  registerSaveListener(context);
}

export function deactivate() {}






