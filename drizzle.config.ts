import type { Config } from "drizzle-kit";

export default {
	schema: "./src/App/Database.ts",
	driver: "pg",
	dbCredentials: {
		connectionString: process.env["DB_URL"]!
	}
} satisfies Config;
