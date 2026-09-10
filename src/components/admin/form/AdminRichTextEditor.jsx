"use client";

import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useId, useRef } from "react";

import { AdminRichTextToolbar } from "@/components/admin/form/AdminRichTextToolbar";
import { ABOUT_EMPTY_RICH_TEXT } from "@/constants/about";

function normalizeDocument(value) {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    value.type === "doc"
  ) {
    return value;
  }

  return structuredClone(ABOUT_EMPTY_RICH_TEXT);
}

function documentsAreEqual(firstDocument, secondDocument) {
  return JSON.stringify(firstDocument) === JSON.stringify(secondDocument);
}

export function AdminRichTextEditor({
  id,
  value,
  onChange,
  onBlur,
  label,
  hint,
  error,
  disabled = false,
  required = false,
  minHeight = 220,
}) {
  const generatedId = useId();

  const editorId = id || generatedId;

  const onChangeRef = useRef(onChange);

  const onBlurRef = useRef(onBlur);

  const valueRef = useRef(normalizeDocument(value));

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onBlurRef.current = onBlur;
  }, [onBlur]);

  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },

        link: false,

        underline: false,
      }),

      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: "https",
        protocols: ["http", "https", "mailto", "tel"],

        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: null,
          class: "font-semibold text-[#0979c4] underline underline-offset-2",
        },
      }),

      Underline,

      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
      }),
    ],

    content: normalizeDocument(value),

    editable: !disabled,

    editorProps: {
      attributes: {
        id: editorId,

        role: "textbox",

        "aria-multiline": "true",

        "aria-invalid": error ? "true" : "false",

        class: [
          "min-h-[var(--rich-text-min-height)]",
          "px-4 py-3 text-sm leading-7 text-slate-700 outline-none",
          "dark:text-slate-200",
        ].join(" "),
      },
    },

    onUpdate: ({ editor: currentEditor }) => {
      const nextDocument = currentEditor.getJSON();

      if (documentsAreEqual(nextDocument, valueRef.current)) {
        return;
      }

      valueRef.current = nextDocument;

      onChangeRef.current?.(nextDocument);
    },

    onBlur: () => {
      onBlurRef.current?.();
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    const nextDocument = normalizeDocument(value);

    valueRef.current = nextDocument;

    if (!editor) {
      return;
    }

    const currentDocument = editor.getJSON();

    if (documentsAreEqual(currentDocument, nextDocument)) {
      return;
    }

    editor.commands.setContent(nextDocument, {
      emitUpdate: false,
    });
  }, [editor, value]);

  return (
    <div className="space-y-2">
      {label ? (
        <label
          htmlFor={editorId}
          className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
        >
          {label}

          {required ? (
            <span aria-hidden="true" className="ml-1 text-red-500">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      <div
        style={{
          "--rich-text-min-height": `${Math.max(
            120,
            Number(minHeight) || 220,
          )}px`,
        }}
        className={[
          "overflow-hidden rounded-xl border bg-white transition",
          "dark:bg-slate-950",
          error
            ? [
                "border-red-400 ring-4 ring-red-500/10",
                "dark:border-red-500",
              ].join(" ")
            : [
                "border-slate-200",
                "focus-within:border-[#0979c4]",
                "focus-within:ring-4 focus-within:ring-[#0979c4]/10",
                "dark:border-slate-700",
              ].join(" "),
          disabled ? "cursor-not-allowed opacity-60" : "",
        ].join(" ")}
      >
        <AdminRichTextToolbar editor={editor} disabled={disabled} />

        <EditorContent
          editor={editor}
          className={[
            "[&_.ProseMirror]:min-h-[var(--rich-text-min-height)]",
            "[&_.ProseMirror]:outline-none",
            "[&_.ProseMirror_p]:my-2",
            "[&_.ProseMirror_h2]:my-4",
            "[&_.ProseMirror_h2]:text-2xl",
            "[&_.ProseMirror_h2]:font-extrabold",
            "[&_.ProseMirror_h3]:my-3",
            "[&_.ProseMirror_h3]:text-xl",
            "[&_.ProseMirror_h3]:font-bold",
            "[&_.ProseMirror_h4]:my-3",
            "[&_.ProseMirror_h4]:text-lg",
            "[&_.ProseMirror_h4]:font-bold",
            "[&_.ProseMirror_ul]:my-3",
            "[&_.ProseMirror_ul]:list-disc",
            "[&_.ProseMirror_ul]:pl-6",
            "[&_.ProseMirror_ol]:my-3",
            "[&_.ProseMirror_ol]:list-decimal",
            "[&_.ProseMirror_ol]:pl-6",
            "[&_.ProseMirror_li]:my-1",
            "[&_.ProseMirror_blockquote]:my-4",
            "[&_.ProseMirror_blockquote]:border-l-4",
            "[&_.ProseMirror_blockquote]:border-[#0979c4]",
            "[&_.ProseMirror_blockquote]:pl-4",
            "[&_.ProseMirror_blockquote]:italic",
            "[&_.ProseMirror_hr]:my-5",
            "[&_.ProseMirror_hr]:border-slate-200",
            "dark:[&_.ProseMirror_hr]:border-slate-700",
            "[&_.ProseMirror_code]:rounded",
            "[&_.ProseMirror_code]:bg-slate-100",
            "[&_.ProseMirror_code]:px-1",
            "[&_.ProseMirror_code]:py-0.5",
            "[&_.ProseMirror_code]:font-mono",
            "[&_.ProseMirror_code]:text-xs",
            "dark:[&_.ProseMirror_code]:bg-slate-800",
            "[&_.ProseMirror_pre]:my-4",
            "[&_.ProseMirror_pre]:overflow-x-auto",
            "[&_.ProseMirror_pre]:rounded-xl",
            "[&_.ProseMirror_pre]:bg-slate-950",
            "[&_.ProseMirror_pre]:p-4",
            "[&_.ProseMirror_pre]:text-slate-100",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-slate-400",
          ].join(" ")}
        />
      </div>

      {hint && !error ? (
        <p className="text-xs leading-5 text-slate-400">{hint}</p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="text-xs font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
