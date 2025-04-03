import cloudinary from "@/app/config/cloudinary";
import formidable, { File } from "formidable";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import fs from "fs/promises";

// Disable body parsing for this route
export const config = {
    api: {
        bodyParser: false,
    },
};

// Helper function to convert NextRequest to Node.js-style IncomingMessage
async function toNodeReadable(req: NextRequest): Promise<Readable> {
    const readable = new Readable();
    readable._read = () => {}; // No-op
    readable.push(await req.arrayBuffer());
    readable.push(null); // End the stream
    return readable;
}

export async function POST(req: NextRequest) {
    const form = formidable({
        multiples: false,
        keepExtensions: true, // Keep file extensions
    });

    const nodeReq = await toNodeReadable(req); // Convert NextRequest to Node.js-style request

    return new Promise((resolve, reject) => {
        form.parse(nodeReq as any, async (err, fields, files) => {
            if (err) {
                console.error("Error parsing form:", err);
                return resolve(
                    NextResponse.json(
                        { error: "Error parsing form data" },
                        { status: 500 }
                    )
                );
            }

            const file = files.file as File | File[] | undefined;

            if (!file || Array.isArray(file)) {
                return resolve(
                    NextResponse.json(
                        {
                            error: "No file uploaded or multiple files uploaded",
                        },
                        { status: 400 }
                    )
                );
            }

            try {
                // Read the file as a buffer
                const fileBuffer = await fs.readFile(file.filepath);

                // Upload the file buffer to Cloudinary
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: "profile_images" }, // Optional: Specify a folder in Cloudinary
                        (error, result) => {
                            if (error) {
                                return reject(error);
                            }
                            resolve(result);
                        }
                    );

                    // Pipe the file buffer to the Cloudinary upload stream
                    Readable.from(fileBuffer).pipe(uploadStream);
                });

                return resolve(
                    NextResponse.json(
                        {
                            message: "Image uploaded successfully",
                            image: (result as any).secure_url,
                        },
                        { status: 200 }
                    )
                );
            } catch (uploadError) {
                console.error("Error uploading to Cloudinary:", uploadError);
                return resolve(
                    NextResponse.json(
                        { error: "Error uploading image" },
                        { status: 500 }
                    )
                );
            }
        });
    });
}
//good
