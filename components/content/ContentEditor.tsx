"use client";

import {
    useActionState,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import BgGradient from "@/components/ui/BgGradient";
import { ForwardRefEditor } from "./forward-ref-editor";
import { useFormStatus } from "react-dom";
import { updatePostAction } from "@/actions/edit-actions";
import { Button } from "../ui/button";
import { Download, Edit2, Loader2 } from "lucide-react";
import { Post } from "@/app/(logged-in)/posts/[id]/page";

function SubmitButton({ isChanged }: { isChanged: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            className={`w-40 bg-gradient-to-r from-purple-900 to-indigo-600 hover:from-purple-600 hover:to-indigo-900 text-white font-semibold py-2 px-4 rounded-full shadow-lg transform transition duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2`}
            disabled={pending || !isChanged}
        >
            {pending ? (
                <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                    Updating...
                </span>
            ) : (
                <span className="flex items-center justify-center">
                    <Edit2 className="w-5 h-5 mr-2" />
                    Update Text
                </span>
            )}
        </Button>
    );
}

const initialState = {
    success: false,
};

type UploadState = {
    success: boolean;
};

type UploadAction = (
    state: UploadState,
    formData: FormData
) => Promise<UploadState>;

export default function ContentEditor({ posts }: { posts: Post[] }) {
    const [initialContent, setInitialContent] = useState<string | null>(null);
    const [content, setContent] = useState<string | null>(null);
    const [isChanged, setIsChanged] = useState(false);

    // Ref to track if the component is mounted
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;

        // Initialize content and initialContent
        if (posts.length > 0) {
            setInitialContent(posts[0].content);
            setContent(posts[0].content);
            setIsChanged(false); // Ensure isChanged is false initially
        }

        return () => {
            isMounted.current = false; // Cleanup function to mark the component as unmounted
        };
    }, [posts]);

    // Update isChanged whenever content or initialContent changes
    useEffect(() => {
        if (content !== null && initialContent !== null) {
            setIsChanged(content !== initialContent);
        }
    }, [content, initialContent]);

    const updatedPostActionWithId = updatePostAction.bind(null, {
        postId: posts[0]?.id,
        content: content || "",
    });

    const [state, formAction] = useActionState<UploadState, FormData>(
        updatedPostActionWithId as unknown as UploadAction,
        initialState
    );

    const handleContentChange = (value: string) => {
        if (isMounted.current) {
            setContent(value);
        }
    };

    const handleExport = useCallback(() => {
        const filename = `${posts[0]?.title || "blog-post"}.md`;

        const blob = new Blob([content || ""], {
            type: "text/markdown;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [content, posts]);

    // Render a loading state until the content is initialized
    if (!posts || posts.length === 0) {
        return <p>No content available for this post.</p>;
    }

    if (content === null) {
        return (
            <div className="flex justify-center items-center h-full">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <form action={formAction} className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row justify-between items-center border-b-2 border-gray-300/50 pb-4">
                <div className="mb-4 sm:mb-0">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                        📝 Edit your post
                    </h2>
                    <p className="text-gray-600">
                        Start editing your blog post below...
                    </p>
                </div>
                <div className="flex gap-4">
                    <SubmitButton isChanged={isChanged} />
                    <Button
                        onClick={handleExport}
                        className="w-40 bg-gradient-to-r from-amber-500 to-amber-900 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-2 px-4 rounded-full shadow-lg transform transition duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Export
                    </Button>
                </div>
            </div>
            <BgGradient>
                <ForwardRefEditor
                    markdown={content || ""}
                    className="markdown-content border-dotted border-gray-300 border-2 p-4 rounded-md animate-in ease-in-out duration-75"
                    onChange={handleContentChange}
                ></ForwardRefEditor>
            </BgGradient>
        </form>
    );
}
//good
