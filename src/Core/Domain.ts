import { Data } from "effect";

export const TaskStatusList = ["Pending", "Doing", "Done", "Abandoned"] as const;
export type TaskStatus = (typeof TaskStatusList)[number];

export type Task = Data.Case &
	Readonly<{
		name: string;
		description: string;
		status: TaskStatus;
	}>;

export const MkTask = Data.case<Task>();

export type Board = Data.Case &
	Readonly<{
		name: string;
		tasks: Task[];
	}>;

export const MkBoard = Data.case<Board>();
