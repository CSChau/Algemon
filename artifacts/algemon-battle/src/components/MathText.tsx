import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface Props {
  children: string;
  style?: React.CSSProperties;
  block?: boolean;
}

export default function MathText({ children, style, block }: Props) {
  const Tag = block ? "div" : "span";

  const parts = children.split(/(\$[^$]+\$)/g);

  return (
    <Tag style={style}>
      {parts.map((part, i) => {
        if (part.startsWith("$") && part.endsWith("$")) {
          const latex = part.slice(1, -1);
          try {
            const html = katex.renderToString(latex, { throwOnError: false, displayMode: false });
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch {
            return <span key={i}>{part}</span>;
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </Tag>
  );
}
