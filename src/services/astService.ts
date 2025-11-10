// Interface for AST nodes
export interface ASTNode {
  type: string;
  props?: Record<string, string | Record<string, string>>;
  children?: Array<ASTNode | string>;
}

// Input structure from localStorage
export interface InputElement {
  html: string;
  id: string;
  x: string;
  y: string;
  type: string;
  styles?: Record<string, string>;
  attributes?: Record<string, any>;
  width?: string;
  height?: string;
  position?: string;
}

export class ASTService {
  
  /**
   * Recursively build AST from a DOM node
   */
  private nodeToAST(node: any): ASTNode | string {
    const TEXT_NODE = 3;
    const ELEMENT_NODE = 1;
    
    if (node.nodeType === TEXT_NODE) {
      const text = node.textContent?.trim() || "";
      return text.length > 0 ? text : "";
    }

    if (node.nodeType === ELEMENT_NODE) {
      const el = node as any; // HTMLElement equivalent

      // Gather attributes
      const props: Record<string, any> = {};
      if (el.attributes) {
        for (let i = 0; i < el.attributes.length; i++) {
          const attr = el.attributes[i];
          props[attr.name] = attr.value;
        }
      }

      // Collect children recursively
      const children = Array.from(el.childNodes || [])
        .map((child: any) => this.nodeToAST(child))
        .filter((c) => c !== "") as (ASTNode | string)[];

      return {
        type: el.tagName.toLowerCase(),
        ...(Object.keys(props).length > 0 ? { props } : {}),
        ...(children.length > 0 ? { children } : {})
      };
    }

    return "";
  }

  /**
   * Main method: converts array of InputElements into ASTs
   */
  generateASTs(elements: InputElement[]): ASTNode[] {
    return elements.map((elem) => {
      // Build top-level style object
      const style: Record<string, string> = {
        position: elem.position || "absolute",
        ...(elem.x ? { left: `${elem.x}px` } : {}),
        ...(elem.y ? { top: `${elem.y}px` } : {}),
        ...(elem.width ? { width: elem.width } : {}),
        ...(elem.height ? { height: elem.height } : {})
      };

      // Add any additional styles from the element
      if (elem.styles) {
        Object.assign(style, elem.styles);
      }

      // Build props object
      const props: Record<string, any> = { 
        id: elem.id, 
        style 
      };

      // Add any additional attributes
      if (elem.attributes) {
        Object.assign(props, elem.attributes);
      }

      // Handle HTML content
      let rawHtml = elem.html.trim();
      
      // Special handling for different element types
      if (elem.type?.toLowerCase() === "table" && !rawHtml.startsWith("<table")) {
        rawHtml = `<table>${rawHtml}</table>`;
      }

      // Parse the HTML content - VS Code extension compatible
      let children: (ASTNode | string)[] = [];
      
      try {
        // Simple HTML parsing for VS Code extension environment
        if (rawHtml.includes('<') && rawHtml.includes('>')) {
          // For complex HTML, we'll create a simplified AST
          children = this.parseHTMLString(rawHtml);
        } else {
          // For simple text content
          children = rawHtml ? [rawHtml] : [];
        }
      } catch (error) {
        console.error('Error parsing HTML:', error);
        children = rawHtml ? [rawHtml] : [];
      }

      return {
        type: elem.type?.toLowerCase() || "div",
        props,
        children: children.length > 0 ? children : undefined
      };
    });
  }

  /**
   * Convert localStorage format to InputElement format
   */
  convertFromLocalStorage(savedElements: any[]): InputElement[] {
    return savedElements.map(elem => ({
      html: elem.html || '',
      id: elem.id || '',
      x: elem.x || '0',
      y: elem.y || '0',
      type: elem.type || 'div',
      styles: elem.styles || {},
      attributes: elem.attributes || {},
      width: elem.styles?.width || '',
      height: elem.styles?.height || '',
      position: elem.styles?.position || 'absolute'
    }));
  }

  /**
   * Generate AST from localStorage data
   */
  generateASTFromLocalStorage(localStorageData: string): ASTNode[] {
    try {
      const savedElements = JSON.parse(localStorageData);
      const inputElements = this.convertFromLocalStorage(savedElements);
      return this.generateASTs(inputElements);
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
      return [];
    }
  }

