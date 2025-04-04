"use server";
import getDbConnection from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AssemblyAI } from "assemblyai";
import { GoogleGenAI } from "@google/genai";

const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLY_AI_API_KEY || "",
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

// async function saveBlogPost(userId: string, title: string, content: string) {
//     try {
//         const sql = await getDbConnection();
//         const result = await sql`
//         INSERT INTO posts (user_id, title, content)
//         VALUES (${userId}, ${title}, ${content})
//         RETURNING id
//       `;
//         console.log("SQL insert result:", result);
//         const [insertedPost] = result;
//         if (!insertedPost) {
//             throw new Error("No post returned from the database insertion");
//         }
//         return insertedPost.id;
//     } catch (error) {
//         console.error("Error saving blog post", error);
//         throw error;
//     }
// }

async function saveBlogPost(
    userId: string,
    title: string,
    seoTitle: string,
    blogContent: string,
    metaDescription: string,
    tags: string[]
) {
    try {
        const sql = await getDbConnection();
        // If you’re using PostgreSQL, you might store the tags as a JSON array:
        const result = await sql`
        INSERT INTO posts (user_id, title, seo_title, content, meta_description, tags)
        VALUES (${userId}, ${title}, ${seoTitle}, ${blogContent}, ${metaDescription}, ${JSON.stringify(
            tags
        )})
        RETURNING id
      `;
        console.log("SQL insert result:", result);
        const [insertedPost] = result;
        if (!insertedPost) {
            throw new Error("No post returned from the database insertion");
        }
        return insertedPost.id;
    } catch (error) {
        console.error("Error saving blog post", error);
        throw error;
    }
}

async function getLatestUserBlogPost(userId: string) {
    try {
        const sql = await getDbConnection();
        const posts = await sql`
    SELECT content FROM posts 
    WHERE user_id = ${userId} 
    ORDER BY created_at DESC 
    LIMIT 1
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
                    Here is the latest blog post for your reference:
                    ${userPosts}
                    Please convert the following transcription into a well-structured blog post using Markdown formatting. Follow this structure:
                    1. Generate a dedicated SEO title that includes the focus keyword and eliminates unnecessary stop words.
                    2. Ensure the focus keyword appears in the first paragraph and in at least one additional subheading.
                    3. Integrate at least one relevant image placeholder text and include placeholders in brackets to related internal or external content. Make sure to make this bolds so user can tell them apart from the rest of the content.
                    4. Adjust sentence structure to improve the Flesch Reading Ease score. Use shorter sentences and more transition words.
                    5. Add two newlines after the title.
                    6. Create multiple sections for the main content, using appropriate headings (##, ###).
                    7. Include relevant subheadings within sections if needed.
                    8  Use bullet points or numbered lists where appropriate.
                    9. Add a conclusion paragraph at the end.
                    10. Ensure the content is informative, well-organized, SEO optimized, and easy to read.
                    121. Include keywords related to the immigration industry and the topic of the transcript.
                    12. Emulate my writing style, tone, and any recurring patterns you notice from my previous posts.
                    Here's the transcription to convert: ${transcript}
                    13. Avoid using backticks or the markdown word at the beginning or end of the generated content`,
                    },
                ],
            },
        ],
        config: {
            maxOutputTokens: 1500,
        },
    });
    // console.log(response.text);
    return response.text;
}

async function generateSEOData(blogPostContent: string): Promise<{
    seoTitle: string;
    metaDescription: string;
    tags: string[];
}> {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: `You are an SEO expert. Analyze the following blog post and generate:
                        1. A concise SEO-friendly title.
                        2. A compelling meta description under 160 characters.
                        3. An array of relevant tags. Always put the hash (#) sign in front of the word. Do not use spaces if your hashtag has more than one word. You cannot use punctuation signs in hashtags. Keep it as simple as possible. Use hashtags the target audience for the topic might be searching for. Use specific terms instead broad ones
                        
                        Blog Content:
                        ${blogPostContent}
                        
                        Return the result in valid JSON format:
                        {
                            "seoTitle": "Your SEO title here",
                            "metaDescription": "Your meta description here",
                            "tags": ["#tag1", "#tag2", "#tag3"]
                        }`,
                    },
                ],
            },
        ],
        config: {
            maxOutputTokens: 500,
        },
    });

    let seoData = {
        seoTitle: "",
        metaDescription: "",
        tags: [],
    };

    try {
        // Clean the response text by removing Markdown code block syntax
        const cleanedResponse = response
            .text!.replace(/```json|```/g, "")
            .trim();

        // Parse the cleaned response as JSON
        seoData = JSON.parse(cleanedResponse);
    } catch (error) {
        console.error("Error parsing SEO data response", error);
        throw new Error("Failed to generate SEO data");
    }

    return seoData;
}

export async function generateBlogPostAction({
    transcript,
    userId,
}: {
    transcript: { text: string };
    userId: string;
}) {
    // const userPosts = [];
    const userPosts = await getLatestUserBlogPost(userId);
    let postId = null;

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

        let [title, ...contentParts] = blogPost.split("\n\n");
        if (!title || title.trim() === "") {
            title = "Untitled Blog Post";
        }

        console.log(title);
        console.log(contentParts);

        const seoData = await generateSEOData(blogPost);
        console.log("SEO Data:", seoData);
        const { seoTitle, metaDescription, tags } = seoData;

        if (blogPost) {
            // Save blog post along with SEO data.
            postId = await saveBlogPost(
                userId,
                seoTitle,
                title,
                blogPost,
                metaDescription,
                tags
            );
        }
    }

    // //navigate
    if (postId) {
        revalidatePath(`/posts/${postId}`);
        redirect(`/posts/${postId}`);
    } else {
        console.error(
            "Post ID is invalid. The blog post might not have been saved correctly."
        );
        // Optionally, return a response or display an error message
    }
}
