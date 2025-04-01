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
    InsertImage,
    imagePlugin,
    InsertTable,
    tablePlugin,
    DiffSourceToggleWrapper,
    diffSourcePlugin,
    type MDXEditorMethods,
    type MDXEditorProps,
    CodeToggle,
    InsertCodeBlock,
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
                imagePlugin(),
                tablePlugin(),
                diffSourcePlugin(),
                toolbarPlugin({
                    toolbarContents: () => (
                        <DiffSourceToggleWrapper>
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
                            <Separator />
                            <CodeToggle />
                            <InsertCodeBlock />
                        </DiffSourceToggleWrapper>
                    ),
                }),
            ]}
            {...props}
            ref={editorRef}
        />
    );
}
