import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';

export default function MarkdownContent({ children }) {
  return <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{children || ''}</ReactMarkdown>;
}
