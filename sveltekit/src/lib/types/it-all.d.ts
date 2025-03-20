declare module "it-all" {
  export default function all<T>(source: AsyncIterable<T> | Iterable<T>): Promise<Array<T>>;
}
