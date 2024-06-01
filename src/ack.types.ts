
/**
 * Represents the structure of an AST JSON object.
 * Each key maps to an object containing request and response types.
 */
export interface IAstJson {
  [key: string]: IAstJsonHttp;
}

/**
 * Represents the request and response types for an AST node.
 */
export interface IAstJsonHttp {
  requestType: string;
  responseType: string;
}
