import * as AST from './ast';

export class CodeGenerator {
  private indentLevel = 0;
  private getIndent = () => '  '.repeat(this.indentLevel);

  public generate(node: AST.Statement): string {
    switch (node.type) {
      case 'Program':
        return (node as AST.Program).body.map(s => this.generate(s)).join('\n');

      case 'BlockStatement': {
        this.indentLevel++;
        const body = (node as AST.BlockStatement).body.map(s => this.generate(s)).join('\n');
        this.indentLevel--;
        return body;
      }

      case 'ExpressionStatement':
        return `${this.getIndent()}${this.generate((node as AST.ExpressionStatement).expression)};`;

      case 'VariableDeclaration': {
        const varDecl = node as AST.VariableDeclaration;
        return `${this.getIndent()}let ${varDecl.identifier} = ${this.generate(varDecl.value)};`;
      }

      case 'FunctionDeclaration': {
        const funcDecl = node as AST.FunctionDeclaration;
        const params = funcDecl.params.map(p => p.name).join(', ');
        const functionHeader = `${this.getIndent()}function ${funcDecl.name.name}(${params}) {`;
        const functionBody = this.generate(funcDecl.body);
        const functionFooter = `${this.getIndent()}}`;
        return `${functionHeader}\n${functionBody}\n${functionFooter}`;
      }

      case 'ReturnStatement':
        return `${this.getIndent()}return ${this.generate((node as AST.ReturnStatement).argument)};`;

      case 'IfStatement': {
        const ifStmt = node as AST.IfStatement;
        const test = this.generate(ifStmt.test);
        const consequentCode = this.generate(ifStmt.consequent);
        const consequent = ifStmt.consequent.type === 'BlockStatement' ? `{\n${consequentCode}\n${this.getIndent()}}` : ` ${consequentCode}`;
        let code = `${this.getIndent()}if (${test})${consequent}`;
        if (ifStmt.alternate) {
          code += ` else ${this.generate(ifStmt.alternate)}`;
        }
        return code;
      }

      case 'WhileStatement': {
        const whileStmt = node as AST.WhileStatement;
        const test = this.generate(whileStmt.test);
        const whileBodyCode = this.generate(whileStmt.body);
        const whileBody = whileStmt.body.type === 'BlockStatement' ? `{\n${whileBodyCode}\n${this.getIndent()}}` : ` ${whileBodyCode}`;
        return `${this.getIndent()}while (${test})${whileBody}`;
      }

      case 'ForStatement': {
        const forStmt = node as AST.ForStatement;
        const iterator = this.generate(forStmt.iterator);
        const iterable = this.generate(forStmt.iterable);
        const forBodyCode = this.generate(forStmt.body);
        const forBody = forStmt.body.type === 'BlockStatement' ? `{\n${forBodyCode}\n${this.getIndent()}}` : ` ${forBodyCode}`;
        return `${this.getIndent()}for (const ${iterator} of ${iterable})${forBody}`;
      }

      case 'ClassDeclaration': {
        const classDecl = node as AST.ClassDeclaration;
        let classBody = '';
        this.indentLevel++;
        for (const method of classDecl.methods) {
          const methodName = method.name.name === 'khởi_tạo' ? 'constructor' : method.name.name;
          const params = method.params.map(p => p.name).join(', ');
          const methodHeader = `${this.getIndent()}${methodName}(${params}) {`;
          const methodBody = this.generate(method.body);
          const methodFooter = `${this.getIndent()}}`;
          classBody += `${methodHeader}\n${methodBody}\n${methodFooter}\n`;
        }
        this.indentLevel--;
        return `${this.getIndent()}class ${classDecl.name.name} {\n${classBody}${this.getIndent()}}`;
      }

      case 'AssignmentExpression': {
        const assignExpr = node as AST.AssignmentExpression;
        return `(${this.generate(assignExpr.left)} = ${this.generate(assignExpr.right)})`;
      }

      case 'BinaryExpression': {
        const binExpr = node as AST.BinaryExpression;
        return `(${this.generate(binExpr.left)} ${binExpr.operator} ${this.generate(binExpr.right)})`;
      }

      case 'CallExpression': {
        const callExpr = node as AST.CallExpression;
        const callee = this.generate(callExpr.callee);
        const args = callExpr.args.map((arg: AST.Expression) => this.generate(arg)).join(', ');
        if (callee === 'in') return `console.log(${args})`;
        return `${callee}(${args})`;
      }

      case 'MemberExpression': {
        const memExpr = node as AST.MemberExpression;
        const object = this.generate(memExpr.object);
        if (memExpr.computed) {
          const property = this.generate(memExpr.property);
          return `${object}[${property}]`;
        } else {
          const property = this.generate(memExpr.property);
          return `${object}.${property}`;
        }
      }

      case 'NewExpression': {
        const newExpr = node as AST.NewExpression;
        const callee = this.generate(newExpr.callee);
        const args = newExpr.args.map((arg: AST.Expression) => this.generate(arg)).join(', ');
        return `new ${callee}(${args})`;
      }

      case 'Identifier': return (node as AST.Identifier).name;
      case 'ThisExpression': return 'this';
      case 'NumericLiteral': return (node as AST.NumericLiteral).value.toString();
      case 'StringLiteral': return `"${(node as AST.StringLiteral).value.replace(/"/g, '\\"')}"`;
      case 'BooleanLiteral': return (node as AST.BooleanLiteral).value.toString();
      case 'NullLiteral': return 'null';
      case 'ArrayLiteral':
        return `[${(node as AST.ArrayLiteral).elements.map((el: AST.Expression) => this.generate(el)).join(', ')}]`;

      default:
        throw new Error(`CodeGenerator: Không thể sinh mã cho node loại: ${(node as any).type}`);
    }
  }
}