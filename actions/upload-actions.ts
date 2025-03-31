"use server";
import getDbConnection from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AssemblyAI } from "assemblyai";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const client = new AssemblyAI({
    apiKey: "3cef39ab9ad646b68553b9e9984e7b17",
});

export async function transcribeUploadedFile(
    resp: {
        serverData: { userId: string; fileUrl: any };
    }[]
) {
    if (!resp) {
        return {
            success: false,
            message: "File upload failed",
            data: null,
        };
    }

    const {
        serverData: { userId, fileUrl },
    } = resp[0];

    if (!fileUrl) {
        return {
            success: false,
            message: "File upload failed",
            data: null,
        };
    }

    const response = await fetch(fileUrl);

    // try {
    //     const transcriptions = await openai.audio.transcriptions.create({
    //         model: "whisper-1",
    //         file: response,
    //     });

    //     console.log({ transcriptions });
    //     return {
    //         success: true,
    //         message: "File uploaded successfully!",
    //         data: { transcriptions, userId },
    //     };

    try {
        const audioUrl = response.url;

        const config = {
            audio_url: audioUrl,
        };

        const run = async () => {
            const transcript = await client.transcripts.transcribe(config);
            console.log(transcript.text);
            return {
                success: true,
                message: "File uploaded successfully!",
                data: { transcript: transcript.text, userId },
            };
        };

        return await run();
    } catch (error) {
        console.error("Error processing file", error);

        if (error instanceof OpenAI.APIError && error.status === 413) {
            return {
                success: false,
                message: "File size exceeds the max limit of 20MB",
                data: null,
            };
        }

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Error processing file",
            data: null,
        };
    }
}

async function saveBlogPost(userId: string, title: string, content: string) {
    try {
        const sql = await getDbConnection();
        const [insertedPost] = await sql`
    INSERT INTO posts (user_id, title, content)
    VALUES (${userId}, ${title}, ${content})
    RETURNING id
    `;
        return insertedPost.id;
    } catch (error) {
        console.error("Error saving blog post", error);
        throw error;
    }
}

async function getUserBlogPosts(userId: string) {
    try {
        const sql = await getDbConnection();
        const posts = await sql`
    SELECT content FROM posts 
    WHERE user_id = ${userId} 
    ORDER BY created_at DESC 
    LIMIT 3
  `;
        return posts.map((post) => post.content).join("\n\n");
    } catch (error) {
        console.error("Error getting user blog posts", error);
        throw error;
    }
}

async function generateBlogPost({
    transcript,
    userPosts,
}: {
    transcript: string;
    userPosts: string;
}) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: `You are a skilled content writer that converts audio transcriptions into well-structured, engaging blog posts in Markdown format. Create a comprehensive blog post with a catchy title, introduction, main body with multiple sections, and a conclusion. Analyze the user's writing style from their previous posts and emulate their tone and style in the new post. Keep the tone casual and professional.
                    Here are some of my previous blog posts for reference:
                    ${userPosts}
                    Please convert the following transcription into a well-structured blog post using Markdown formatting. Follow this structure:
                    1. Start with a SEO friendly catchy title on the first line.
                    2. Add two newlines after the title.
                    3. Write an engaging introduction paragraph.
                    4. Create multiple sections for the main content, using appropriate headings (##, ###).
                    5. Include relevant subheadings within sections if needed.
                    6. Use bullet points or numbered lists where appropriate.
                    7. Add a conclusion paragraph at the end.
                    8. Ensure the content is informative, well-organized, and easy to read.
                    9. Emulate my writing style, tone, and any recurring patterns you notice from my previous posts.
                    Here's the transcription to convert: ${transcript}`,
                    },
                ],
            },
        ],
    });
    console.log(response.text);
    return response.text;
}

export async function generateBlogPostAction({
    transcript,
    userId,
}: {
    transcript: { text: string };
    userId: string;
}) {
    const userPosts = [];
    // const userPosts = await getUserBlogPosts(userId);
    // let postId = null;

    if (transcript) {
        const blogPost = await generateBlogPost({
            transcript: transcript.text,
            userPosts,
        });

        console.log(blogPost);

        if (!blogPost) {
            return {
                success: false,
                message: "Blog post generation failed, please try again...",
            };
        }

        const [title, ...contentParts] = blogPost?.split("\n\n") || [];

        // //database connection

        // if (blogPost) {
        //     postId = await saveBlogPost(userId, title, blogPost);
        // }
    }

    // //navigate
    // revalidatePath(`/posts/${postId}`);
    // redirect(`/posts/${postId}`);
}
