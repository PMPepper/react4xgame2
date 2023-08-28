

export type KeysWithValsOfType<T,V> = keyof { [ P in keyof T as T[P] extends V ? P : never ] : P } & keyof T;


export type PickKeysMatching<T, U extends string | number | symbol> = Pick<T, Extract<keyof T, U>>
export type OmitKeysMatching<T, U extends string | number | symbol> = Omit<T, Extract<keyof T, U>>

export type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
export type FlattenRecursive<Type> = Type extends Array<infer Item> ? FlattenRecursive<Item> : Type;

export type Combine<T1, T2> = T1 & T2;//TODO replace with better implementation that gives better code hints
//export type Combine<T1, T2, T3> = T1 & T2 & T3;//TODO replace with better implementation that gives better code hints


export type MapOmit<Type, OmitProp extends string | number | symbol> = {
    [Property in keyof Type]: Omit<Type[Property], OmitProp>
}


export type PartialExcept<Type, ExceptKeys extends keyof Type> = Pick<Type, ExceptKeys> & Partial<Omit<Type, ExceptKeys>>;

export type KeysOfValue<T, TCondition> = {
    [K in keyof T]: T[K] extends TCondition
      ? K
      : never;
  }[keyof T];