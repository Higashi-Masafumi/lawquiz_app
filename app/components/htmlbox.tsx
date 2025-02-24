import React from "react";
import parse, {
  HTMLReactParserOptions,
  domToReact,
  Element,
  DOMNode,
} from "html-react-parser";

interface HtmlWithCustomStylingProps {
  htmlString: string | null;
}

export function HtmlWithCustomStyling({
  htmlString,
}: HtmlWithCustomStylingProps) {
  if (!htmlString) {
    return null;
  }
  // タグ → 割り当てたいクラス名 のマッピング
  const tagToClassNameMap: Record<string, string> = {
    h1: "text-2xl font-bold my-4",
    h2: "text-xl font-bold my-3",
    h3: "text-lg font-semibold my-2",
    p: "mb-2",
    ul: "list-disc list-inside my-2",
    ol: "list-decimal list-inside my-2",
    li: "ml-4",
    // ほかにも必要に応じて追加してください
  };

  const options: HTMLReactParserOptions = {
    // `replace` は各ノード(domNode)を自由に置き換えることができる
    replace: (domNode) => {
      // domNode が <タグ> の場合 (type: "tag")
      if (
        domNode instanceof Element &&
        typeof domNode.name === "string" // タグ名が文字列であることを確認
      ) {
        // もしマッピングが存在すればクラスを割り当てて React 要素を返す
        const className = tagToClassNameMap[domNode.name];
        if (className) {
          // 子要素は再帰的に `domToReact` で変換
          return React.createElement(
            domNode.name, // 元のタグ名をそのまま使う (h1, p, など)
            { className },
            domToReact(domNode.children as DOMNode[], options) // 子ノードを再度 parse
          );
        }
      }

      // マッチしないタグはデフォルト動作に任せる(= 置き換えずそのまま)
      return undefined;
    },
  };

  // htmlString をパースし、タグごとに置き換える
  const parsedContent = parse(htmlString, options);

  return <div>{parsedContent}</div>;
}
