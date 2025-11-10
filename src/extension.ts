// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DragAlertEditorProvider } from './editorProvider';
import { ASTService } from './services/astService';

import * as fs from 'fs';
import * as path from 'path';
import { registerSaveListener } from './utils/webviewContent';

// Initialize services that need context

let astService: ASTService;

export async function activate(context: vscode.ExtensionContext) {

  
  // Initialize the AST service
  astService = new ASTService();

  // Load the saved layout JSON
  await loadLayoutFromFile(context);

  // Check if the welcome message has been shown
  const hasShownWelcome = context.globalState.get('dragAlert.hasShownWelcome');
  console.log('Has shown welcome:', hasShownWelcome);


  // Register the new command to open a custom webview
  const openWebviewCommand = vscode.commands.registerCommand('dragAlert.openWebview', async () => {
    const panel = vscode.window.createWebviewPanel(
      'dragAlertWebview',
      'DragAlert Webview',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src', 'resources'))]
      }
    );

    const htmlPath = path.join(context.extensionPath, 'src', 'resources', 'webview.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    panel.webview.html = htmlContent.replace(/\$\{htmlFileName\}/g, 'Preferences');
  });


  // Register the custom editor provider
  const editorProvider = new DragAlertEditorProvider(context);
  const editorRegistration = vscode.window.registerCustomEditorProvider(
    'dragAlert.editor',
    editorProvider,
    {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
      supportsMultipleEditorsPerDocument: false,
    }
  );

  // add disposables to context so they are cleaned up on deactivate
  context.subscriptions.push(openWebviewCommand, editorRegistration);

  // Register preview layout command - only for dragAlert.da to show the layout preview
  const previewLayoutCommand = vscode.commands.registerCommand('dragAlert.previewLayout', async (uri?: vscode.Uri) => {
    try {
      if (!uri) {
        // If no URI provided, try to get from active editor
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document.fileName.endsWith('.da')) {
          uri = activeEditor.document.uri;
        } else {
          vscode.window.showErrorMessage('Please open a .da file to preview its layout');
          return;
        }
      }

      const filename = path.basename(uri.fsPath, '.da');
      
      // Only dragAlert.da should show a preview, but it should be preferences preview, not layout preview
      // For any .da file open a preview webview using the bundled webview UI
      const htmlPath = path.join(context.extensionPath, 'src', 'resources', 'webview.html');
      if (fs.existsSync(htmlPath)) {
        const panel = vscode.window.createWebviewPanel(
          'dragAlertPreview',
          `Layout Preview - ${filename}`,
          vscode.ViewColumn.Beside,
          {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src', 'resources'))]
          }
        );

        const raw = fs.readFileSync(htmlPath, 'utf8');
        panel.webview.html = raw.replace(/\$\{htmlFileName\}/g, filename + '.da');

        // Tell the webview which file to load
        panel.webview.postMessage({ command: 'loadLayoutFromFile', filePath: uri.fsPath });
      } else {
        vscode.window.showErrorMessage('Preview UI not found');
      }
    } catch (error) {
      console.error('Error opening layout preview:', error);
      vscode.window.showErrorMessage(`Failed to open layout preview: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  context.subscriptions.push(previewLayoutCommand);

  // Register file creation validation for .da files
  const fileWatcher = vscode.workspace.onWillCreateFiles(async (event) => {
    console.log('DragAlert: File creation detected, checking for .da files...');
    
    for (const file of event.files) {
      if (file.fsPath.endsWith('.da')) {
        console.log(`DragAlert: Validating .da file creation: ${file.fsPath}`);
        const isValid = await validateDaFileCreation(file.fsPath);
        if (!isValid) {
          console.log(` DragAlert: Blocking file creation: ${file.fsPath}`);
          // Prevent the file creation by rejecting the promise
          event.waitUntil(Promise.reject(new Error(`corresponding file not found`)));
          return;
        } else {
          console.log(`DragAlert: Allowing file creation: ${file.fsPath}`);
        }
      }
    }
  });

  // Register file creation cleanup for .da files that somehow get created
  const fileCreatedWatcher = vscode.workspace.onDidCreateFiles(async (event) => {
    for (const file of event.files) {
      if (file.fsPath.endsWith('.da')) {
        console.log(`🔍 DragAlert: File created, validating: ${file.fsPath}`);
        const isValid = await validateDaFileCreation(file.fsPath);
        if (!isValid) {
          console.log(`DragAlert: Deleting invalid .da file: ${file.fsPath}`);
          try {
            await vscode.workspace.fs.delete(file, { recursive: false, useTrash: false });
            vscode.window.showErrorMessage('corresponding file not found');
            console.log(`DragAlert: Successfully deleted invalid file: ${file.fsPath}`);
          } catch (deleteError) {
            console.error(`DragAlert: Failed to delete invalid file: ${file.fsPath}`, deleteError);
            vscode.window.showErrorMessage('corresponding file not found (cleanup failed)');
          }
        }
      }
    }
  });

  // Register the start command to open preferences
  const startCommand = vscode.commands.registerCommand('dragAlert.start', async () => {
    const panel = vscode.window.createWebviewPanel(
      'dragAlertPreferences',
      'DragAlert Preferences',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true, // Keep webview alive when hidden
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src', 'resources'))]
      }
    );

    const htmlPath = path.join(context.extensionPath, 'src', 'resources', 'webview.html');
    const raw = fs.readFileSync(htmlPath, 'utf8');
    panel.webview.html = raw.replace(/\$\{htmlFileName\}/g, 'Preferences');



  });

  context.subscriptions.push(startCommand);


  // Register the file rename save listener
  registerSaveListener(context);

  console.log('DragAlert extension activated.');
}

async function loadLayoutFromFile(context: vscode.ExtensionContext): Promise<void> {
  const layoutPath = path.join(context.extensionPath, 'layout.json');
  try {
    const layoutUri = vscode.Uri.file(layoutPath);
    const layoutContent = await vscode.workspace.fs.readFile(layoutUri);
    const layout = JSON.parse(layoutContent.toString());
    console.log('Loaded layout from file:', layout);
    // Apply the layout to the interface
    applyLayoutToWebview(layout);
  } catch (error) {
    console.error('Failed to load layout from file:', error);
    // It's okay if the file doesn't exist yet
  }
}

function applyLayoutToWebview(layout: any): void {
  // This function would send the layout to the webview
  // For example, you could use a command or message to update the webview
  console.log('Applying layout to webview:', layout);
  // Example: webviewPanel.webview.postMessage({ command: 'applyLayout', layout });
}





/**
 * Validates if a .da file can be created based on corresponding source files
 */
async function validateDaFileCreation(daFilePath: string): Promise<boolean> {
  const basename = path.basename(daFilePath, '.da');
  const dirname = path.dirname(daFilePath);
  
  // Special case: dragalert.da is always allowed (case insensitive)
  if (basename.toLowerCase() === 'dragalert') {
    console.log(`✅ DragAlert: Allowing special file "${basename}.da"`);
    return true;
  }
  
  
  vscode.window.showErrorMessage('corresponding file not found');
  return false;
}

export function deactivate() {
  // Clean up any resources
}






