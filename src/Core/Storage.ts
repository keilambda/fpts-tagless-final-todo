import { Cause } from "effect";
import { Either } from "fp-ts/Either";
import { Option } from "fp-ts/Option";
import { Kind, URIS } from "fp-ts/HKT";

import { Board, Task } from "./Domain";
import { Entity, Key } from "../Lib/Persistent";

type TaskKey = Key<Task>;
type TaskEntity = Entity<Task>;

export interface TaskRepo<F extends URIS> {
	getAll(): Kind<F, TaskEntity[]>;
	get(key: TaskKey): Kind<F, Option<TaskEntity>>;
	add(data: Task): Kind<F, TaskEntity>;
	update(entity: TaskEntity): Kind<F, Either<Cause.NoSuchElementException, TaskEntity>>;
	delete(key: TaskKey): Kind<F, Either<Cause.NoSuchElementException, void>>;
}

type BoardKey = Key<Board>;
type BoardEntity = Entity<Board>;

export interface BoardRepo<F extends URIS> {
	getAll(): Kind<F, BoardEntity[]>;
	get(key: BoardKey): Kind<F, Option<BoardEntity>>;
	add(data: Board): Kind<F, BoardEntity>;
	update(entity: BoardEntity): Kind<F, Either<Cause.NoSuchElementException, BoardEntity>>;
	delete(key: BoardKey): Kind<F, Either<Cause.NoSuchElementException, void>>;
}
