"use strict";

var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.createInterface = exports.createHook = void 0;
var t = _interopRequireWildcard(require("@babel/types"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
/**
 * Generates a Babel AST program from an IAstJson object.
 *
 * @param {IAstJson} astJson - The input JSON object representing the AST.
 * @returns {t.Program} A Babel AST program.
 */
var _default = exports["default"] = function _default(astJson) {
  var astKeys = Object.keys(astJson);
  if (astKeys.length === 0) return;
  var results = astKeys.flatMap(function (astKey) {
    var requestType = astJson[astKey].requestType;
    var responseType = astJson[astKey].responseType;
    var interfaceDeclare = createInterface(astKey, requestType, responseType);
    var hookDeclare = createHook(astKey, requestType, responseType);
    return [interfaceDeclare, hookDeclare];
  });
  return t.program(results);
};
/**
 * Creates a TypeScript interface declaration.
 *
 * @param {string} astKey - The key of the AST node.
 * @param {string} requestType - The type of the request parameter.
 * @param {string} responseType - The type of the response parameter.
 * @returns {ExportNamedDeclaration} The Babel AST node for the interface declaration.
 */
var createInterface = exports.createInterface = function createInterface(astKey, requestType, responseType) {
  var interfaceId = t.identifier("Use".concat(astKey, "Query"));
  var typeParam = t.tsTypeParameterDeclaration([t.tsTypeParameter(null, null, "TData")]);
  //add extends
  var extendsClause = t.tsExpressionWithTypeArguments(t.identifier("ReactQueryParams"), t.tsTypeParameterInstantiation([t.tsTypeReference(t.identifier(responseType)), t.tsTypeReference(t.identifier("TData"))]));

  // create interface body
  var propertySignature = t.tsPropertySignature(t.identifier("request"), t.tsTypeAnnotation(t.tsTypeReference(t.identifier(requestType))));
  propertySignature.optional = true;
  var interfaceBody = t.tSInterfaceBody([propertySignature]);
  var interfaceDeclaration = t.tsInterfaceDeclaration(interfaceId, typeParam, [extendsClause], interfaceBody);
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
var createHook = exports.createHook = function createHook(astKey, requestType, responseType) {
  var hookId = t.identifier("use".concat(astKey));
  var typeParameterDeclaration = t.tsTypeParameterDeclaration([t.tsTypeParameter(null, t.tsTypeReference(t.identifier(responseType)), "TData")]);
  var params = [t.objectPattern([t.objectProperty(t.identifier("request"), t.identifier("request"), false, true), t.objectProperty(t.identifier("options"), t.identifier("options"), false, true)])];

  //return hook body
  var hookBody = t.blockStatement([t.returnStatement(t.callExpression(t.identifier("useQuery"), [t.arrayExpression([t.stringLiteral("".concat(astKey, "Query")), t.identifier("request")]), t.arrowFunctionExpression([], t.blockStatement([t.ifStatement(t.unaryExpression("!", t.identifier("queryService")), t.throwStatement(t.newExpression(t.identifier("Error"), [t.stringLiteral("Query Service not initialized")]))), t.returnStatement(t.callExpression(t.memberExpression(t.identifier("queryService"), t.identifier(astKey.toLowerCase())), [t.identifier("request")]))])), t.identifier("options")]))]);
  var hookFunction = t.arrowFunctionExpression(params, hookBody, false);
  hookFunction.typeParameters = typeParameterDeclaration;
  hookFunction.returnType = t.tsTypeAnnotation(t.tsTypeReference(t.identifier("UseQueryResult"), t.tsTypeParameterInstantiation([t.tsTypeReference(t.identifier("TData"))])));
  var hookDeclaration = t.variableDeclaration("const", [t.variableDeclarator(hookId, hookFunction)]);
  return hookDeclaration;
};