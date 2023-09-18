import { Cause } from "effect";
import { Either } from "fp-ts/Either";
import { Option } from "fp-ts/Option";
import { Kind, URIS } from "fp-ts/HKT";

import { Board, Task } from "src/Core/Domain";
import { Entity, Id } from "src/Lib/Persistent";

export type TaskEntity = Entity<Task>;
export type TaskRepo<F extends URIS> = {
	getAll(): Kind<F, TaskEntity[]>;
	get(id: Id): Kind<F, Option<TaskEntity>>;
	add(data: Task): Kind<F, Option<TaskEntity>>;
	update(entity: TaskEntity): Kind<F, Either<Cause.NoSuchElementException, TaskEntity>>;
	delete(id: Id): Kind<F, Either<Cause.NoSuchElementException, void>>;
};

export type BoardEntity = Entity<Board>;
export type BoardRepo<F extends URIS> = {
	getAll(): Kind<F, BoardEntity[]>;
	get(id: Id): Kind<F, Option<BoardEntity>>;
	add(data: Board): Kind<F, BoardEntity>;
	update(entity: BoardEntity): Kind<F, Either<Cause.NoSuchElementException, BoardEntity>>;
	delete(id: Id): Kind<F, Either<Cause.NoSuchElementException, void>>;
};
