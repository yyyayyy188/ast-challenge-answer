import actHookCreate from "../src/index";
import generator from "@babel/generator";
import example from "../example-methods.json";
import * as t from "@babel/types";

test("create returns correct AST node", () => {
  //   console.log(example);
  const astJson = {
    Pools: {
      requestType: "QueryPoolsRequest",
      responseType: "QueryPoolsResponse",
    },
  };
  const result: any = actHookCreate(astJson);
  console.log(generator(result).code);
  expect(generator(result).code).toMatchSnapshot();
});
