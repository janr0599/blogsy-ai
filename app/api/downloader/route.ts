import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import axios from "axios";

const utapi = new UTApi();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get("videoUrl");

    if (!videoUrl) {
        return NextResponse.json(
            { error: "No video URL provided" },
            { status: 400 }
        );
    }

    try {
        // Call the ytdl service on Google Cloud Run
        const ytdlServiceUrl =
            "https://youtube-dl-service-567804760969.us-central1.run.app";
        const response = await axios.get(`${ytdlServiceUrl}/`, {
            params: { url: videoUrl },
            responseType: "arraybuffer", // Download the file as a buffer
        });

        console.log("Response headers:", response.headers);
        console.log("Response size:", response.data.length);

        // Upload the downloaded file to UploadThing
        const fileBuffer = Buffer.from(response.data);
        const fileName = `audio_${Date.now()}.webm`;

        console.log("File buffer size:", fileBuffer.length);
        console.log("File name:", fileName);

        const uploadResponse = await utapi.uploadFiles([
            new File([fileBuffer], fileName, { type: "audio/webm" }),
        ]);

        if (Array.isArray(uploadResponse) && uploadResponse.length > 0) {
            const fileUrl = uploadResponse[0].data?.ufsUrl;

            // Verify the file URL is accessible
            try {
                const headResponse = await axios.head(fileUrl!);
                if (headResponse.status !== 200) {
                    throw new Error("File URL is not accessible.");
                }
            } catch (error) {
                console.error("Error verifying file URL:", error);
                throw new Error("File URL is not accessible.");
            }

            return NextResponse.json({
                videoUrl: fileUrl,
            });
        } else {
            throw new Error("File upload failed.");
        }
    } catch (error) {
        console.error("Error processing video URL:", error);
        return NextResponse.json(
            { error: "Failed to process video URL." },
            { status: 500 }
        );
    }
}
