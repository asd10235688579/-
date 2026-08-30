-- 夜与月个人网站 - Supabase 初始化脚本
-- 使用方式: Supabase 控制台 -> SQL Editor -> New query -> 粘贴执行

-- 1) 笔记表
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  summary text not null default '',
  content text not null default '',           -- Markdown 正文
  tags text[] not null default '{}',
  public boolean not null default false,      -- true=访客可见
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 更新时间自动刷新
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_notes_updated on public.notes;
create trigger trg_notes_updated
  before update on public.notes
  for each row execute function public.set_updated_at();

-- 2) 站点配置(展示页,单行 id=1)
create table if not exists public.site_config (
  id int primary key default 1,
  title text not null default '夜与月',
  subtitle text not null default '个人网站',
  about text not null default '',
  check (id = 1)
);

-- 3) 安全规则 (Row Level Security)
--    访客(匿名): 只能读已公开的笔记 + 站点配置
--    管理员(已登录): 笔记全部权限 + 配置可改
alter table public.notes enable row level security;
alter table public.site_config enable row level security;

drop policy if exists "notes public read" on public.notes;
create policy "notes public read"
  on public.notes for select
  using (public = true);

drop policy if exists "notes admin all" on public.notes;
create policy "notes admin all"
  on public.notes for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "site_config public read" on public.site_config;
create policy "site_config public read"
  on public.site_config for select
  using (true);

drop policy if exists "site_config admin update" on public.site_config;
create policy "site_config admin update"
  on public.site_config for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 4) 初始化站点配置
insert into public.site_config (id, title, subtitle, about)
values (1, '夜与月', '个人笔记 · 慢思考的地方', '这里是我的个人空间,记录思考与创作。')
on conflict (id) do nothing;

-- 5) 附件存储桶: 去 Storage -> New bucket 创建名为 attachments 的桶,
--    勾选 Public bucket (公开读取, 上传由管理员身份限制)

-- 6) 创建管理员账号(把邮箱密码换成你的):
--    Authentication -> Users -> Add user -> 填邮箱+密码
--    密码登录后, 该账号即可管理笔记
