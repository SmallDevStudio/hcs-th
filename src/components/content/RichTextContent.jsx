import Link from "next/link";

function sanitizeHref(value) {
  const href = String(value || "").trim();

  if (href.startsWith("/") && !href.startsWith("//")) {
    return href;
  }

  if (href.startsWith("#")) {
    return href;
  }

  try {
    const url = new URL(href);

    if (["http:", "https:", "mailto:", "tel:"].includes(url.protocol)) {
      return href;
    }
  } catch {
    return null;
  }

  return null;
}

function applyMarks(content, marks, key) {
  return (Array.isArray(marks) ? marks : []).reduce(
    (currentContent, mark, markIndex) => {
      const markKey = `${key}-mark-${markIndex}`;

      if (mark.type === "bold") {
        return <strong key={markKey}>{currentContent}</strong>;
      }

      if (mark.type === "italic") {
        return <em key={markKey}>{currentContent}</em>;
      }

      if (mark.type === "underline") {
        return <u key={markKey}>{currentContent}</u>;
      }

      if (mark.type === "strike") {
        return <s key={markKey}>{currentContent}</s>;
      }

      if (mark.type === "code") {
        return (
          <code
            key={markKey}
            className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.9em] dark:bg-slate-800"
          >
            {currentContent}
          </code>
        );
      }

      if (mark.type === "link") {
        const href = sanitizeHref(mark.attrs?.href);

        if (!href) {
          return currentContent;
        }

        const external =
          href.startsWith("http://") || href.startsWith("https://");

        if (external) {
          return (
            <a
              key={markKey}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline underline-offset-2"
            >
              {currentContent}
            </a>
          );
        }

        return (
          <Link
            key={markKey}
            href={href}
            className="font-semibold text-primary underline underline-offset-2"
          >
            {currentContent}
          </Link>
        );
      }

      return currentContent;
    },
    content,
  );
}

function renderNodes(nodes, path = "root") {
  if (!Array.isArray(nodes)) {
    return null;
  }

  return nodes.map((node, index) => {
    const key = `${path}-${index}`;

    if (node.type === "text") {
      return applyMarks(node.text || "", node.marks, key);
    }

    if (node.type === "paragraph") {
      return (
        <p
          key={key}
          style={{
            textAlign: node.attrs?.textAlign || undefined,
          }}
        >
          {renderNodes(node.content, key)}
        </p>
      );
    }

    if (node.type === "heading") {
      const level = Number(node.attrs?.level || 2);

      const style = {
        textAlign: node.attrs?.textAlign || undefined,
      };

      const children = renderNodes(node.content, key);

      if (level === 3) {
        return (
          <h3 key={key} style={style}>
            {children}
          </h3>
        );
      }

      if (level === 4) {
        return (
          <h4 key={key} style={style}>
            {children}
          </h4>
        );
      }

      return (
        <h2 key={key} style={style}>
          {children}
        </h2>
      );
    }

    if (node.type === "bulletList") {
      return <ul key={key}>{renderNodes(node.content, key)}</ul>;
    }

    if (node.type === "orderedList") {
      return (
        <ol key={key} start={node.attrs?.start || 1}>
          {renderNodes(node.content, key)}
        </ol>
      );
    }

    if (node.type === "listItem") {
      return <li key={key}>{renderNodes(node.content, key)}</li>;
    }

    if (node.type === "blockquote") {
      return (
        <blockquote key={key}>{renderNodes(node.content, key)}</blockquote>
      );
    }

    if (node.type === "horizontalRule") {
      return <hr key={key} />;
    }

    if (node.type === "hardBreak") {
      return <br key={key} />;
    }

    return <span key={key}>{renderNodes(node.content, key)}</span>;
  });
}

export function RichTextContent({ document, className = "" }) {
  if (!document || document.type !== "doc") {
    return null;
  }

  return (
    <div
      className={[
        "space-y-4",
        "text-sm leading-7 text-[#40566b]",
        "dark:text-muted-foreground sm:text-[15px]",
        "[&_h2]:pt-2 [&_h2]:text-2xl [&_h2]:font-extrabold",
        "[&_h3]:pt-2 [&_h3]:text-xl [&_h3]:font-bold",
        "[&_h4]:pt-2 [&_h4]:text-lg [&_h4]:font-bold",
        "[&_h2]:text-[#071b30] [&_h3]:text-[#071b30]",
        "[&_h4]:text-[#071b30]",
        "dark:[&_h2]:text-white dark:[&_h3]:text-white",
        "dark:[&_h4]:text-white",
        "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6",
        "[&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6",
        "[&_blockquote]:border-l-4",
        "[&_blockquote]:border-primary",
        "[&_blockquote]:pl-4 [&_blockquote]:italic",
        "[&_hr]:border-[#deebf2]",
        "dark:[&_hr]:border-border",
        className,
      ].join(" ")}
    >
      {renderNodes(document.content)}
    </div>
  );
}
