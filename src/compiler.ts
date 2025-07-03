import * as fs from 'fs';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { CodeGenerator } from './codeGenerator';
import { CompilerError } from './error';
import { standardLibraryCode } from './standardLibrary';

function compileAndRun(filePath: string) {
  if (!filePath) {
    console.error("Lỗi: Vui lòng cung cấp đường dẫn đến file .vie");
    console.log("Cách dùng: npx ts-node src/compiler.ts <tên_file>.vie");
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`Lỗi: Không tìm thấy file '${filePath}'`);
    process.exit(1);
  }

  const sourceCode = fs.readFileSync(filePath, 'utf-8');

  try {
    const lexer = new Lexer(sourceCode);
    const tokens = lexer.tokenize();
    // console.log("--- TOKENS ---");
    // console.log(tokens);

    const parser = new Parser(tokens);
    const ast = parser.parse();
    // console.log("--- AST ---");
    // console.log(JSON.stringify(ast, null, 2));

    const generator = new CodeGenerator();
    const userJsCode = generator.generate(ast);
    const finalJsCode = `${standardLibraryCode}\n\n// Mã nguồn của bạn\n(async () => {\n${userJsCode}\n})();`;
    
    console.log("\n--- Mã JavaScript được sinh ra ---");
    console.log(finalJsCode);
    console.log("----------------------------------\n");
    
    console.log("--- Kết quả thực thi ---");
    eval(finalJsCode);
    console.log("--------------------------\n");

  } catch (e: any) {
    if (e instanceof CompilerError) {
      console.error(e.format(sourceCode));
    } else {
      console.error("\n*** Đã xảy ra lỗi hệ thống trong trình biên dịch ***");
      console.error(e);
    }
    process.exit(1);
  }
}

const filePath = process.argv[2];
compileAndRun(filePath);