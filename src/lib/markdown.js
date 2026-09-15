// 纯文本 → Markdown 宽松转换:
// 用户正常打字、回车换行即可,保存/预览时自动转换。
// - 已合法的 Markdown 块(标题/列表/引用/代码块/表格/图片/音频/链接等)原样保留
// - 普通文字:连续行合并为一段,段内回车转硬换行(Markdown 行尾两空格)
// - 空行分段
export function textToMarkdown(text) {
  if (!text) return ''
  const lines = text.split('\n')
  const out = []
  let inCode = false
  let pending = []

  function flush() {
    if (pending.length) {
      if (out.length && out[out.length - 1] !== '') out.push('')
      out.push(
        pending
          .map((l) => (l.trim() ? l.replace(/\s+$/, '') + '  ' : l))
          .join('\n'),
      )
      pending = []
    }
  }

  for (const raw of lines) {
    const line = raw
    const t = line.trim()
    if (t.startsWith('```')) {
      flush()
      inCode = !inCode
      out.push(line)
      continue
    }
    if (inCode) {
      out.push(line)
      continue
    }
    if (isMarkdownLine(line)) {
      flush()
      // 图片/音频/视频等媒体块与前面的内容分段
      if (
        /!\[[^\]]*\]\([^)]*\)|^<(img|audio|video|iframe)[\s>]/.test(line) &&
        out.length &&
        out[out.length - 1] !== ''
      ) {
        out.push('')
      }
      out.push(line)
      continue
    }
    if (t === '') {
      flush()
      continue
    }
    pending.push(line)
  }
  flush()
  return out.join('\n')
}

function isMarkdownLine(line) {
  const t = line.trimStart()
  if (/^(#{1,6})\s/.test(t)) return true // 标题
  if (/^>/.test(t)) return true // 引用
  if (/^[-*+]\s+/.test(t)) return true // 无序列表
  if (/^\d+[.)]\s+/.test(t)) return true // 有序列表
  if (/^\|.*\|\s*$/.test(t)) return true // 表格
  if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) return true // 分隔线
  if (/!\[[^\]]*\]\([^)]*\)/.test(line)) return true // 图片
  if (/\[[^\]]*\]\([^)]*\)/.test(line)) return true // 链接
  if (/^<(img|audio|video|iframe|br)[\s>]/.test(t)) return true // 媒体标签
  if (/\*\*[^*]+\*\*/.test(line)) return true // 加粗
  if (/^`{1,3}[^`]+`{1,3}$/.test(t)) return true // 行内代码
  return false
}
