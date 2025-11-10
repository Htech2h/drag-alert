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



  }
  

  
};