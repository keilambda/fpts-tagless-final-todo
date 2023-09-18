import { Newtype, iso } from "newtype-ts";

export type Id = Newtype<{ readonly Id: unique symbol }, number>;
export const isoId = iso<Id>();

export type Entity<A> = {
	id: Id;
	entity: A;
};
