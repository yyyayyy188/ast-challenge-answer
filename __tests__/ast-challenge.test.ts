import actHookCreate from "../src/index";
import generator from "@babel/generator";

/**
 * Test case to verify the AST node creation for a given JSON input.
 * The test checks if the generated AST node matches the expected snapshot.
 */
test("create returns correct AST node", () => {
  const astJson = {
    Pools: {
      requestType: "QueryPoolsRequest",
      responseType: "QueryPoolsResponse",
    },
  };
  const result:any = actHookCreate(astJson);
  expect(generator(result).code).toMatchSnapshot();
});
