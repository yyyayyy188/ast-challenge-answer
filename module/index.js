import * as t from "@babel/types";

/**
 * Generates a Babel AST program from an IAstJson object.
 *
 * @param {IAstJson} astJson - The input JSON object representing the AST.
 * @returns {t.Program} A Babel AST program.
 */
export default (astJson => {
  const astKeys = Object.keys(astJson);
  if (astKeys.length === 0) return;
  const results = astKeys.flatMap(astKey => {
    const requestType = astJson[astKey].requestType;
    const responseType = astJson[astKey].responseType;
    const interfaceDeclare = createInterface(astKey, requestType, responseType);
    const hookDeclare = createHook(astKey, requestType, responseType);
    return [interfaceDeclare, hookDeclare];
  });
  return t.program(results);
});

/**
 * Creates a TypeScript interface declaration.
 *
 * @param {string} astKey - The key of the AST node.
 * @param {string} requestType - The type of the request parameter.
 * @param {string} responseType - The type of the response parameter.
 * @returns {ExportNamedDeclaration} The Babel AST node for the interface declaration.
 */

export const createInterface = (astKey, requestType, responseType) => {
  const interfaceId = t.identifier(`Use${astKey}Query`);
  const typeParam = t.tsTypeParameterDeclaration([t.tsTypeParameter(null, null, "TData")]);
  //add extends
  const extendsClause = t.tsExpressionWithTypeArguments(t.identifier("ReactQueryParams"), t.tsTypeParameterInstantiation([t.tsTypeReference(t.identifier(responseType)), t.tsTypeReference(t.identifier("TData"))]));

  // create interface body
  const propertySignature = t.tsPropertySignature(t.identifier("request"), t.tsTypeAnnotation(t.tsTypeReference(t.identifier(requestType))));
  propertySignature.optional = true;
  const interfaceBody = t.tSInterfaceBody([propertySignature]);
  const interfaceDeclaration = t.tsInterfaceDeclaration(interfaceId, typeParam, [extendsClause], interfaceBody);
  return t.exportNamedDeclaration(interfaceDeclaration, []);
};

/**
 * Creates a React hook function declaration.
 *
 * @param {string} astKey - The key of the AST node.
 * @param {string} requestType - The type of the request parameter.
 * @param {string} responseType - The type of the response parameter.
 * @returns {VariableDeclaration} The Babel AST node for the hook function declaration.
 */
export const createHook = (astKey, requestType, responseType) => {
  const hookId = t.identifier(`use${astKey}`);
  const typeParameterDeclaration = t.tsTypeParameterDeclaration([t.tsTypeParameter(null, t.tsTypeReference(t.identifier(responseType)), "TData")]);
  const params = [t.objectPattern([t.objectProperty(t.identifier("request"), t.identifier("request"), false, true), t.objectProperty(t.identifier("options"), t.identifier("options"), false, true)])];

  //return hook body
  const hookBody = t.blockStatement([t.returnStatement(t.callExpression(t.identifier("useQuery"), [t.arrayExpression([t.stringLiteral(`${astKey}Query`), t.identifier("request")]), t.arrowFunctionExpression([], t.blockStatement([t.ifStatement(t.unaryExpression("!", t.identifier("queryService")), t.throwStatement(t.newExpression(t.identifier("Error"), [t.stringLiteral("Query Service not initialized")]))), t.returnStatement(t.callExpression(t.memberExpression(t.identifier("queryService"), t.identifier(astKey.toLowerCase())), [t.identifier("request")]))])), t.identifier("options")]))]);
  const hookFunction = t.arrowFunctionExpression(params, hookBody, false);
  hookFunction.typeParameters = typeParameterDeclaration;
  hookFunction.returnType = t.tsTypeAnnotation(t.tsTypeReference(t.identifier("UseQueryResult"), t.tsTypeParameterInstantiation([t.tsTypeReference(t.identifier("TData"))])));
  const hookDeclaration = t.variableDeclaration("const", [t.variableDeclarator(hookId, hookFunction)]);
  return hookDeclaration;
};