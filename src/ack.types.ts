export interface IAstJson {
  [key: string]: IAstJsonHttp;
}

export interface IAstJsonHttp {
  requestType: string;
  responseType: string;
}
