import { Token, TokenType } from "./lexer";
import * as AST from "./ast";
import { CompilerError } from "./error";

export class Parser {
  private current = 0;
  constructor(private tokens: Token[]) { }

  public parse(): AST.Program {
    const body: AST.Statement[] = [];
    while (!this.isAtEnd()) { body.push(this.parseDeclaration()); }
    return AST.createProgram(body);
  }

  private parseDeclaration(): AST.Statement {
    try {
      if (this.match(TokenType.CHO)) return this.parseVariableDeclaration();
      if (this.match(TokenType.HÀM)) return this.parseFunctionDeclaration("function");
      if (this.match(TokenType.LỚP)) return this.parseClassDeclaration();

      return this.parseStatement();
    } catch (e) {
      if (!(e instanceof CompilerError)) throw e;
      this.synchronize();
      throw e;
    }
  }

  private parseStatement(): AST.Statement {
    if (this.match(TokenType.NẾU)) return this.parseIfStatement();
    if (this.match(TokenType.KHI)) return this.parseWhileStatement();
    if (this.match(TokenType.VỚI_MỖI)) return this.parseForStatement();
    if (this.match(TokenType.LBRACE)) return AST.createBlockStatement(this.parseBlock());
    if (this.match(TokenType.TRẢ_VỀ)) return this.parseReturnStatement();

    return this.parseExpressionStatement();
  }

  private parseVariableDeclaration(): AST.VariableDeclaration {
    const name = this.consume(TokenType.IDENTIFIER, "Cần một tên biến hợp lệ sau từ khóa 'cho'.");
    this.consume(TokenType.EQUAL, "Thiếu dấu '=' trong câu lệnh khai báo biến.");
    const value = this.parseExpression();
    return AST.createVariableDeclaration(name.value, value);
  }

  private parseFunctionDeclaration(kind: "function" | "method"): AST.FunctionDeclaration {
    const name = this.consume(TokenType.IDENTIFIER, `Cần tên cho ${kind}.`);
    this.consume(TokenType.LPAREN, "Cần '(' sau tên hàm.");
    const params: AST.Identifier[] = [];
    if (!this.check(TokenType.RPAREN)) {
      do { params.push(this.parseIdentifier()); } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RPAREN, "Cần ')' sau danh sách tham số.");
    this.consume(TokenType.LBRACE, "Cần '{' trước khối lệnh của hàm.");
    const body = AST.createBlockStatement(this.parseBlock());
    return AST.createFunctionDeclaration(AST.createIdentifier(name.value), params, body);
  }

