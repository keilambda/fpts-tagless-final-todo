import express from "express";
import { Cause } from "effect";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";

import Array from "fp-ts/Array";
import Either from "fp-ts/Either";
import Option from "fp-ts/Option";
import Task from "fp-ts/Task";
import TaskOption from "fp-ts/TaskOption";
import TaskEither from "fp-ts/TaskEither";
import Reader from "fp-ts/Reader";
import { MonadTask1 } from "fp-ts/MonadTask";
import { URIS } from "fp-ts/HKT";
import { flow, pipe } from "fp-ts/function";
import { Do } from "fp-ts-contrib/Do";

import { MkTask } from "src/Core/Domain";
import { MkTaskService, TaskService } from "src/Core/Service";
import { fromTaskDrizzle, tasks } from "src/App/Database";
import { isoId } from "src/Lib/Persistent";

type Environment = Readonly<{
	database: NodePgDatabase;
}>;

type Program<F extends URIS> = Readonly<{
	task: TaskService<F>;
}>;

const MkProgram = <F extends URIS>(F: MonadTask1<F>) =>
	Reader.asks(
		({ database }: Environment): Program<F> => ({
			task: MkTaskService(F)({
				getAll: () =>
					F.map(
						F.fromTask(() => database.select().from(tasks)),
						Array.map(fromTaskDrizzle),
					),
				get: (id) =>
					F.map(
						F.fromTask(() =>
							database
								.select()
								.from(tasks)
								.where(eq(tasks.id, isoId.unwrap(id))),
						),
						flow(Array.head, Option.map(fromTaskDrizzle)),
					),
				add: ({ name, description, status }) =>
					F.map(
						F.fromTask(() => database.insert(tasks).values({ name, description, status }).returning()),
						flow(Array.head, Option.map(fromTaskDrizzle)),
					),
				update: ({ id, entity: { name, description, status } }) =>
					F.map(
						F.fromTask(() =>
							database
								.update(tasks)
								.set({ id: isoId.unwrap(id), name, description, status })
								.returning(),
						),
						flow(
							Array.head,
							Option.fold(
								() => Either.left(Cause.NoSuchElementException("No such Task")),
								flow(fromTaskDrizzle, Either.right),
							),
						),
					),
				delete: (id) =>
					F.map(
						F.fromTask(() =>
							database
								.delete(tasks)
								.where(eq(tasks.id, isoId.unwrap(id)))
								.returning(),
						),
						flow(
							Array.head,
							Option.fold(
								() => Either.left(Cause.NoSuchElementException("No such Task")),
								() => Either.right(void 0),
							),
						),
					),
			}),
		}),
	);

const main = Do(Task.Monad)
	.let("env", {
		database: drizzle(new Pool({ connectionString: "postgres://postgres:12345678@localhost/fptstf" })),
	} satisfies Environment)
	.let("app", express())
	.letL("program", ({ env }) => MkProgram(Task.MonadTask)(env))
	.doL(({ app, program }) =>
		Task.fromIO(() => {
			app.use(express.json());

			app.get("/tasks", (_, res) =>
				pipe(
					program.task.getAll(),
					Task.flatMapIO((ts) => () => {
						res.json(ts);
					}),
				)(),
			);

			app.get("/tasks/:id", (req, res) =>
				pipe(
					program.task.get(isoId.wrap(Number(req.params.id))),
					TaskOption.fold(
						() =>
							Task.fromIO(() => {
								res.status(404).end();
							}),
						(t) =>
							Task.fromIO(() => {
								res.json(t).end();
							}),
					),
				)(),
			);

			app.post("/tasks", (req, res) =>
				pipe(
					program.task.add(
						MkTask({
							name: req.body.name,
							description: req.body.description,
							status: req.body.status,
						}),
					),
					TaskOption.fold(
						() =>
							Task.fromIO(() => {
								res.status(500).end();
							}),
						(te) =>
							Task.fromIO(() => {
								res.json(te);
							}),
					),
				)(),
			);

			app.put("/tasks/:id", (req, res) =>
				pipe(
					program.task.update({
						id: isoId.wrap(Number(req.params.id)),
						entity: MkTask({
							name: req.body.name,
							description: req.body.description,
							status: req.body.status,
						}),
					}),
					TaskEither.fold(
						(v) =>
							Task.fromIO(() => {
								res.status(400).send(v.message).end();
							}),
						(v) =>
							Task.fromIO(() => {
								res.json(v).end();
							}),
					),
				)(),
			);

			app.delete("/tasks/:id", (req, res) =>
				pipe(
					program.task.delete(isoId.wrap(Number(req.params.id))),
					TaskEither.fold(
						(v) =>
							Task.fromIO(() => {
								res.status(400).send(v.message).end();
							}),
						(_) =>
							Task.fromIO(() => {
								res.status(204).end();
							}),
					),
				)(),
			);
		}),
	)
	.return(({ app }) => {
		app.listen(8080, () => console.log("Running"));
	});

await main();
