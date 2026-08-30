import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

// 密码登录:仅允许管理员邮箱账号,密码哈希在 Supabase 侧处理
export async function signIn(password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: import.meta.env.VITE_ADMIN_EMAIL || 'admin@site.com',
    password,
  })
  if (error) {
    throw new Error('密码错误或账号未创建')
  }
  return data.session
}

export async function signOut() {
  await supabase.auth.signOut()
}