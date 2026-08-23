import type { ReactNode } from "react";

// Matches only explicit http(s) URLs -- never bare domains or email
// addresses (docs/user/user-ui.md "External Links": "do not convert
// arbitrary non-URL text into links"). Greedy on non-whitespace, so
// trailing sentence punctuation (a period ending the sentence, a closing
// parenthesis wrapping the URL, ...) gets pulled in too -- split back out
// by splitTrailingPunctuation below.
const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

const TRAILING_PUNCTUATION = new Set([".", ",", "!", "?", ":", ";"]);
const CLOSING_TO_OPENING: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

// Trims natural-language trailing punctuation off a matched URL. ". , ! ?
// : ;" are always trimmed -- a URL practically never legitimately ends in
// one of these. A trailing closing bracket (") ] }") is only trimmed when
// it isn't balancing an earlier, still-unmatched opening bracket inside the
// URL itself, so "..._(disambiguation)"-style URLs keep their closing
// paren while "(https://example.com/form)" does not.
function splitTrailingPunctuation(url: string): { url: string; trailing: string } {
  let end = url.length;

  while (end > 0) {
    const char = url[end - 1];

    if (TRAILING_PUNCTUATION.has(char)) {
      end -= 1;
      continue;
    }

    const opening = CLOSING_TO_OPENING[char];
    if (opening) {
      const candidate = url.slice(0, end - 1);
      const opens = candidate.split(opening).length - 1;
      const closes = candidate.split(char).length - 1;
      if (closes >= opens) {
        end -= 1;
        continue;
      }
    }

    break;
  }

  return { url: url.slice(0, end), trailing: url.slice(end) };
}

// Splits plain post `content` into safe React text/link nodes, without a
// markdown/HTML parser and without dangerouslySetInnerHTML
// (docs/user/api-contract.md "Content Rendering Contract"). `String.split`
// with one capturing group alternates [text, url, text, url, ..., text],
// so every odd index is a matched URL candidate and every even index is
// surrounding plain text -- line breaks and all other characters in the
// plain-text segments are preserved exactly as authored (the caller
// renders the result inside a `white-space: pre-wrap` container for line
// breaks). Trailing punctuation trimmed off a URL candidate is pushed back
// in as its own plain-text node immediately after the link.
export function linkifyText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];

  text.split(URL_PATTERN).forEach((part, index) => {
    if (index % 2 === 0) {
      if (part) nodes.push(part);
      return;
    }

    const { url, trailing } = splitTrailingPunctuation(part);
    if (!/^https?:\/\/.+/.test(url)) {
      // Trimming left nothing resembling an actual URL (e.g. the "match"
      // was just "https://" followed immediately by punctuation) -- render
      // the original text as-is rather than linking a bare scheme.
      nodes.push(part);
      return;
    }

    nodes.push(
      <a
        key={index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand-800 underline underline-offset-2 hover:text-brand-500"
      >
        {url}
      </a>,
    );
    if (trailing) nodes.push(trailing);
  });

  return nodes;
}