  private parseClassDeclaration(): AST.ClassDeclaration {
    const name = this.parseIdentifier();
    this.consume(TokenType.LBRACE, "Cần '{' sau tên lớp.");
    const methods: AST.FunctionDeclaration[] = [];
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      if (!this.match(TokenType.HÀM)) {
        throw new CompilerError(this.peek(), "Trong lớp chỉ được định nghĩa hàm bằng từ khóa 'hàm'.");
      }
      methods.push(this.parseFunctionDeclaration("method"));
    }
    this.consume(TokenType.RBRACE, "Cần '}' để kết thúc định nghĩa lớp.");
    return AST.createClassDeclaration(name, methods);
  }

  private parseIfStatement(): AST.Statement {
    this.consume(TokenType.LPAREN, "Cần '(' sau 'nếu'.");
    const test = this.parseExpression();
    this.consume(TokenType.RPAREN, "Cần ')' sau điều kiện if.");
    const consequent = this.parseStatement();
    let alternate: AST.Statement | null = null;
    if (this.match(TokenType.NGƯỢC_LẠI)) {
      if (this.match(TokenType.NẾU)) { alternate = this.parseIfStatement(); }
      else { alternate = this.parseStatement(); }
    } else if (this.match(TokenType.CÒN_NẾU)) { alternate = this.parseIfStatement(); }
    return AST.createIfStatement(test, consequent, alternate);
  }

  private parseWhileStatement(): AST.WhileStatement {
    this.consume(TokenType.LPAREN, "Cần '(' sau 'khi'.");
    const test = this.parseExpression();
    this.consume(TokenType.RPAREN, "Cần ')' sau điều kiện while.");
    const body = this.parseStatement();
    return AST.createWhileStatement(test, body);
  }

  private parseForStatement(): AST.ForStatement {
    this.consume(TokenType.LPAREN, "Cần '(' sau 'với_mỗi'.");
    const iterator = this.parseIdentifier();
    this.consume(TokenType.TRONG, "Thiếu từ khóa 'trong' ở vòng lặp.");
    const iterable = this.parseExpression();
    this.consume(TokenType.RPAREN, "Cần ')' để kết thúc khai báo vòng lặp.");
    const body = this.parseStatement();
    return AST.createForStatement(iterator, iterable, body);
  }

  private parseBlock(): AST.Statement[] {
    const statements: AST.Statement[] = [];
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      statements.push(this.parseDeclaration());
    }
    this.consume(TokenType.RBRACE, "Cần '}' để kết thúc khối lệnh.");
    return statements;
  }

  private parseReturnStatement(): AST.ReturnStatement {
    if (this.check(TokenType.RBRACE) || this.peek().type === TokenType.EOF) {
      return AST.createReturnStatement(AST.createNullLiteral());
    }
    const argument = this.parseExpression();
    return AST.createReturnStatement(argument);
  }

  private parseExpressionStatement(): AST.ExpressionStatement {
    const expr = this.parseExpression();
    return AST.createExpressionStatement(expr);
  }

  private parseExpression(): AST.Expression { return this.parseAssignment(); }

  private parseAssignment(): AST.Expression {
    const expr = this.parseOr();
    if (this.match(TokenType.EQUAL)) {
      const value = this.parseAssignment();
      if (expr.type === 'Identifier' || expr.type === 'MemberExpression') {
        return AST.createAssignmentExpression(expr, value);
      }
      throw new CompilerError(this.previous(), 'Mục tiêu gán không hợp lệ.');
    }
    return expr;
  }
  private parseOr(): AST.Expression { let expr = this.parseAnd(); while (this.match(TokenType.HOẶC)) { const right = this.parseAnd(); expr = AST.createBinaryExpression(expr, '||', right); } return expr; }
  private parseAnd(): AST.Expression { let expr = this.parseEquality(); while (this.match(TokenType.VÀ)) { const right = this.parseEquality(); expr = AST.createBinaryExpression(expr, '&&', right); } return expr; }
  private parseEquality(): AST.Expression { let expr = this.parseComparison(); while (this.match(TokenType.NOT_EQ, TokenType.EQ_EQ)) { const op = this.previous().value; const right = this.parseComparison(); expr = AST.createBinaryExpression(expr, op, right); } return expr; }
  private parseComparison(): AST.Expression { let expr = this.parseTerm(); while (this.match(TokenType.GT, TokenType.GTE, TokenType.LT, TokenType.LTE)) { const op = this.previous().value; const right = this.parseTerm(); expr = AST.createBinaryExpression(expr, op, right); } return expr; }
  private parseTerm(): AST.Expression { let expr = this.parseFactor(); while (this.match(TokenType.MINUS, TokenType.PLUS)) { const op = this.previous().value; const right = this.parseFactor(); expr = AST.createBinaryExpression(expr, op, right); } return expr; }
  private parseFactor(): AST.Expression { let expr = this.parseUnary(); while (this.match(TokenType.SLASH, TokenType.STAR)) { const op = this.previous().value; const right = this.parseUnary(); expr = AST.createBinaryExpression(expr, op, right); } return expr; }
  private parseUnary(): AST.Expression { if (this.match(TokenType.MINUS)) { const right = this.parseUnary(); return AST.createBinaryExpression(AST.createNumericLiteral(0), '-', right); } return this.parseCall(); }

  private parseCall(): AST.Expression {
    let expr = this.parsePrimary();
    while (true) {
      if (this.match(TokenType.LPAREN)) {
        expr = this.finishCall(expr);
      } else if (this.match(TokenType.LBRACKET)) {
        const property = this.parseExpression();
        this.consume(TokenType.RBRACKET, "Thiếu ']' sau chỉ số.");
        expr = AST.createMemberExpression(expr, property, true);
      } else if (this.match(TokenType.DOT)) {
        const property = this.parseIdentifier();
        expr = AST.createMemberExpression(expr, property, false);
      }
      else { break; }
    }
    return expr;
  }
  private finishCall(callee: AST.Expression): AST.Expression {
    let args: AST.Expression[] = [];
    if (!this.check(TokenType.RPAREN)) {
      do { args.push(this.parseExpression()); } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RPAREN, "Cần ')' sau các tham số của hàm.");
    return AST.createCallExpression(callee, args);
  }

  private parsePrimary(): AST.Expression {
    if (this.match(TokenType.SAI)) return AST.createBooleanLiteral(false);
    if (this.match(TokenType.ĐÚNG)) return AST.createBooleanLiteral(true);
    if (this.match(TokenType.RỖNG)) return AST.createNullLiteral();
    if (this.match(TokenType.NUMBER)) return AST.createNumericLiteral(parseFloat(this.previous().value));
    if (this.match(TokenType.STRING)) return AST.createStringLiteral(this.previous().value);

    if (this.match(TokenType.IDENTIFIER)) {
      if (this.previous().value === 'this') {
        return AST.createThisExpression();
      }
      return AST.createIdentifier(this.previous().value);
    }

    if (this.match(TokenType.LBRACKET)) {
      const elements: AST.Expression[] = [];
      if (!this.check(TokenType.RBRACKET)) {
        do { elements.push(this.parseExpression()); } while (this.match(TokenType.COMMA));
      }
      this.consume(TokenType.RBRACKET, "Cần ']' sau các phần tử của mảng.");
      return AST.createArrayLiteral(elements);
    }
    if (this.match(TokenType.MỚI)) {
      const callee = this.parseIdentifier();
      this.consume(TokenType.LPAREN, "Cần '(' để khởi tạo lớp.");
      const call = this.finishCall(callee) as AST.CallExpression;
      return AST.createNewExpression(call.callee as AST.Identifier, call.args);
    }
    if (this.match(TokenType.LPAREN)) {
      const expr = this.parseExpression();
      this.consume(TokenType.RPAREN, "Cần ')' sau biểu thức trong ngoặc.");
      return expr;
    }
    throw new CompilerError(this.peek(), `Biểu thức không hợp lệ, bắt đầu bằng token '${this.peek().value}'.`);
  }

  private parseIdentifier(): AST.Identifier {
    const token = this.consume(TokenType.IDENTIFIER, "Cần một tên (identifier).");
    return AST.createIdentifier(token.value);
  }

  private consume(type: TokenType, message: string): Token { if (this.check(type)) return this.advance(); throw new CompilerError(this.peek(), message); }
  private match(...types: TokenType[]): boolean { for (const type of types) { if (this.check(type)) { this.advance(); return true; } } return false; }
  private check = (type: TokenType) => !this.isAtEnd() && this.peek().type === type;
  private advance = () => { if (!this.isAtEnd()) this.current++; return this.previous(); };
  private isAtEnd = () => this.peek().type === TokenType.EOF;
  private peek = () => this.tokens[this.current];
  private previous = () => this.tokens[this.current - 1];
  private synchronize() { this.advance(); while (!this.isAtEnd()) { if (this.previous().type === TokenType.RBRACE) return; switch (this.peek().type) { case TokenType.LỚP: case TokenType.HÀM: case TokenType.CHO: case TokenType.NẾU: case TokenType.KHI: case TokenType.VỚI_MỖI: case TokenType.TRẢ_VỀ: return; } this.advance(); } }
}