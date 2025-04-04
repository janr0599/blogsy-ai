// import ContentEditor from "@/components/content/ContentEditor";
import ContentEditor from "@/components/content/ContentEditor";
import getDbConnection from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type Post = {
    content: string;
    title: string;
    id: string;
    seo_title: string;
    meta_description: string;
    tags: string[];
};

export default async function PostsPage({
    params,
}: {
    params: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { id } = await params;
    const user = await currentUser();

    if (!user) {
        return redirect("/sign-in");
    }

    const sql = await getDbConnection();

    const posts: Post[] =
        (await sql`SELECT * from posts where user_id = ${user.id} and id = ${id}`) as Post[];

    return (
        <div className="mx-auto w-full max-w-6xl px-2.5 lg:px-0 mb-12 mt-8 md:mt-24">
            <ContentEditor posts={posts} />
        </div>
    );
}
