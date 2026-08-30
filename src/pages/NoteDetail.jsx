import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPublicNote } from '../lib/api'
import MarkdownRenderer from '../components/MarkdownRenderer'

export default function NoteDetail() {
  const { id } = useParams()
  const [note, setNote] = useState(null)
  const [status, setStatus] = useState('loading') // loading | notfound | error | ok

  useEffect(() => {
    let alive = true
    getPublicNote(id)
      .then((n) => {
        if (!alive) return
        if (!n) setStatus('notfound')
        else {
          setNote(n)
          setStatus('ok')
        }
      })
      .catch(() => alive && setStatus('error'))
    return () => {
      alive = false
    }
  }, [id])

  if (status === 'loading') return <div className="empty">加载中…</div>
  if (status !== 'ok') {
    return (
      <div className="empty">
        <p>{status === 'notfound' ? '笔记不存在或未公开。' : '加载失败。'}</p>
        <Link to="/notes">返回笔记列表</Link>
      </div>
    )
  }
  return (
    <article className="note-detail">
      <h1 className="article-title">{note.title}</h1>
      <div className="note-meta">
        <time>{new Date(note.created_at).toLocaleDateString('zh-CN')}</time>
        {note.tags &&
          note.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      <MarkdownRenderer content={note.content} />
    </article>
  )
}