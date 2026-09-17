'use client';

/** 极简富文本渲染：支持 ## 小节、- 列表、**加粗**、`代码`、> 引用 */
export default function RichText({ text }: { text: string }) {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    nodes.push(
      <ul key={key} className="my-1.5 list-disc space-y-1 pl-5 text-white/78">
        {listBuffer.map((item, index) => (
          <li key={index}>{inline(item)}</li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) {
      listBuffer.push(trimmed.slice(2));
      return;
    }
    flushList(`list-${index}`);

    if (!trimmed) {
      nodes.push(<div key={`gap-${index}`} className="h-2" />);
      return;
    }
    if (trimmed.startsWith('## ')) {
      nodes.push(
        <h4 key={index} className="serif mt-2 mb-1 text-[15px] text-gold-200">
          {trimmed.slice(3)}
        </h4>,
      );
      return;
    }
    if (trimmed.startsWith('> ')) {
      nodes.push(
        <p key={index} className="border-l-2 border-gold-400/40 pl-3 text-[12.5px] text-white/55">
          {inline(trimmed.slice(2))}
        </p>,
      );
      return;
    }
    nodes.push(
      <p key={index} className="whitespace-pre-wrap">
        {inline(trimmed)}
      </p>,
    );
  });

  flushList('list-end');
  return <div className="space-y-0.5">{nodes}</div>;
}

function inline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="text-gold-200">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="rounded bg-white/8 px-1.5 py-0.5 text-[12.5px] text-jade-300">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={index}>{part}</span>;
  });
}
