import { useEffect, useState } from 'react'
import { recordBlogView, setBlogLike, type UiBlogPost } from '@/lib/api'

const LIKED_POSTS_KEY = 'gele-liked-posts'
const ADMIN_SESSION_KEY = 'gele_admin_user'

function readLikedPosts(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(LIKED_POSTS_KEY) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function rememberLike(slug: string, liked: boolean) {
  try {
    const others = readLikedPosts().filter((item) => item !== slug)
    localStorage.setItem(LIKED_POSTS_KEY, JSON.stringify(liked ? [...others, slug] : others))
  } catch {
    // Private windows can refuse storage; the like still counts.
  }
}

function isAdminBrowser() {
  try {
    return Boolean(localStorage.getItem(ADMIN_SESSION_KEY))
  } catch {
    return false
  }
}

/** Counts this read once and handles the Like button. */
export function useBlogEngagement(post: UiBlogPost) {
  const [views, setViews] = useState(post.views)
  const [likes, setLikes] = useState(post.likes)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    setLiked(readLikedPosts().includes(post.slug))
    // Staff checking their own posts shouldn't inflate the numbers.
    if (isAdminBrowser()) return
    let cancelled = false
    recordBlogView(post.slug)
      .then((counts) => {
        if (!cancelled) setViews(counts.views)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [post.slug])

  const toggleLike = () => {
    const next = !liked
    setLiked(next)
    setLikes((current) => Math.max(0, current + (next ? 1 : -1)))
    rememberLike(post.slug, next)
    setBlogLike(post.slug, next)
      .then((counts) => setLikes(counts.likes))
      .catch(() => {
        setLiked(!next)
        setLikes((current) => Math.max(0, current + (next ? -1 : 1)))
        rememberLike(post.slug, !next)
      })
  }

  return { views, likes, liked, toggleLike }
}