  /**
   * Pretty print AST for debugging
   */
  printAST(ast: ASTNode[], indent: number = 0): string {
    const spaces = ' '.repeat(indent * 2);
    let result = '';

    for (const node of ast) {
      if (typeof node === 'string') {
        result += `${spaces}"${node}"\n`;
      } else {
        result += `${spaces}${node.type}`;
        if (node.props) {
          result += ` (${Object.keys(node.props).join(', ')})`;
        }
        result += '\n';
        
        if (node.children) {
          result += this.printAST(node.children as ASTNode[], indent + 1);
        }
      }
    }

    return result;
  }

  /**
   * Convert AST to React JSX string
   */
  astToReactJSX(ast: ASTNode[], indent: number = 0): string {
    const spaces = ' '.repeat(indent * 2);
    let jsx = '';

    for (const node of ast) {
      if (typeof node === 'string') {
        jsx += `${spaces}${JSON.stringify(node)}\n`;
      } else {
        const tagName = this.mapHTMLToReact(node.type);
        jsx += `${spaces}<${tagName}`;
        
        // Add props
        if (node.props) {
          for (const [key, value] of Object.entries(node.props)) {
            if (key === 'style' && typeof value === 'object') {
              jsx += ` style={${JSON.stringify(value)}}`;
            } else if (key === 'className') {
              jsx += ` className="${value}"`;
            } else {
              jsx += ` ${key}="${value}"`;
            }
          }
        }

        if (node.children && node.children.length > 0) {
          jsx += '>\n';
          jsx += this.astToReactJSX(node.children as ASTNode[], indent + 1);
          jsx += `${spaces}</${tagName}>\n`;
        } else {
          jsx += ' />\n';
        }
      }
    }

    return jsx;
  }

  /**
   * Map HTML elements to React equivalents
   */
  private mapHTMLToReact(htmlTag: string): string {
    const mapping: Record<string, string> = {
      'div': 'div',
      'span': 'span',
      'p': 'p',
      'h1': 'h1',
      'h2': 'h2',
      'h3': 'h3',
      'h4': 'h4',
      'h5': 'h5',
      'h6': 'h6',
      'input': 'input',
      'textarea': 'textarea',
      'button': 'button',
      'img': 'img',
      'a': 'a',
      'table': 'table',
      'thead': 'thead',
      'tbody': 'tbody',
      'tr': 'tr',
      'td': 'td',
      'th': 'th',
      'ul': 'ul',
      'ol': 'ol',
      'li': 'li',
      'select': 'select',
      'option': 'option',
      'section': 'section',
      'article': 'article',
      'header': 'header',
      'footer': 'footer',
      'nav': 'nav',
      'aside': 'aside'
    };

    return mapping[htmlTag.toLowerCase()] || 'div';
  }

  /**
   * Simple HTML string parser for VS Code extension environment
   */
  private parseHTMLString(html: string): (ASTNode | string)[] {
    const children: (ASTNode | string)[] = [];
    
    // Simple regex-based HTML parsing for basic elements
    const tagRegex = /<(\w+)([^>]*?)>(.*?)<\/\1>|<(\w+)([^>]*?)\s*\/>/gs;
    const textBetweenTags = html.split(tagRegex).filter(Boolean);
    
    let match;
    tagRegex.lastIndex = 0; // Reset regex
    
    while ((match = tagRegex.exec(html)) !== null) {
      const tagName = match[1] || match[4];
      const attributes = match[2] || match[5];
      const content = match[3] || '';
      
      if (tagName) {
        const props: Record<string, any> = {};
        
        // Parse attributes
        if (attributes) {
          const attrRegex = /(\w+)=["']([^"']*?)["']/g;
          let attrMatch;
          while ((attrMatch = attrRegex.exec(attributes)) !== null) {
            props[attrMatch[1]] = attrMatch[2];
          }
        }
        
        // Parse content recursively for nested elements
        const childContent = content ? this.parseHTMLString(content) : [];
        
        children.push({
          type: tagName.toLowerCase(),
          ...(Object.keys(props).length > 0 ? { props } : {}),
          ...(childContent.length > 0 ? { children: childContent } : {})
        });
      }
    }
    
    // If no tags found, return as text
    if (children.length === 0 && html.trim()) {
      // Remove HTML tags for plain text
      const plainText = html.replace(/<[^>]*>/g, '').trim();
      if (plainText) {
        children.push(plainText);
      }
    }
    
    return children;
  }
}
