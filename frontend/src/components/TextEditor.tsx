// Markdown-first editor built on Lexical.
// Stores value as Markdown so it can be rendered safely server-side later.
import React, { useEffect, useMemo, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import {
  TRANSFORMERS,
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown";
import {
  HeadingNode,
  QuoteNode,
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from "@lexical/rich-text";
import {
  ListNode,
  ListItemNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  $isListNode,
} from "@lexical/list";
import { CodeNode, CodeHighlightNode, $createCodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  type EditorState,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $setBlocksType } from "@lexical/selection";
import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaLink } from "react-icons/fa";

type BlockType = "paragraph" | "h1" | "h2" | "quote" | "code";

type Props = {
  content: string;
  setContent: (md: string) => void;
  title?: string;
  setTitle?: (t: string) => void;
  hideTitle?: boolean;
};

const TextEditor: React.FC<Props> = ({
  content,
  setContent,
  title = "",
  setTitle,
  hideTitle = true,
}) => {
  // Editor config: map nodes we allow and convert initial MD to editor state.
  const initialConfig = useMemo(
    () => ({
      namespace: "MarkdownEditor",
      theme: {
        heading: { h1: "lex-h1", h2: "lex-h2" },
        paragraph: "lex-p",
        list: { ul: "lex-ul", ol: "lex-ol", listitem: "lex-li" },
        quote: "lex-quote",
        code: "lex-codeblock",
        text: { bold: "font-bold", italic: "italic", underline: "underline" },
      },
      onError(error: Error) {
        console.error(error);
      },
      editorState: () => $convertFromMarkdownString(content || "", TRANSFORMERS),
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        CodeNode,
        CodeHighlightNode,
        LinkNode,
        AutoLinkNode,
      ],
    }),
    [content]
  );

  return (
    <div className="flex flex-col bg-white p-0 rounded-xl shadow-md">
      {/* Optional title input controlled outside this component */}
      {!hideTitle && setTitle && (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="text-3xl font-bold mb-3 outline-none border-none bg-transparent placeholder-gray-400 w-full px-3 pt-3"
        />
      )}

      <LexicalComposer initialConfig={initialConfig}>
        <div className="border border-gray-300 rounded">
          <Toolbar />
          <ListPlugin />
          <LinkPlugin />

          {/* Main editable area */}
          <div className="relative p-2 min-h-[140px] editor-content">
            <RichTextPlugin
              contentEditable={<ContentEditable className="outline-none w-full px-2 py-1" />}
              placeholder={
                <div className="absolute top-4 left-4 text-gray-400 italic pointer-events-none">
                  Write here…
                </div>
              }
              ErrorBoundary={() => null}
            />

            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <HistoryPlugin />

            {/* Persist editor state as Markdown on each change */}
            <OnChangePlugin
              onChange={(editorState: EditorState) => {
                editorState.read(() => {
                  setContent($convertToMarkdownString(TRANSFORMERS));
                });
              }}
            />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
};

function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [formats, setFormats] = useState({ bold: false, italic: false, underline: false });
  const [blockType, setBlockType] = useState<BlockType>("paragraph");

  // Keep toolbar buttons in sync with current selection.
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const sel = $getSelection();
        if (!$isRangeSelection(sel)) return;

        setFormats({
          bold: sel.hasFormat("bold"),
          italic: sel.hasFormat("italic"),
          underline: sel.hasFormat("underline"),
        });

        const top = sel.anchor.getNode().getTopLevelElementOrThrow();

        if ($isListNode(top)) {
          setBlockType("paragraph");
          return;
        }
        if ($isHeadingNode(top)) {
          // @ts-ignore Lexical node has getTag in runtime
          const tag = top.getTag?.();
          if (tag === "h1" || tag === "h2") {
            setBlockType(tag);
            return;
          }
        }
        if (top.getType() === "quote") {
          setBlockType("quote");
          return;
        }
        if (top.getType() === "code") {
          setBlockType("code");
          return;
        }
        setBlockType("paragraph");
      });
    });
  }, [editor]);

  // Apply a specific block type to the selection.
  const applyBlockType = (type: BlockType) => {
    editor.update(() => {
      const sel = $getSelection();
      if (!$isRangeSelection(sel)) return;

      switch (type) {
        case "h1":
          $setBlocksType(sel, () => $createHeadingNode("h1"));
          break;
        case "h2":
          $setBlocksType(sel, () => $createHeadingNode("h2"));
          break;
        case "quote":
          $setBlocksType(sel, () => $createQuoteNode());
          break;
        case "code":
          $setBlocksType(sel, () => $createCodeNode());
          break;
        default:
          $setBlocksType(sel, () => $createParagraphNode());
      }

      setBlockType(type);
    });
  };

  // Simple prompt for link insertion; keeps UI minimal.
  const promptForLink = () => {
    const url = window.prompt("Enter URL");
    if (url === null) return;
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url.trim() || null);
  };

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 border-b border-gray-200 rounded-t-md">
      <select
        className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
        value={blockType}
        onChange={(e) => applyBlockType(e.target.value as BlockType)}
      >
        <option value="paragraph">Normal</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="quote">Quote</option>
        <option value="code">Code</option>
      </select>

      <div className="w-px h-5 bg-gray-300" />

      <Btn active={formats.bold} title="Bold" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}>
        <FaBold />
      </Btn>
      <Btn active={formats.italic} title="Italic" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}>
        <FaItalic />
      </Btn>
      <Btn active={formats.underline} title="Underline" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}>
        <FaUnderline />
      </Btn>

      <div className="w-px h-5 bg-gray-300" />

      <Btn title="Insert link" onClick={promptForLink}>
        <FaLink />
      </Btn>

      <div className="w-px h-5 bg-gray-300" />

      <Btn title="Bulleted list" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}>
        <FaListUl />
      </Btn>
      <Btn title="Numbered list" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}>
        <FaListOl />
      </Btn>
    </div>
  );
}

// Small helper for toolbar buttons.
function Btn({
  active,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-2 rounded text-sm ${active ? "bg-gray-300" : "bg-transparent hover:bg-gray-200"}`}
    >
      {children}
    </button>
  );
}

export default TextEditor;
