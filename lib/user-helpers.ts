import { NeonQueryFunction } from "@neondatabase/serverless";
import { plans } from "./constants";

export async function hasCancelledPlan(
    sql: NeonQueryFunction<false, false>,
    email: string
) {
    const query =
        await sql`SELECT * FROM users WHERE email = ${email} AND status = 'cancelled'`;

    return query && query.length > 0;
}

export function getPlanType(priceId: string) {
    const checkPlanType = plans.filter((plan) => plan.priceId === priceId);
    return checkPlanType?.[0];
}

export async function updateUser(
    sql: NeonQueryFunction<false, false>,
    userId: string,
    email: string
) {
    return sql`UPDATE users SET user_id = ${userId} WHERE email = ${email}`;
}

export async function userExists(
    sql: NeonQueryFunction<false, false>,
    email: string
) {
    return sql`SELECT * FROM users WHERE email = ${email}`;
}
