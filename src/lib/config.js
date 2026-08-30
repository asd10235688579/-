// 站点常量,可自行修改。展示页的动态内容(标题/简介/链接)可在管理端编辑。
export const SITE = {
  name: '夜与月',
  defaultTitle: '夜与月',
  // 管理端登录邮箱(固定,只输密码即可)
  adminEmail: import.meta.env.VITE_ADMIN_EMAIL || 'admin@site.com',
}

// 默认展示页文案(未在数据库配置时使用)
export const DEFAULT_SITE_CONTENT = {
  title: '夜与月',
  subtitle: '个人网站',
  about: '这里是我的个人空间,记录思考与创作。',
  links: [],
}

export const STORAGE_BUCKET = 'attachments'
