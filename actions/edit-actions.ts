"use server";

import getDbConnection from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updatePostAction(data: {
    postId: string;
    content: string;
}) {
    const { postId, content } = data;

    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
    }

    try {
        const sql = await getDbConnection();

        const [title, ...contentParts] = content?.split("\n\n") || [];
        const updatedTitle = title.split("#")[1].trim();

        await sql`UPDATE posts SET content = ${content}, title = ${updatedTitle} where id = ${postId}`;
    } catch (error) {
        console.error("Error occurred in updating the post", postId);
        return {
            success: false,
            message:
                "Failed to update post content. Please try again in a few minutes.",
        };
    }

    revalidatePath(`/posts/${postId}`);
    return {
        success: true,
        message: "Post content updated successfully!",
    };
}

export async function updateSEOData({
    postId,
    seoTitle,
    metaDescription,
    tags,
}: {
    postId: string;
    seoTitle: string;
    metaDescription: string;
    tags: string[];
}) {
    const sql = await getDbConnection();
    try {
        // Convert tags array to JSON string
        const tagsJson = JSON.stringify(tags);

        console.log("Updating SEO Data:", {
            postId,
            seoTitle,
            metaDescription,
            tags: tagsJson, // Log the JSON string
        });

        // Database update
        await sql`UPDATE posts SET seo_title = ${seoTitle}, meta_description = ${metaDescription}, tags = ${tagsJson} WHERE id = ${postId}`;

        return { success: true, message: "SEO data updated successfully!" };
    } catch (error) {
        console.error("Error updating SEO data:", error);
        return { success: false, message: "Failed to update SEO data." };
    }
}
// good
