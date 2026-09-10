"use client";

import { useEditorState } from "@tiptap/react";
import {
  FiAlignCenter,
  FiAlignLeft,
  FiAlignRight,
  FiBold,
  FiCode,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiItalic,
  FiLink,
  FiList,
  FiMinus,
  FiUnderline,
} from "react-icons/fi";

function ToolbarButton({
  active = false,
  disabled = false,
  label,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={[
        "inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
        "text-sm transition",
        "disabled:cursor-not-allowed disabled:opacity-35",
        active
          ? "bg-[#0979c4] text-white"
          : [
              "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              "dark:text-slate-300 dark:hover:bg-slate-800",
              "dark:hover:text-white",
            ].join(" "),
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return (
    <span
      aria-hidden="true"
      className="mx-1 h-6 w-px shrink-0 bg-slate-200 dark:bg-slate-700"
    />
  );
}

export function AdminRichTextToolbar({ editor, disabled = false }) {
  const editorState = useEditorState({
    editor,

    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) {
        return {
          heading: "paragraph",
          bold: false,
          italic: false,
          underline: false,
          code: false,
          bulletList: false,
          orderedList: false,
          blockquote: false,
          link: false,
          alignLeft: false,
          alignCenter: false,
          alignRight: false,
          canUndo: false,
          canRedo: false,
        };
      }

      let heading = "paragraph";

      for (const level of [2, 3, 4]) {
        if (currentEditor.isActive("heading", { level })) {
          heading = String(level);
          break;
        }
      }

      return {
        heading,

        bold: currentEditor.isActive("bold"),
        italic: currentEditor.isActive("italic"),
        underline: currentEditor.isActive("underline"),
        code: currentEditor.isActive("code"),

        bulletList: currentEditor.isActive("bulletList"),
        orderedList: currentEditor.isActive("orderedList"),
        blockquote: currentEditor.isActive("blockquote"),

        link: currentEditor.isActive("link"),

        alignLeft: currentEditor.isActive({
          textAlign: "left",
        }),

        alignCenter: currentEditor.isActive({
          textAlign: "center",
        }),

        alignRight: currentEditor.isActive({
          textAlign: "right",
        }),

        canUndo: currentEditor.can().chain().focus().undo().run(),
        canRedo: currentEditor.can().chain().focus().redo().run(),
      };
    },
  });

  if (!editor) {
    return (
      <div className="h-12 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900" />
    );
  }

  const toolbarDisabled = disabled || !editor.isEditable;

  function handleHeadingChange(event) {
    const value = event.target.value;

    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
      return;
    }

    editor
      .chain()
      .focus()
      .toggleHeading({
        level: Number(value),
      })
      .run();
  }

  function handleLink() {
    const previousUrl = editor.getAttributes("link").href || "";

    const nextUrl = window.prompt("Enter URL", previousUrl);

    if (nextUrl === null) {
      return;
    }

    const normalizedUrl = nextUrl.trim();

    if (!normalizedUrl) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: normalizedUrl,
      })
      .run();
  }

  return (
    <div
      role="toolbar"
      aria-label="Rich text formatting"
      className={[
        "flex min-h-12 flex-wrap items-center gap-1",
        "border-b border-slate-200 bg-slate-50 px-2 py-1.5",
        "dark:border-slate-700 dark:bg-slate-900",
      ].join(" ")}
    >
      <select
        value={editorState?.heading || "paragraph"}
        onChange={handleHeadingChange}
        disabled={toolbarDisabled}
        aria-label="Text style"
        className={[
          "h-9 rounded-lg border border-slate-200 bg-white px-2",
          "text-xs font-semibold text-slate-700 outline-none",
          "focus:border-[#0979c4]",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200",
        ].join(" ")}
      >
        <option value="paragraph">Paragraph</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
        <option value="4">Heading 4</option>
      </select>

      <ToolbarDivider />

      <ToolbarButton
        active={editorState?.bold}
        disabled={toolbarDisabled}
        label="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <FiBold aria-hidden="true" />
      </ToolbarButton>

      <ToolbarButton
        active={editorState?.italic}
        disabled={toolbarDisabled}
        label="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <FiItalic aria-hidden="true" />
      </ToolbarButton>

      <ToolbarButton
        active={editorState?.underline}
        disabled={toolbarDisabled}
        label="Underline"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <FiUnderline aria-hidden="true" />
      </ToolbarButton>

      <ToolbarButton
        active={editorState?.code}
        disabled={toolbarDisabled}
        label="Inline code"
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <FiCode aria-hidden="true" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        active={editorState?.bulletList}
        disabled={toolbarDisabled}
        label="Bullet list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <FiList aria-hidden="true" />
      </ToolbarButton>

      <ToolbarButton
        active={editorState?.orderedList}
        disabled={toolbarDisabled}
        label="Numbered list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <span aria-hidden="true" className="text-[11px] font-extrabold">
          1.
        </span>
      </ToolbarButton>

      <ToolbarButton
        active={editorState?.blockquote}
        disabled={toolbarDisabled}
        label="Blockquote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <span aria-hidden="true" className="text-lg font-black leading-none">
          “
        </span>
      </ToolbarButton>

      <ToolbarButton
        disabled={toolbarDisabled}
        label="Horizontal rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <FiMinus aria-hidden="true" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        active={editorState?.link}
        disabled={toolbarDisabled}
        label="Link"
        onClick={handleLink}
      >
        <FiLink aria-hidden="true" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        active={editorState?.alignLeft}
        disabled={toolbarDisabled}
        label="Align left"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <FiAlignLeft aria-hidden="true" />
      </ToolbarButton>

      <ToolbarButton
        active={editorState?.alignCenter}
        disabled={toolbarDisabled}
        label="Align center"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <FiAlignCenter aria-hidden="true" />
      </ToolbarButton>

      <ToolbarButton
        active={editorState?.alignRight}
        disabled={toolbarDisabled}
        label="Align right"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <FiAlignRight aria-hidden="true" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        disabled={toolbarDisabled || !editorState?.canUndo}
        label="Undo"
        onClick={() => editor.chain().focus().undo().run()}
      >
        <FiCornerUpLeft aria-hidden="true" />
      </ToolbarButton>

      <ToolbarButton
        disabled={toolbarDisabled || !editorState?.canRedo}
        label="Redo"
        onClick={() => editor.chain().focus().redo().run()}
      >
        <FiCornerUpRight aria-hidden="true" />
      </ToolbarButton>
    </div>
  );
}
