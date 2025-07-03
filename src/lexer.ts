
export enum TokenType {
  CHO, NẾU, CÒN_NẾU, NGƯỢC_LẠI, KHI, VỚI_MỖI, TRONG, HÀM, TRẢ_VỀ,
  ĐÚNG, SAI, RỖNG, VÀ, HOẶC, LỚP, MỚI,
  THIS,

  IDENTIFIER, NUMBER, STRING,
  EQUAL, PLUS, MINUS, STAR, SLASH,
  LPAREN, RPAREN, LBRACE, RBRACE, LBRACKET, RBRACKET,
  COMMA, DOT, GT, LT, GTE, LTE, EQ_EQ, NOT_EQ,
  EOF,
}

export interface Token { type: TokenType; value: string; line: number; }

const KEYWORDS: Record<string, TokenType> = {};
KEYWORDS['cho'] = TokenType.CHO;
KEYWORDS['nếu'] = TokenType.NẾU;
KEYWORDS['còn_nếu'] = TokenType.CÒN_NẾU;
KEYWORDS['ngược_lại'] = TokenType.NGƯỢC_LẠI;
KEYWORDS['khi'] = TokenType.KHI;
KEYWORDS['với_mỗi'] = TokenType.VỚI_MỖI;
KEYWORDS['trong'] = TokenType.TRONG;
KEYWORDS['hàm'] = TokenType.HÀM;
KEYWORDS['trả_về'] = TokenType.TRẢ_VỀ;
KEYWORDS['đúng'] = TokenType.ĐÚNG;
KEYWORDS['sai'] = TokenType.SAI;
KEYWORDS['rỗng'] = TokenType.RỖNG;
KEYWORDS['và'] = TokenType.VÀ;
KEYWORDS['hoặc'] = TokenType.HOẶC;
KEYWORDS['lớp'] = TokenType.LỚP;
KEYWORDS['mới'] = TokenType.MỚI;
KEYWORDS['this'] = TokenType.THIS;

export class Lexer {
  private source: string;
  private tokens: Token[] = [];
  private start = 0;
  private current = 0;
  private line = 1;

  constructor(source: string) {
    this.source = source;
  }

  public tokenize(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }
    this.tokens.push({ type: TokenType.EOF, value: '', line: this.line });
    return this.tokens;
  }

  private scanToken(): void {
    const c = this.advance();
    switch (c) {
      case '(': this.addToken(TokenType.LPAREN); break;
      case ')': this.addToken(TokenType.RPAREN); break;
      case '{': this.addToken(TokenType.LBRACE); break;
      case '}': this.addToken(TokenType.RBRACE); break;
      case '[': this.addToken(TokenType.LBRACKET); break;
      case ']': this.addToken(TokenType.RBRACKET); break;
      case ',': this.addToken(TokenType.COMMA); break;
      case '.': this.addToken(TokenType.DOT); break;
      case '-': this.addToken(TokenType.MINUS); break;
      case '+': this.addToken(TokenType.PLUS); break;
      case '*': this.addToken(TokenType.STAR); break;
      case '/': this.addToken(TokenType.SLASH); break;

      case '!': this.addToken(this.match('=') ? TokenType.NOT_EQ : TokenType.IDENTIFIER); break;
      case '=': this.addToken(this.match('=') ? TokenType.EQ_EQ : TokenType.EQUAL); break;
      case '<': this.addToken(this.match('=') ? TokenType.LTE : TokenType.LT); break;
      case '>': this.addToken(this.match('=') ? TokenType.GTE : TokenType.GT); break;

      case ' ': case '\r': case '\t': break;
      case '\n': this.line++; break;

      case '"': case "'": this.scanString(c); break;

      case '#':
        while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
        break;

      default:
        if (this.isDigit(c)) {
          this.scanNumber();
        } else if (this.isAlpha(c)) {
          this.scanIdentifier();
        } else {
          throw new Error(`[Dòng ${this.line}] Ký tự không hợp lệ: ${c}`);
        }
        break;
    }
  }

  private scanIdentifier(): void {
    while (this.isAlphaNumeric(this.peek())) this.advance();
    const text = this.source.substring(this.start, this.current);
    const type = KEYWORDS[text] || TokenType.IDENTIFIER;
    this.addToken(type);
  }

  private scanNumber(): void {
    while (this.isDigit(this.peek())) this.advance();
    this.addToken(TokenType.NUMBER);
  }

  private scanString(quoteType: string): void {
    while (this.peek() !== quoteType && !this.isAtEnd()) {
      if (this.peek() === '\n') this.line++;
      this.advance();
    }
    if (this.isAtEnd()) {
      throw new Error(`[Dòng ${this.line}] Chuỗi không được đóng.`);
    }
    this.advance();
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private isAtEnd = (): boolean => this.current >= this.source.length;
  private advance = (): string => this.source.charAt(this.current++);
  private peek = (): string => this.isAtEnd() ? '\0' : this.source.charAt(this.current);
  private match = (expected: string): boolean => {
    if (this.isAtEnd() || this.source.charAt(this.current) !== expected) return false;
    this.current++;
    return true;
  };

  private addToken(type: TokenType, literal?: any): void {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push({
      type: type,
      value: literal !== undefined ? literal : text,
      line: this.line
    });
  }

  private isDigit = (c: string): boolean => c >= '0' && c <= '9';
  private isAlpha = (c: string): boolean => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_' || /[àáâãèéêìíòóôõùúăđĩũơưăạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/.test(c);
  private isAlphaNumeric = (c: string): boolean => this.isAlpha(c) || this.isDigit(c);
}