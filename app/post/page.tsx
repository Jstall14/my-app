'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PostPage() {
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
    })
  }, [])

  async function handlePost() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      content: content,
      email: user.email,
    })

    if (error) setError(error.message)
    else {
      setSuccess(true)
      setContent('')
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '60px auto', padding: 24 }}>
      <button onClick={() => router.push('/profile')}
        style={{ marginBottom: 24, cursor: 'pointer', background: 'none', border: 'none', fontSize: 14, color: 'blue' }}>
        ← Back to profile
      </button>
      <h1>Create a Post</h1>
      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={5}
        style={{ display: 'block', width: '100%', padding: 12, marginBottom: 12, fontSize: 16, resize: 'vertical' }}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Post created!</p>}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={handlePost}
          style={{ padding: '8px 20px', cursor: 'pointer' }}>
          Post
        </button>
        <button onClick={() => router.push('/feed')}
          style={{ padding: '8px 20px', cursor: 'pointer' }}>
          View Feed
        </button>
      </div>
    </div>
  )
}