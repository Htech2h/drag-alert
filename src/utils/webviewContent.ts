import * as fs from 'fs';
import * as path from 'path';

export function getWebviewContent(htmlFilePath: string): string {
  try {
    // Read the content of the HTML file
    return fs.readFileSync(htmlFilePath, 'utf8');
  } catch (error) {
    console.error(`Error reading HTML file at ${htmlFilePath}:`, error);
    return '';
  }
}
