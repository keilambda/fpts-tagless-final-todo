import { Newtype } from "newtype-ts"

export type Key<A> = Newtype<{ readonly Key: unique symbol }, number>;
export type Entity<A> = {
    key: Key<A>,
    entity: A,
}
