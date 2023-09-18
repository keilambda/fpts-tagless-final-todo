import { pgTable, integer, serial, text, varchar, pgEnum } from "drizzle-orm/pg-core";
import { MkBoard, MkTask, TaskStatusList } from "src/Core/Domain";
import { BoardEntity, TaskEntity } from "src/Core/Repository";
import { isoId } from "src/Lib/Persistent";

export const boards = pgTable("boards", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
});

export type BoardDrizzle = typeof boards.$inferSelect;
export type NewBoardDrizzle = typeof boards.$inferInsert;

export const fromBoardDrizzle = ({ id, name }: BoardDrizzle): BoardEntity => ({
	id: isoId.wrap(id),
	entity: MkBoard({ name, tasks: [] }),
});

export const taskStatus = pgEnum("task_status", TaskStatusList);

export const tasks = pgTable("tasks", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	description: text("description").notNull(),
	status: taskStatus("status").notNull(),
	boardId: integer("board_id").references(() => boards.id),
});

export type TaskDrizzle = typeof tasks.$inferSelect;
export type NewTaskDrizzle = typeof tasks.$inferInsert;

export const fromTaskDrizzle = ({ id, name, description, status }: TaskDrizzle): TaskEntity => ({
	id: isoId.wrap(id),
	entity: MkTask({ name, description, status }),
});
