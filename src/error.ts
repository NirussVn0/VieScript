import { Token } from './lexer';

export class CompilerError extends Error {
  constructor(public token: Token, message: string) {
    super(message);
    this.name = 'CompilerError';
  }

  public format(sourceCode: string): string {
    const lines = sourceCode.split('\n');
    const errorLine = lines[this.token.line - 1];

    if (!errorLine) {
        return `Lỗi tại dòng ${this.token.line}: ${this.message}`;
    }

    const valueToUnderline = this.token.value === '{' || this.token.value === '}' ? this.token.value : this.token.value.trim();
    const column = errorLine.indexOf(valueToUnderline);
    const pointer = ' '.repeat(column >= 0 ? column : 0) + '^'.repeat(valueToUnderline.length);
    
    return `
--- Lỗi Biên Dịch ---
${this.message}

Tại dòng ${this.token.line}:
  ${errorLine}
  ${pointer}
--------------------
`;
  }
}