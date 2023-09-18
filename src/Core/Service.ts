import { Lens } from "monocle-ts";
import * as A from "fp-ts/Array";
import { Functor1 } from "fp-ts/Functor";
import { Kind, URIS } from "fp-ts/HKT";
import * as R from "fp-ts/Reader";
import { flow, pipe, increment } from "fp-ts/function";

import { TaskStatus } from "./Domain";
import { BoardRepo, TaskEntity, TaskRepo } from "./Storage";

type TaskStatusRecord<A> = { [S in TaskStatus]: A };
const taskStatusNumL = Lens.fromProp<TaskStatusRecord<number>>();
const taskStatusTEL = Lens.fromProp<TaskStatusRecord<TaskEntity[]>>();

export type TaskService<F extends URIS> = TaskRepo<F> & {
	countStatus(status: TaskStatus): Kind<F, number>;
	countByStatus(): Kind<F, TaskStatusRecord<number>>;
	groupByStatus(): Kind<F, TaskStatusRecord<TaskEntity[]>>;
};

export const MkTaskService = <F extends URIS>(F: Functor1<F>) =>
	R.asks(
		(repo: TaskRepo<F>): TaskService<F> => ({
			...repo,
			countStatus: (status) =>
				F.map(repo.getAll(), (ts) => ts.filter((te) => te.entity.status === status).length),
			countByStatus: () =>
				F.map(
					repo.getAll(),
					flow(
						A.reduce(
							{
								Pending: 0,
								Doing: 0,
								Done: 0,
								Abandoned: 0,
							},
							(acc, c) =>
								pipe(acc, taskStatusNumL(c.entity.status).modify(increment)),
						),
					),
				),
			groupByStatus: () =>
				F.map(
					repo.getAll(),
					flow(
						A.reduce(
							{
								Pending: new Array(),
								Doing: new Array(),
								Done: new Array(),
								Abandoned: new Array(),
							},
							(acc, c) =>
								pipe(acc, taskStatusTEL(c.entity.status).modify(A.append(c))),
						),
					),
				),
		}),
	);

export type BoardService<F extends URIS> = BoardRepo<F>;
