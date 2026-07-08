'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Post = {
  id: number
  user_id: string
  content: string
  created_at: string
  email: string
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else setUserId(data.user.id)
    })
    loadPosts()
  }, [])

  async function loadPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error) setPosts(data ?? [])
    setLoading(false)
  }

  async function handleDelete(id: number) {
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (!error) setPosts(posts.filter(p => p.id !== id))
  }

  function startEditing(post: Post) {
    setEditingId(post.id)
    setEditContent(post.content)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditContent('')
  }

  async function handleEdit(id: number) {
    const { error } = await supabase
      .from('posts')
      .update({ content: editContent })
      .eq('id', id)

    if (!error) {
      setPosts(posts.map(p => p.id === id ? { ...p, content: editContent } : p))
      setEditingId(null)
      setEditContent('')
    }
  }

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>

  return (
    <div style={{ maxWidth: 600, margin: '60px auto', padding: 24 }}>
      <button onClick={() => router.push('/profile')}
        style={{ marginBottom: 24, cursor: 'pointer', background: 'none', border: 'none', fontSize: 14, color: 'blue' }}>
        ← Back to profile
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Feed</h1>
        <button onClick={() => router.push('/post')}
          style={{ padding: '8px 16px', cursor: 'pointer' }}>
          + New Post
        </button>
      </div>
      {posts.length === 0 && <p>No posts yet. Be the first!</p>}
      {posts.map(post => (
        <div key={post.id} style={{ textAlign: 'center', fontWeight: 'bold' }}>
          <p>{post.email}</p>
          <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 16 }}>
            {editingId === post.id ? (
              <>
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={4}
                  style={{ display: 'block', width: '100%', padding: 8, marginBottom: 8, fontSize: 15, resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button onClick={() => handleEdit(post.id)}
                    style={{ padding: '6px 14px', cursor: 'pointer' }}>
                    Save
                  </button>
                  <button onClick={cancelEditing}
                    style={{ padding: '6px 14px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p style={{ margin: '0 0 12px 0', fontWeight: 'normal' }}>{post.content}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <small style={{ color: '#888' }}>{new Date(post.created_at).toLocaleString()}</small>
                  {post.user_id === userId && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button onClick={() => startEditing(post)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'blue' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(post.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'red' }}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}