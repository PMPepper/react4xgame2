

export type KeysWithValsOfType<T,V> = keyof { [ P in keyof T as T[P] extends V ? P : never ] : P } & keyof T;

export type PickKeysMatching<T, U extends string | number | symbol> = Pick<T, Extract<keyof T, U>>
export type OmitKeysMatching<T, U extends string | number | symbol> = Omit<T, Extract<keyof T, U>>
