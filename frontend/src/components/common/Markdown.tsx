import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';

export function Markdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none text-gray-700',
        'prose-p:leading-relaxed prose-p:my-2',
        'prose-a:text-[#8B4513] prose-a:underline-offset-4 hover:prose-a:text-[#8B4513]/80',
        'prose-strong:text-gray-900',
        'prose-blockquote:border-l-[#D4AF37] prose-blockquote:text-gray-700',
        'prose-hr:border-gray-200',
        'prose-code:text-[#8B4513] prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:bg-transparent prose-pre:p-0',
        'prose-table:text-sm',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const code = String(children).replace(/\n$/, '');
            if (match) {
              return (
                <SyntaxHighlighter
                  style={oneDark as any}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: 12,
                    padding: '12px 14px',
                    background: '#111827',
                  }}
                  codeTagProps={{ style: { fontSize: 12 } }}
                >
                  {code}
                </SyntaxHighlighter>
              );
            }
            return (
              <code
                {...props}
                className="rounded bg-[#8B4513]/10 px-1.5 py-0.5 font-mono text-[12px]"
              >
                {code}
              </code>
            );
          },
        }}
      >
        {content || ''}
      </ReactMarkdown>
    </div>
  );
}
