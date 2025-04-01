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
import { useFormStatus } from "react-dom";
import { Loader2, UploadCloud } from "lucide-react";

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
                    Upload File
                </span>
            )}
        </Button>
    );
};

export default function UploadForm() {
    const { startUpload } = useUploadThing("videoOrAudioUploader", {
        onClientUploadComplete: () => {
            toast("uploaded successfully!");
        },
        onUploadError: (err: Error) => {
            console.error("Error occurred", err);
        },
        onUploadBegin: () => {
            toast.info("Upload has begun 🚀!");
        },
    });

    const handleTranscribe = async (formData: FormData) => {
        const file = formData.get("file") as File;

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

        if (file) {
            const resp: any = await startUpload([file]);
            console.log({ resp });

            if (!resp) {
                toast.error("Something went wrong", {
                    description: "Please use a different file",
                });
            }
            toast.info("🎙️ Transcription is in progress...", {
                description:
                    "Hang tight! Our digital wizards are sprinkling magic dust on your file! ✨",
            });

            const result = await transcribeUploadedFile(resp);
            const { data = null, message = null } = result || {};

            if (!result || (!data && !message)) {
                toast.error("An unexpected error occurred", {
                    description:
                        "An error occurred during transcription. Please try again.",
                });
            }

            if (data) {
                toast.info("🤖 Generating AI blog post...", {
                    description:
                        "Please wait while we generate your blog post.",
                });

                try {
                    await generateBlogPostAction({
                        transcript: data.transcript
                            ? { text: data.transcript }
                            : { text: "" },
                        userId: data.userId,
                    });
                } catch (error: any) {
                    if (error.message.includes("timeout")) {
                        toast.info("Taking longer than usual...");
                    }
                }

                toast.success("🎉 Woohoo! Your AI blog is created! 🎊", {
                    description:
                        "Time to put on your editor hat, Click the post and edit it!",
                });
            }
        }
    };
    return (
        <form className="flex flex-col gap-6" action={handleTranscribe}>
            <div className="flex justify-end items-center gap-1.5">
                <Input
                    id="file"
                    name="file"
                    type="file"
                    accept="audio/*,video/*"
                    required
                ></Input>
                <UploadFileButton />
            </div>
        </form>
    );
}
