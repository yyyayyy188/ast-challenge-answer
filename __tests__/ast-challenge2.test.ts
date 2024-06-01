import actHookCreate from "../src/index";
import generator from "@babel/generator";
import example from "../example-methods.json";

/**
 * Test case to verify the AST node creation from example-methods.json.
 * The test checks if the generated AST node matches the expected snapshot.
 */
test("create returns correct AST node", () => {
  const result: any = actHookCreate(example);
  expect(generator(result).code).toMatchSnapshot();
});
