"use client";

import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { useUploadThing } from "@/utils/uploadthing";
import {
    generateBlogPostAction,
    transcribeUploadedFile,
} from "@/actions/upload-actions";
import { Loader2, WandSparkles } from "lucide-react";
import { useState } from "react";
import axios from "axios";

const schema = z.object({
    file: z
        .instanceof(File, { message: "Invalid file" })
        .refine(
            (file: File) => file.size <= 500 * 1024 * 1024,
            "File size must not exceed 5GB"
        )
        .refine(
            (file: File) =>
                file.type.startsWith("audio/") ||
                file.type.startsWith("video/"),
            "File must be an audio or a video file"
        ),
});

const UploadFileButton = ({ pending }: { pending: boolean }) => {
    return (
        <Button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700"
            disabled={pending}
        >
            {pending ? (
                <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                    Generating...
                </span>
            ) : (
                <span className="flex items-center justify-center">
                    <WandSparkles className="w-5 h-5 mr-2" />
                    Generate
                </span>
            )}
        </Button>
    );
};

export default function UploadForm({
    userId,
    isProPlan,
    isUnderLimit,
}: {
    userId: string;
    isProPlan: boolean;
    isUnderLimit: boolean;
}) {
    const { startUpload } = useUploadThing("videoOrAudioUploader", {
        onClientUploadComplete: () => {
            console.log("uploaded successfully!");
        },
        onUploadError: (err: Error) => {
            console.error("Error occurred", err);
        },
        onUploadBegin: () => {
            toast.info("Upload has begun! 🚀");
        },
    });

    const [videoUrl, setVideoUrl] = useState("");
    const [pending, setPending] = useState(false);

    const handleTranscribe = async (formData: FormData) => {
        const file = formData.get("file") as File;

        // Validation: Ensure only one input is provided
        if ((!file || file.size === 0) && !videoUrl.trim()) {
            toast.error("Please provide either a file or a video URL");
            return;
        }

        if (file && file.size > 0 && videoUrl.trim()) {
            toast.error(
                "Please provide either a file or a video URL, but not both."
            );
            setVideoUrl("");
            return;
        }

        setPending(true); // Set pending state to true

        try {
            if (videoUrl.trim()) {
                // Validate URL format
                const urlPattern =
                    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
                if (!urlPattern.test(videoUrl)) {
                    toast.error("Invalid YouTube URL format.");
                    setPending(false); // Reset pending state
                    return;
                }

                // Check URL posts limit
                if (!isUnderLimit) {
                    toast.error(
                        "You have reached the monthly limit for URL posts."
                    );
                    setVideoUrl("");
                    setPending(false); // Reset pending state
                    return;
                }

                // Handle video URL
                toast.info("🎙️ Transcription is in progress...", {
                    description:
                        "Hang tight! Our digital wizards are sprinkling magic dust on your video URL! ✨",
                });

                const response = await axios.get(
                    `/api/downloader?videoUrl=${encodeURIComponent(videoUrl)}`
                );

                const downloadedUrl = response.data.videoUrl;

                const result = await transcribeUploadedFile([
                    {
                        serverData: {
                            userId: userId,
                            fileUrl: downloadedUrl,
                        },
                    },
                ]);

                await handleTranscriptionResult(result);
            } else if (file && file.size > 0) {
                const validatedFields = schema.safeParse({ file });

                if (!validatedFields.success) {
                    console.log(
                        "validatedFields",
                        validatedFields.error.flatten().fieldErrors
                    );
                    toast.error("Something went wrong", {
                        description:
                            validatedFields.error.flatten().fieldErrors
                                .file?.[0] ?? "Invalid file",
                    });
                    setPending(false); // Reset pending state
                    return;
                }

                // Handle file upload
                const resp: any = await startUpload([file]);
                console.log({ resp });

                if (!resp) {
                    toast.error("Something went wrong", {
                        description: "Please use a different file",
                    });
                    setPending(false); // Reset pending state
                    return;
                }

                toast.info("🎙️ Transcription is in progress...", {
                    description:
                        "Hang tight! Our digital wizards are sprinkling magic dust on your file! ✨",
                });

                const result = await transcribeUploadedFile(resp);
                await handleTranscriptionResult(result);
            }
        } catch (error) {
            console.error("Error during submission:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setTimeout(() => {
                setPending(false); // Reset pending state after 2 seconds
            }, 2000); // 2-second delay
        }
    };

    const handleTranscriptionResult = async (result: any) => {
        const { data = null, message = null } = result || {};

        if (!result || (!data && !message)) {
            toast.error("An unexpected error occurred", {
                description:
                    "An error occurred during transcription. Please try again.",
            });
            return;
        }

        if (data) {
            toast.info("🤖 Generating AI blog post...", {
                description: "Please wait while we generate your blog post.",
            });

            const response = await generateBlogPostAction({
                transcript: data.transcript
                    ? { text: data.transcript }
                    : { text: "" },
                userId: data.userId,
                source: videoUrl.trim() ? "url" : "file",
            });

            if (response.success) {
                toast.success("🎉 Woohoo! Your AI blog is created! 🎊", {
                    description:
                        "Time to put on your editor hat, Click the post and edit it!",
                });
                setTimeout(() => {
                    window.location.href = `/posts/${response.postId}`;
                }, 2000); // 2-second delay
            } else {
                toast.error("Failed to generate the blog post.", {
                    description: response.message,
                });
            }
        }
    };

    return (
        <form
            className="flex flex-col gap-6 w-auto sm:w-md"
            onSubmit={(e) => {
                e.preventDefault(); // Prevent the default form submission behavior
                const formData = new FormData(e.target as HTMLFormElement);
                handleTranscribe(formData); // Call the handleTranscribe function
            }}
        >
            <div className="flex flex-col gap-4 w-full">
                <div className="w-full">
                    <Input
                        id="file"
                        name="file"
                        type="file"
                        accept="audio/*,video/*"
                    ></Input>
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="videoUrl" className="text-sm font-medium">
                        Or enter a video URL:
                    </label>
                    <Input
                        id="videoUrl"
                        name="videoUrl"
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=8zL8VIYuGON&t=1s&ab_channel=TheAIContentCreator"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        disabled={!isProPlan} // Disable if not Pro plan
                        className="border-gray-300 placeholder:text-gray-300"
                    />
                </div>
                <UploadFileButton pending={pending} />
            </div>
        </form>
    );
}
