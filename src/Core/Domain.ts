import { Data } from "effect";

export type TaskStatus = "Pending" | "Doing" | "Done" | "Abandoned";

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
