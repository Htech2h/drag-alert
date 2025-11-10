# DragAlert - Visual UI Builder for VS Code

DragAlert is a powerful VS Code extension that allows you to visually design user interfaces using drag-and-drop components and generate production-ready code with AI assistance.

## Features

### 🎨 Visual UI Builder
- Drag and drop UI components (buttons, inputs, text, images, etc.)
- Real-time visual layout editing
- Responsive design preview (Phone/Laptop views)
- Smart alignment guides and snapping

### 🤖 AI-Powered Code Generation
- Generate React, Vue, or HTML code from your visual designs
- TypeScript and JavaScript support
- Multiple CSS frameworks (Tailwind, Bootstrap, custom CSS)
- Component library integration

### 🔧 Professional Tools
- Element property editor (Figma-style panel)
- Nested component support
- Table and list builders
- Media element handling
- Form component configuration

### 🔑 API Integration
- Secure API key management
- Real-time code generation
- Error handling and validation
- Rate limiting support

## Getting Started

1. **Install the Extension**
   ```
   ext install drag-alert
   ```

2. **Configure Preferences**
   - Run command: `DragAlert: Start DragAlert Editor` to open the preferences UI
   - Set your API key (format: `da_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - Configure output format, CSS framework, and styling preferences

3. **Start Building**
   - Create a corresponding `.html`, `.jsx`, or `.tsx` file first
   - Create a `.da` file with the same name to design your layout
   - Drag components from the palette
   - Design your layout visually
   - Click "Generate Code" to create production-ready code

## Commands

- `DragAlert: Start DragAlert Editor` - Open the preferences and settings UI
- `DragAlert: Set API Key` - Quick API key configuration via input box
- `DragAlert: Generate Code` - Generate code from current layout
- `DragAlert: Preview Layout` - Preview .da file layouts

## Code Generation

The extension sends your visual layout to our AI backend and generates clean, production-ready code. Supported outputs:

- **React Components** (TypeScript/JavaScript)
- **Vue Components** (TypeScript/JavaScript)  
- **HTML/CSS** (Static websites)
- **Component Libraries** (Material-UI, Ant Design, etc.)

### Code Insertion

Generated code can be inserted:
- At your current cursor position
- At a `// [dragalert-insert]` placeholder comment
- As a new file

## Error Handling

The extension gracefully handles:
- Missing or invalid API keys
- Network connectivity issues
- Rate limiting (429 errors)
- Server errors (500 errors)
- Malformed requests

## Extension Settings

This extension contributes the following settings:

* `dragAlert.subscriptionTier`: Your subscription tier (free, pro, enterprise)
* `dragAlert.showSubscriptionPrompts`: Show subscription-related notifications

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

## 📁 File Management

### .da File Creation Rules
DragAlert uses `.da` files to store your visual layouts. To maintain project organization:

- **Corresponding Source Files Required**: You can only create a `.da` file if a corresponding source file exists:
  - `profile.da` ➜ requires `profile.html`, `profile.jsx`, or `profile.tsx`
  - `dashboard.da` ➜ requires `dashboard.html`, `dashboard.jsx`, or `dashboard.tsx`
  - `home.da` ➜ requires `home.html`, `home.jsx`, or `home.tsx`

- **Special Exception**: `dragalert.da` is always allowed (used for extension preferences)

- **File Location**: The `.da` file and its corresponding source file must be in the same directory

This ensures your visual layouts are always connected to actual implementation files.

**Enjoy!**
