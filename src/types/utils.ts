

export type KeysWithValsOfType<T,V> = keyof { [ P in keyof T as T[P] extends V ? P : never ] : P } & keyof T;

export type PickKeysMatching<T, U extends string | number | symbol> = Pick<T, Extract<keyof T, U>>
export type OmitKeysMatching<T, U extends string | number | symbol> = Omit<T, Extract<keyof T, U>>

export type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
export type FlattenRecursive<Type> = Type extends Array<infer Item> ? FlattenRecursive<Item> : Type;