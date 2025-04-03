import { neon } from "@neondatabase/serverless";

export default async function getDbConnection() {
    // Select the correct connection string based on the NODE_ENV and available variables.
    const connectionString =
        process.env.NODE_ENV === "development" && process.env.DEV_DATABASE_URL
            ? process.env.DEV_DATABASE_URL
            : process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error("Neon Database URL is not defined");
    }

    const sql = neon(connectionString);
    return sql;
}
