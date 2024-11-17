import * as vscode from 'vscode';
import * as path from 'path';
import { getWebviewContent } from './utils/webviewContent';

export class DragAlertEditorProvider implements vscode.CustomTextEditorProvider {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): void {
    const htmlFilePath = path.join(this.context.extensionPath, 'src', 'resources', 'webview.html');
    let htmlContent = getWebviewContent(htmlFilePath);

    if (!htmlContent) {
      vscode.window.showErrorMessage(
        `Failed to load webview content from ${htmlFilePath}. Ensure the file exists and is accessible.`
      );
      webviewPanel.dispose();
      return;
    }

    const htmlFilePaths = document.uri.fsPath.replace(/\.dragAlert$/, '.html');
    const htmlFileName = path.basename(htmlFilePaths);
    // Resolve URIs for CSS and JS files
    const webview = webviewPanel.webview;
    const cssUri = webview.asWebviewUri(
      vscode.Uri.file(path.join(this.context.extensionPath, 'src', 'resources', 'style.css'))
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.file(path.join(this.context.extensionPath, 'src', 'resources', 'script.js'))
    );

    // Inject URIs into the HTML content
    htmlContent = htmlContent
      .replace('{{styleUri}}', cssUri.toString())
      .replace('{{scriptUri}}', scriptUri.toString())
      .replace('{htmlFileName}', htmlFileName);

    // Set the webview HTML content
    webviewPanel.title = 'DragAlert Editor';
    webview.options = { enableScripts: true };
    webview.html = htmlContent;
  }
}

