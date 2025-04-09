"use client";

import { boolean, z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { useUploadThing } from "@/utils/uploadthing";
import {
    generateBlogPostAction,
    transcribeUploadedFile,
} from "@/actions/upload-actions";
import { useFormStatus } from "react-dom";
import { Loader2, UploadCloud } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../ui/tooltip";

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

const UploadFileButton = () => {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="bg-purple-600" disabled={pending}>
            {pending ? (
                <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                    Uploading...
                </span>
            ) : (
                <span className="flex items-center justify-center">
                    <UploadCloud className="w-5 h-5 mr-2" />
                    Convert
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

        if (videoUrl.trim()) {
            // Validate URL format
            const urlPattern =
                /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
            if (!urlPattern.test(videoUrl)) {
                toast.error("Invalid YouTube URL format.");
                return;
            }

            // Check URL posts limit
            if (!isUnderLimit) {
                toast.error(
                    "You have reached the monthly limit for URL posts."
                );
                //reset form
                setVideoUrl("");
                return;
            }
            // Handle video URL
            toast.info("🎙️ Transcription is in progress...", {
                description:
                    "Hang tight! Our digital wizards are sprinkling magic dust on your video URL! ✨",
            });

            try {
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

                handleTranscriptionResult(result);
            } catch (error) {
                console.error("Error processing video URL:", error);
                toast.error("Failed to process video URL. Please try again.");
            }

            return;
        }

        if (file && file.size > 0) {
            const validatedFields = schema.safeParse({ file });

            if (!validatedFields.success) {
                console.log(
                    "validatedFields",
                    validatedFields.error.flatten().fieldErrors
                );
                toast.error("Something went wrong", {
                    description:
                        validatedFields.error.flatten().fieldErrors.file?.[0] ??
                        "Invalid file",
                });
                return;
            }

            // Handle file upload
            const resp: any = await startUpload([file]);
            console.log({ resp });

            if (!resp) {
                toast.error("Something went wrong", {
                    description: "Please use a different file",
                });
                return;
            }

            toast.info("🎙️ Transcription is in progress...", {
                description:
                    "Hang tight! Our digital wizards are sprinkling magic dust on your file! ✨",
            });

            const result = await transcribeUploadedFile(resp);
            handleTranscriptionResult(result);
        }
    };

    const handleTranscriptionResult = (result: any) => {
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

            generateBlogPostAction({
                transcript: data.transcript
                    ? { text: data.transcript }
                    : { text: "" },
                userId: data.userId,
                source: videoUrl.trim() ? "url" : "file",
            })
                .then(() => {
                    toast.success("🎉 Woohoo! Your AI blog is created! 🎊", {
                        description:
                            "Time to put on your editor hat, Click the post and edit it!",
                    });
                })
                .catch((error: any) => {
                    if (error.message.includes("timeout")) {
                        toast.info("Taking longer than usual...");
                    }
                });
        }
    };

    return (
        <form
            className="flex flex-col gap-6 w-auto sm:w-md"
            action={handleTranscribe}
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
                    <div className="relative group">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className={"relative"}>
                                        <Input
                                            id="videoUrl"
                                            name="videoUrl"
                                            type="url"
                                            placeholder="https://www.youtube.com/watch?v=8zL8VIYuGON&t=1s&ab_channel=TheAIContentCreator"
                                            value={videoUrl}
                                            onChange={(e) =>
                                                setVideoUrl(e.target.value)
                                            }
                                            disabled={!isProPlan} // Disable if not Pro plan
                                            className={`${
                                                !isProPlan
                                                    ? "bg-gray-200 opacity-50"
                                                    : "border-gray-300"
                                            } placeholder:text-gray-300`}
                                        />
                                    </div>
                                </TooltipTrigger>
                                {!isProPlan && (
                                    <TooltipContent
                                        side="top"
                                        align="center"
                                        className="bg-gray-800 text-white text-sm px-2 py-1 rounded shadow-md"
                                    >
                                        Upgrade to Pro to use this feature.
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
                <UploadFileButton />
            </div>
        </form>
    );
}
