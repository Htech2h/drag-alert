import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';


export class DragAlertEditorProvider implements vscode.CustomTextEditorProvider {
  private context: vscode.ExtensionContext;
  //private configService: ConfigService;
  private document!: vscode.TextDocument;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    this.document = document;

    // Allow scripts and local resource loading from the extension's resources folder
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'src', 'resources'))]
    };

    // Load the webview HTML from the extension resources and inject the filename
    try {
      const htmlPath = path.join(this.context.extensionPath, 'src', 'resources', 'webview.html');
      const raw = fs.readFileSync(htmlPath, 'utf8');
      const fileName = path.basename(document.uri.fsPath);
      const html = raw.replace(/\$\{htmlFileName\}/g, fileName);
      webviewPanel.webview.html = html;
    } catch (err) {
      webviewPanel.webview.html = `<html><body><h3>Unable to load editor UI</h3><pre>${String(err)}</pre></body></html>`;
    }

    // Send initial document content to webview
    webviewPanel.webview.postMessage({ command: 'document', text: document.getText() });

    // Update webview when the document changes externally
    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.uri.toString() === document.uri.toString()) {
        webviewPanel.webview.postMessage({ command: 'document', text: e.document.getText() });
      }
    });

    // Save edits coming from the webview into the document
    webviewPanel.webview.onDidReceiveMessage(async message => {
      if (message.command === 'save' && typeof message.text === 'string') {
        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(document.getText().length)
        );
        edit.replace(document.uri, fullRange, message.text);
        await vscode.workspace.applyEdit(edit);
        await document.save();
      }
    });

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });
  }
  
};