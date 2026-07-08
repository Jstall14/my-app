'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [email, setEmail] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else setEmail(data.user.email ?? '')
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }


  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 24 }}>
      <h1>Profile</h1>
      <p>Logged in as: <strong>{email}</strong></p>
      <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>Log out</button>
      <button onClick={() => {router.push('/feed')}} style={{ padding: '8px 16px', cursor: 'pointer' }}>Feed</button>
      <button onClick={() => {router.push('/post')}} style={{ padding: '8px 16px', cursor: 'pointer' }}>Post</button>
    </div>
  )
}