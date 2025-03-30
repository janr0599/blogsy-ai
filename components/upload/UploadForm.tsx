"use client";

import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { useUploadThing } from "@/utils/uploadthing";
// import {
//     generateBlogPostAction,
//     transcribeUploadedFile,
// } from "@/actions/upload-actions";

const schema = z.object({
    file: z
        .instanceof(File, { message: "Invalid file" })
        .refine(
            (file: File) => file.size <= 20 * 1024 * 1024,
            "File size must not exceed 20MB"
        )
        .refine(
            (file: File) =>
                file.type.startsWith("audio/") ||
                file.type.startsWith("video/"),
            "File must be an audio or a video file"
        ),
});

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

            //     const result = await transcribeUploadedFile(resp);
            //     const { data = null, message = null } = result || {};

            //     if (!result || (!data && !message)) {
            //         toast.error("An unexpected error occurred", {
            //             description:
            //                 "An error occurred during transcription. Please try again.",
            //         });
            //     }

            //     if (data) {
            //         toast.info("🤖 Generating AI blog post...", {
            //             description:
            //                 "Please wait while we generate your blog post.",
            //         });

            //         await generateBlogPostAction({
            //             transcriptions: data.transcriptions,
            //             userId: data.userId,
            //         });

            //         toast.success("🎉 Woohoo! Your AI blog is created! 🎊", {
            //             description:
            //                 "Time to put on your editor hat, Click the post and edit it!",
            //         });
            //     }
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
                />
                <Button className="bg-purple-600">Upload File</Button>
            </div>
        </form>
    );
}
