import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAllNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  getSiteConfig,
  upsertSiteConfig,
} from '../lib/api'
import { signOut } from '../lib/auth'
import MarkdownRenderer from '../components/MarkdownRenderer'
import AttachmentUploader from '../components/AttachmentUploader'
import { DEFAULT_SITE_CONTENT } from '../lib/config'

const emptyNote = { title: '', summary: '', tags: [], content: '', public: false }

function TagsInput({ value, onChange }) {
  const [text, setText] = useState(value.join(', '))
  useEffect(() => setText(value.join(', ')), [value])
  return (
    <input
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        onChange(e.target.value.split(/[,，]/).map((t) => t.trim()).filter(Boolean))
      }}
      placeholder="标签,用逗号分隔"
    />
  )
}

function NoteEditor({ note, onSaved, onCancel }) {
  const [form, setForm] = useState(() =>
    note ? { ...note, tags: note.tags || [] } : { ...emptyNote },
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function save() {
    setBusy(true)
    setError('')
    try {
      const patch = {
        title: form.title.trim(),
        summary: form.summary.trim(),
        content: form.content,
        tags: form.tags,
        public: form.public,
      }
      if (note) await updateNote(note.id, patch)
      else await createNote(patch)
      onSaved()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="editor">
      <h2>{note ? '编辑笔记' : '新建笔记'}</h2>
      <label>
        标题
        <input value={form.title} onChange={set('title')} placeholder="笔记标题" />
      </label>
      <label>
        摘要
        <textarea
          value={form.summary}
          onChange={set('summary')}
          rows={2}
          placeholder="列表页显示的简介"
        />
      </label>
      <label>
        标签 <TagsInput value={form.tags} onChange={(tags) => setForm((f) => ({ ...f, tags }))} />
      </label>
      <label className="checkbox-line">
        <input
          type="checkbox"
          checked={form.public}
          onChange={(e) => setForm((f) => ({ ...f, public: e.target.checked }))}
        />
        公开(访客可见)
      </label>
      <label>
        正文(Markdown)
        <textarea
          className="code-area"
          value={form.content}
          onChange={set('content')}
          rows={18}
          placeholder={'支持 Markdown:标题、代码、链接、图片、音频。\n\n图片/音频先在上方上传,再插入对应语法:![图片](attachments=文件名)\n<audio src="attachments=文件名"></audio>'}
        />
      </label>
      <AttachmentUploader
        onInsert={(snippet) => setForm((f) => ({ ...f, content: f.content + snippet }))}
      />
      <h3>预览</h3>
      <div className="preview">
        <MarkdownRenderer content={form.content} />
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="editor-actions">
        <button className="btn btn-primary" onClick={save} disabled={busy}>
          {busy ? '保存中…' : '保存'}
        </button>
        <button className="btn btn-ghost" onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  )
}

function SettingsEditor() {
  const [form, setForm] = useState(DEFAULT_SITE_CONTENT)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getSiteConfig()
      .then((cfg) => {
        if (cfg) setForm({ ...DEFAULT_SITE_CONTENT, ...cfg })
      })
      .catch(() => {})
  }, [])

  async function save() {
    await upsertSiteConfig(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="settings">
      <h2>站点设置</h2>
      <label>
        站点名称
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </label>
      <label>
        副标题
        <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
      </label>
      <label>
        简介
        <textarea value={form.about} rows={3} onChange={(e) => setForm({ ...form, about: e.target.value })} />
      </label>
      <button className="btn btn-primary" onClick={save}>
        {saved ? '已保存' : '保存设置'}
      </button>
    </div>
  )
}

export default function Admin() {
  const navigate = useNavigate()
  const [notes, setNotes] = useState(null)
  const [editing, setEditing] = useState(null) // null=列表; {} 或 note=编辑
  const [error, setError] = useState('')
  const [tab, setTab] = useState('notes')

  async function load() {
    const list = await getAllNotes()
    setNotes(list)
  }

  useEffect(() => {
    load().catch((e) => setError(e.message))
  }, [])

  async function togglePublic(n) {
    await updateNote(n.id, { public: !n.public })
    load()
  }

  async function remove(n) {
    if (!window.confirm(`确认删除「${n.title}」?此操作不可恢复。`)) return
    await deleteNote(n.id)
    load()
  }

  if (error) return <div className="empty">加载失败:{error}</div>

  return (
    <div className="admin">
      <div className="admin-bar">
        <h1>管理后台</h1>
        <div className="admin-tabs">
          <button className={tab === 'notes' ? 'active' : ''} onClick={() => setTab('notes')}>
            笔记
          </button>
          <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>
            设置
          </button>
          <button
            className="btn btn-ghost"
            onClick={async () => {
              await signOut()
              navigate('/')
            }}
          >
            退出
          </button>
        </div>
      </div>

      {tab === 'settings' ? (
        <SettingsEditor />
      ) : editing ? (
        <NoteEditor
          note={editing.id ? editing : null}
          onSaved={() => {
            setEditing(null)
            load()
          }}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <div className="admin-list">
          <div className="list-head">
            <span>共 {notes ? notes.length : '…'} 篇笔记</span>
            <button className="btn btn-primary" onClick={() => setEditing({})}>
              + 新建笔记
            </button>
          </div>
          {!notes ? (
            <div className="empty">加载中…</div>
          ) : notes.length === 0 ? (
            <div className="empty">还没有笔记,点击右上角新建。</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>标题</th>
                  <th>标签</th>
                  <th>更新时间</th>
                  <th>公开</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((n) => (
                  <tr key={n.id}>
                    <td>{n.title || '(无标题)'}</td>
                    <td>{(n.tags || []).join(', ')}</td>
                    <td>{new Date(n.updated_at).toLocaleDateString('zh-CN')}</td>
                    <td>
                      <button
                        className={n.public ? 'pill on' : 'pill'}
                        onClick={() => togglePublic(n)}
                        title="点击切换公开/隐藏"
                      >
                        {n.public ? '公开' : '隐藏'}
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost"
                        onClick={async () => {
                          try {
                            const full = await getNote(n.id)
                            setEditing(full)
                          } catch (e) {
                            setError(e.message)
                          }
                        }}
                      >
                        编辑
                      </button>
                      <button className="btn btn-danger" onClick={() => remove(n)}>
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}