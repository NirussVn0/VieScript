export type NodeType =
  | "Program" | "VariableDeclaration" | "FunctionDeclaration" | "ClassDeclaration"
  | "IfStatement" | "WhileStatement" | "ForStatement" | "ReturnStatement"
  | "BlockStatement" | "ExpressionStatement" | "AssignmentExpression" | "CallExpression"
  | "BinaryExpression" | "MemberExpression" | "NewExpression" | "Identifier"
  | "ThisExpression" | "NumericLiteral" | "StringLiteral" | "BooleanLiteral"
  | "NullLiteral" | "ArrayLiteral";

export interface Statement { type: NodeType; }
export interface Expression extends Statement {}

export interface Program extends Statement { type: "Program"; body: Statement[]; }
export interface BlockStatement extends Statement { type: "BlockStatement"; body: Statement[]; }
export interface ExpressionStatement extends Statement { type: "ExpressionStatement"; expression: Expression; }
export interface VariableDeclaration extends Statement { type: "VariableDeclaration"; identifier: string; value: Expression; }
export interface FunctionDeclaration extends Statement { type: "FunctionDeclaration"; name: Identifier; params: Identifier[]; body: BlockStatement; }
export interface ClassDeclaration extends Statement { type: "ClassDeclaration"; name: Identifier; methods: FunctionDeclaration[]; }
export interface ReturnStatement extends Statement { type: "ReturnStatement"; argument: Expression; }
export interface IfStatement extends Statement { type: "IfStatement"; test: Expression; consequent: Statement; alternate: Statement | null; }
export interface WhileStatement extends Statement { type: "WhileStatement"; test: Expression; body: Statement; }
export interface ForStatement extends Statement { type: "ForStatement"; iterator: Identifier; iterable: Expression; body: Statement; }

export interface AssignmentExpression extends Expression { type: "AssignmentExpression"; left: Expression; right: Expression; }
export interface BinaryExpression extends Expression { type: "BinaryExpression"; left: Expression; operator: string; right: Expression; }
export interface CallExpression extends Expression { type: "CallExpression"; callee: Expression; args: Expression[]; }
export interface MemberExpression extends Expression { type: "MemberExpression"; object: Expression; property: Expression; computed: boolean; }
export interface NewExpression extends Expression { type: "NewExpression"; callee: Identifier; args: Expression[]; }
export interface ArrayLiteral extends Expression { type: "ArrayLiteral"; elements: Expression[]; }

export interface Identifier extends Expression { type: "Identifier"; name: string; }
export interface ThisExpression extends Expression { type: "ThisExpression"; }
export interface NumericLiteral extends Expression { type: "NumericLiteral"; value: number; }
export interface StringLiteral extends Expression { type: "StringLiteral"; value: string; }
export interface BooleanLiteral extends Expression { type: "BooleanLiteral"; value: boolean; }
export interface NullLiteral extends Expression { type: "NullLiteral"; }

export const createProgram = (body: Statement[]): Program => ({ type: "Program", body });
export const createBlockStatement = (body: Statement[]): BlockStatement => ({ type: "BlockStatement", body });
export const createExpressionStatement = (expression: Expression): ExpressionStatement => ({ type: "ExpressionStatement", expression });
export const createVariableDeclaration = (identifier: string, value: Expression): VariableDeclaration => ({ type: "VariableDeclaration", identifier, value });
export const createFunctionDeclaration = (name: Identifier, params: Identifier[], body: BlockStatement): FunctionDeclaration => ({ type: "FunctionDeclaration", name, params, body });
export const createClassDeclaration = (name: Identifier, methods: FunctionDeclaration[]): ClassDeclaration => ({ type: "ClassDeclaration", name, methods });
export const createReturnStatement = (argument: Expression): ReturnStatement => ({ type: "ReturnStatement", argument });
export const createIfStatement = (test: Expression, consequent: Statement, alternate: Statement | null): IfStatement => ({ type: "IfStatement", test, consequent, alternate });
export const createWhileStatement = (test: Expression, body: Statement): WhileStatement => ({ type: "WhileStatement", test, body });
export const createForStatement = (iterator: Identifier, iterable: Expression, body: Statement): ForStatement => ({ type: "ForStatement", iterator, iterable, body });

export const createAssignmentExpression = (left: Expression, right: Expression): AssignmentExpression => ({ type: "AssignmentExpression", left, right });
export const createBinaryExpression = (left: Expression, operator: string, right: Expression): BinaryExpression => ({ type: "BinaryExpression", left, operator, right });
export const createCallExpression = (callee: Expression, args: Expression[]): CallExpression => ({ type: "CallExpression", callee, args });
export const createMemberExpression = (object: Expression, property: Expression, computed: boolean): MemberExpression => ({ type: "MemberExpression", object, property, computed });
export const createNewExpression = (callee: Identifier, args: Expression[]): NewExpression => ({ type: "NewExpression", callee, args });
export const createArrayLiteral = (elements: Expression[]): ArrayLiteral => ({ type: "ArrayLiteral", elements });

export const createIdentifier = (name: string): Identifier => ({ type: "Identifier", name });
export const createThisExpression = (): ThisExpression => ({ type: "ThisExpression" });
export const createNumericLiteral = (value: number): NumericLiteral => ({ type: "NumericLiteral", value });
export const createStringLiteral = (value: string): StringLiteral => ({ type: "StringLiteral", value });
export const createBooleanLiteral = (value: boolean): BooleanLiteral => ({ type: "BooleanLiteral", value });
export const createNullLiteral = (): NullLiteral => ({ type: "NullLiteral" });