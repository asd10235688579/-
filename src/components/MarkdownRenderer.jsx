import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { getAttachmentPublicUrl } from '../lib/api'

// 处理附件引用: 数据库里存 attachments=文件名 或 attachments/文件名,
// 渲染时替换为存储桶公开 URL
function resolveSrc(src) {
  if (!src) return src
  const m = src.match(/attachments=([a-zA-Z0-9-]+\.[a-z0-9]+)/)
  if (m) return getAttachmentPublicUrl(m[1])
  return src
}

const components = {
  img({ src, alt }) {
    return <img src={resolveSrc(src)} alt={alt || ''} loading="lazy" />
  },
  a({ href, children }) {
    const url = resolveSrc(href)
    const isAttachment = /^https?:/.test(url)
    return isAttachment || /^https?:/.test(url) ? (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ) : (
      <a href={url}>{children}</a>
    )
  },
  audio({ src }) {
    const url = resolveSrc(src)
    return <audio controls src={uploadSrc(url)} style={{ width: '100%' }} />
  },
  video({ src }) {
    const url = resolveSrc(src)
    return <video controls src={url} style={{ maxWidth: '100%' }} />
  },
}

function uploadSrc(src) {
  if (!src) return src
  // 上传的音频以文件名直接写入内容时转公开 URL
  const m = src.match(/^([a-zA-Z0-9-]+\.[a-z0-9]+)$/)
  if (m) return getAttachmentPublicUrl(m[1])
  return src
}

function MarkdownRenderer({ content }) {
  if (!content) return null
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default memo(MarkdownRenderer)