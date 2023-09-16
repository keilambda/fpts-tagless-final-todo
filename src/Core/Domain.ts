export type Task = {
	name: string;
	description: string;
	status: "pending" | "doing" | "done" | "abandoned";
};

export const mkTask = (a: Task) => a;

export type Board = {
	name: string;
	tasks: Task[];
};

export const mkBoard = (a: Board) => a;
