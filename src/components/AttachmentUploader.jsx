import { useRef, useState } from 'react'
import { uploadAttachment, getAttachmentPublicUrl } from '../lib/api'

export default function AttachmentUploader({ onInsert }) {
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function onPick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setMsg('')
    try {
      const filePath = await uploadAttachment(file)
      const isImage = file.type.startsWith('image/')
      const isAudio = file.type.startsWith('audio/')
      const isVideo = file.type.startsWith('video/')
      const url = getAttachmentPublicUrl(filePath)
      let snippet = ''
      if (isImage) snippet = `\n\n![${file.name}](${url})`
      else if (isAudio) snippet = `\n\n<audio controls src="${url}"></audio>`
      else if (isVideo) snippet = `\n\n<video controls src="${url}"></video>`
      else snippet = `\n\n[下载 ${file.name}](${url})`
      onInsert(snippet)
      setMsg(`已上传:${file.name}(公开地址,可复制使用)`)
    } catch (err) {
      setMsg('上传失败:' + err.message)
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <div className="uploader">
      <button
        className="btn btn-ghost"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
      >
        {busy ? '上传中…' : '上传图片 / 音频 / 视频 / 文件'}
      </button>
      <input
        ref={fileRef}
        type="file"
        hidden
        onChange={onPick}
        accept="image/*,audio/*,video/*"
      />
      {msg && <span className="upload-msg">{msg}</span>}
    </div>
  )
}