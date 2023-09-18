import { pgTable, integer, serial, text, varchar, pgEnum } from "drizzle-orm/pg-core";
import { TaskStatusList } from "src/Core/Domain";

export const boards = pgTable("boards", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
});

export const taskStatus = pgEnum("task_status", TaskStatusList);

export const tasks = pgTable("tasks", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	description: text("description").notNull(),
	status: taskStatus("status").notNull(),
	boardId: integer("board_id").references(() => boards.id),
});
