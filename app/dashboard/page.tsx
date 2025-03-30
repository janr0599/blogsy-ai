import getDbConnection from "@/lib/db";

export default async function Dashboard() {
    const db = getDbConnection();
    return <section>Dashboard</section>;
}
