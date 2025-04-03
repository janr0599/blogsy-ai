"use client";
// InitializedMDXEditor.tsx
import type { ForwardedRef } from "react";
import "@mdxeditor/editor/style.css";
import {
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    markdownShortcutPlugin,
    MDXEditor,
    UndoRedo,
    BoldItalicUnderlineToggles,
    toolbarPlugin,
    Separator,
    ListsToggle,
    BlockTypeSelect,
    CreateLink,
    linkDialogPlugin,
    linkPlugin,
    InsertImage,
    imagePlugin,
    InsertTable,
    tablePlugin,
    CodeToggle,
    InsertThematicBreak,
    type MDXEditorMethods,
    type MDXEditorProps,
} from "@mdxeditor/editor";
import api from "@/app/config/axios";
import { isAxiosError } from "axios";

async function uploadImage(file: File) {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append("file", file);

    try {
        // Send the file to the API endpoint
        const response = await api.post("/api/image", formData, {
            headers: {
                "Content-Type": "multipart/form-data", // Required for file uploads
            },
        });

        // Handle the response
        console.log("Image uploaded successfully:", response.data.image);
        return response.data.image; // The uploaded image URL
    } catch (error) {
        // Handle errors
        if (isAxiosError(error) && error.response) {
            console.error("Error uploading image:", error.response.data.error);
        } else {
            console.error("Unexpected error:", error);
        }
        throw error;
    }
}

export default function InitializedMDXEditor({
    editorRef,
    ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
    return (
        <MDXEditor
            plugins={[
                // Example Plugin Usage
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                markdownShortcutPlugin(),
                linkDialogPlugin(),
                linkPlugin(),
                imagePlugin({
                    imageUploadHandler: async (file) => {
                        try {
                            const imageUrl = await uploadImage(file);
                            return imageUrl;
                        } catch (error) {
                            console.error("Image upload failed:", error);
                            throw error;
                        }
                    },
                }),
                tablePlugin(),
                thematicBreakPlugin(),
                toolbarPlugin({
                    toolbarContents: () => (
                        <>
                            <UndoRedo />
                            <Separator />
                            <BoldItalicUnderlineToggles />
                            <Separator />
                            <ListsToggle />
                            <Separator />
                            <BlockTypeSelect />
                            <Separator />
                            <CreateLink />
                            <InsertImage />
                            <InsertTable />
                            <InsertThematicBreak />
                            <Separator />
                            <CodeToggle />
                        </>
                    ),
                }),
            ]}
            {...props}
            ref={editorRef}
        />
    );
}
