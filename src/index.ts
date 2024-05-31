import { ExportNamedDeclaration } from "@babel/types";
import { IAstJson } from "./ack.types";
import * as t from "@babel/types";

export default (astJson: IAstJson) => {
  const astKeys = Object.keys(astJson);
  if (astKeys.length === 0) return;
  const results = astKeys.flatMap((astKey) => {
    const requestType = astJson[astKey].requestType;
    const responseType = astJson[astKey].responseType;
    const interfaceDeclare = createInterface(astKey, requestType, responseType);
    const hookDeclare = createHook(astKey, requestType, responseType);
    return [interfaceDeclare, hookDeclare];
  });

  return t.program(results);
};

export const createInterface = (
  astKey: string,
  requestType: string,
  responseType: string
) => {
  //create interface
  const interfaceId = t.identifier(`Use${astKey}Query`);

  //create param
  const typeParam = t.tsTypeParameterDeclaration([
    t.tsTypeParameter(null, null, "TData"),
  ]);
  //add extends
  const extendsClause = t.tsExpressionWithTypeArguments(
    t.identifier("ReactQueryParams"),
    t.tsTypeParameterInstantiation([
      t.tsTypeReference(t.identifier(responseType)),
      t.tsTypeReference(t.identifier("TData")),
    ])
  );

  // create interface body
  const propertySignature = t.tsPropertySignature(
    t.identifier("request"),
    t.tsTypeAnnotation(t.tsTypeReference(t.identifier(requestType)))
  );
  propertySignature.optional = true;

  const interfaceBody = t.tSInterfaceBody([propertySignature]);

  // create interface declaration
  const interfaceDeclaration = t.tsInterfaceDeclaration(
    interfaceId,
    typeParam,
    [extendsClause],
    interfaceBody
  );
  return t.exportNamedDeclaration(interfaceDeclaration, []);
};

export const createHook = (
  astKey: string,
  requestType: string,
  responseType: string
) => {
  const hookId = t.identifier(`use${astKey}`);

  const typeParameterDeclaration = t.tsTypeParameterDeclaration([
    t.tsTypeParameter(
      null,
      t.tsTypeReference(t.identifier(responseType)),
      "TData"
    ),
  ]);

  const params = [
    t.objectPattern([
      t.objectProperty(
        t.identifier("request"),
        t.identifier("request"),
        false,
        true
      ),
      t.objectProperty(
        t.identifier("options"),
        t.identifier("options"),
        false,
        true
      ),
    ]),
  ];

  const hookBody = t.blockStatement([
    t.returnStatement(
      t.callExpression(t.identifier("useQuery"), [
        t.arrayExpression([
          t.stringLiteral(`${astKey}Query`),
          t.identifier("request"),
        ]),
        t.arrowFunctionExpression(
          [],
          t.blockStatement([
            t.ifStatement(
              t.unaryExpression("!", t.identifier("queryService")),
              t.throwStatement(
                t.newExpression(t.identifier("Error"), [
                  t.stringLiteral("Query Service not initialized"),
                ])
              )
            ),
            t.returnStatement(
              t.callExpression(
                t.memberExpression(
                  t.identifier("queryService"),
                  t.identifier(astKey.toLowerCase())
                ),
                [t.identifier("request")]
              )
            ),
          ])
        ),
        t.identifier("options"),
      ])
    ),
  ]);

  const hookFunction = t.arrowFunctionExpression(params, hookBody, false);

  hookFunction.typeParameters = typeParameterDeclaration;
  hookFunction.returnType = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.identifier("UseQueryResult"),
      t.tsTypeParameterInstantiation([t.tsTypeReference(t.identifier("TData"))])
    )
  );

  const hookDeclaration = t.variableDeclaration("const", [
    t.variableDeclarator(hookId, hookFunction),
  ]);

  return hookDeclaration;
};
