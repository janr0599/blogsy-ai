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

// Only import this to the next file
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
                imagePlugin(),
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
