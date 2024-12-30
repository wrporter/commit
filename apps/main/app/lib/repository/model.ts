export type Serialized<T> = {
  [P in keyof T]: T[P] extends Date ? string : Serialized<T[P]>;
};

export const serialize = <T>(model: T): Serialized<T> =>
  JSON.parse(JSON.stringify(model));
