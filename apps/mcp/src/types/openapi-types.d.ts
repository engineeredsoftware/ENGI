declare module 'openapi-types' {
  export namespace OpenAPIV3 {
    type Primitive = string | number | boolean | null;
    export type AnyObject = Record<string, Primitive | Primitive[] | AnyObject | AnyObject[]>;
    export type Document = Record<string, any>;
  }
}
