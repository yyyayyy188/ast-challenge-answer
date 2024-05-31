import actHookCreate from "../src/index";
import generator from "@babel/generator";
import example from "../example-methods.json";
import * as t from "@babel/types";

test("create returns correct AST node", () => {
  //   console.log(example);
  const result: any = actHookCreate(example);
  //   console.log(generator(result).code);
  expect(generator(result).code).toMatchSnapshot();
});
