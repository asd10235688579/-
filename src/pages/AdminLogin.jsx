import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      setError('未配置 Supabase,请先填写 .env 环境变量(见部署文档)。')
      return
    }
    setBusy(true)
    setError('')
    try {
      await signIn(password)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={onSubmit}>
        <h1>管理登录</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="输入管理密码"
          autoFocus
        />
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? '验证中…' : '进入管理'}
        </button>
      </form>
    </div>
  )
}