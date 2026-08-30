import { supabase } from './supabase'
import { STORAGE_BUCKET } from './config'

export const TABLE_NOTES = 'notes'
export const TABLE_SITE = 'site_config'
export const TABLE_LINKS = 'site_links'

// ---------- 站点配置(展示页) ----------
export async function getSiteConfig() {
  const { data, error } = await supabase.from(TABLE_SITE).select('*').limit(1).maybeSingle()
  if (error) throw error
  return data
}

export async function upsertSiteConfig(config) {
  const { data, error } = await supabase.from(TABLE_SITE).upsert({ id: 1, ...config }).select().single()
  if (error) throw error
  return data
}

// ---------- 外部链接 ----------
export async function getLinks() {
  const { data, error } = await supabase.from(TABLE_LINKS).select('*').order('sort_order').order('created_at')
  if (error) throw error
  return data || []
}

// ---------- 笔记 ----------
export async function getPublicNotes() {
  const { data, error } = await supabase
    .from(TABLE_NOTES)
    .select('id, title, summary, tags, created_at, updated_at, public')
    .eq('public', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getPublicNote(id) {
  const { data, error } = await supabase
    .from(TABLE_NOTES)
    .select('*')
    .eq('id', id)
    .eq('public', true)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getNote(id) {
  const { data, error } = await supabase.from(TABLE_NOTES).select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function getAllNotes() {
  const { data, error } = await supabase
    .from(TABLE_NOTES)
    .select('id, title, summary, tags, public, created_at, updated_at, pinned')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createNote(note) {
  const { data, error } = await supabase.from(TABLE_NOTES).insert(note).select().single()
  if (error) throw error
  return data
}

export async function updateNote(id, patch) {
  const { data, error } = await supabase.from(TABLE_NOTES).update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteNote(id) {
  const { error } = await supabase.from(TABLE_NOTES).delete().eq('id', id)
  if (error) throw error
}

// ---------- 附件存储 ----------
export function getAttachmentPublicUrl(fileName) {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)
  return data.publicUrl
}

export async function uploadAttachment(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const filePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file)
  if (error) throw error
  return filePath
}

export async function deleteAttachment(filePath) {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([filePath])
  if (error) throw error
}

// 从笔记内容中提取引用的附件路径(附件的存储路径形如 xxx-yyy.ext)
export function extractAttachmentPaths(content) {
  const paths = new Set()
  const re = /attachments[=/][a-zA-Z0-9-]+\.[a-z0-9]+/g
  let m
  while ((m = re.exec(content)) !== null) {
    paths.add(m[0].replace('attachments=', '').replace('attachments/', ''))
  }
  return [...paths]
}