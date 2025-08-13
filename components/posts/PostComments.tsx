'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Heart, Reply, Send, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { formatRelativeTime } from '@/lib/utils'

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string | null
    image: string | null
  }
  replies: Comment[]
  _count: {
    likes: number
  }
}

interface PostCommentsProps {
  postId: string
}

export default function PostComments({ postId }: PostCommentsProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        const response = await fetch(`/api/comments?postId=${postId}`)
        if (response.ok) {
          const data = await response.json()
          setComments(data.comments)
        }
      } catch (error) {
        console.error('Failed to load comments:', error)
      } finally {
        setLoading(false)
      }
    }

    loadComments()
  }, [postId])

  // Submit new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user) {
      toast({
        title: '请先登录',
        description: '登录后即可发表评论',
        variant: 'destructive'
      })
      return
    }

    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment,
          postId,
          parentId: null
        })
      })

      if (response.ok) {
        const comment = await response.json()
        setComments([comment, ...comments])
        setNewComment('')
        toast({
          title: '评论成功',
          description: '感谢你的评论！'
        })
      } else {
        throw new Error('Failed to submit comment')
      }
    } catch (error) {
      toast({
        title: '评论失败',
        description: '请稍后重试',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Submit reply
  const handleSubmitReply = async (parentId: string) => {
    if (!session?.user) {
      toast({
        title: '请先登录',
        description: '登录后即可回复评论',
        variant: 'destructive'
      })
      return
    }

    if (!replyContent.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: replyContent,
          postId,
          parentId
        })
      })

      if (response.ok) {
        const reply = await response.json()
        
        // Update comments with new reply
        setComments(comments.map(comment => 
          comment.id === parentId 
            ? { ...comment, replies: [...comment.replies, reply] }
            : comment
        ))
        
        setReplyContent('')
        setReplyingTo(null)
        toast({
          title: '回复成功',
          description: '感谢你的回复！'
        })
      } else {
        throw new Error('Failed to submit reply')
      }
    } catch (error) {
      toast({
        title: '回复失败',
        description: '请稍后重试',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Like comment
  const handleLikeComment = async (commentId: string) => {
    if (!session?.user) {
      toast({
        title: '请先登录',
        description: '登录后即可点赞评论',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        // Update comment like count in state
        setComments(comments.map(comment => 
          comment.id === commentId 
            ? { ...comment, _count: { likes: data.likeCount } }
            : {
                ...comment,
                replies: comment.replies.map(reply => 
                  reply.id === commentId 
                    ? { ...reply, _count: { likes: data.likeCount } }
                    : reply
                )
              }
        ))
      }
    } catch (error) {
      toast({
        title: '操作失败',
        description: '请稍后重试',
        variant: 'destructive'
      })
    }
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? 'ml-12 border-l-2 border-muted pl-6' : ''}`}
    >
      <div className="flex space-x-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.author.image || ''} alt={comment.author.name || 'User'} />
          <AvatarFallback>
            {comment.author.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <p className="font-medium text-sm">{comment.author.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(comment.createdAt)}
            </p>
          </div>

          <div className="prose prose-sm max-w-none mb-3">
            <p>{comment.content}</p>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLikeComment(comment.id)}
              className="text-xs h-auto p-1"
            >
              <Heart className="h-4 w-4 mr-1" />
              {comment._count.likes}
            </Button>

            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(comment.id)}
                className="text-xs h-auto p-1"
              >
                <Reply className="h-4 w-4 mr-1" />
                回复
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-auto p-1">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>举报</DropdownMenuItem>
                {session?.user?.id === comment.author.id && (
                  <DropdownMenuItem className="text-destructive">删除</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Reply Form */}
          <AnimatePresence>
            {replyingTo === comment.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmitReply(comment.id)
                  }}
                  className="space-y-3"
                >
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`回复 ${comment.author.name}...`}
                    className="w-full p-3 border border-input rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                  <div className="flex items-center space-x-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!replyContent.trim() || submitting}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {submitting ? '发送中...' : '发送回复'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyContent('')
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}
    </motion.div>
  )

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <div className="flex items-center space-x-2 mb-8">
        <MessageCircle className="h-6 w-6" />
        <h3 className="text-2xl font-bold">
          评论 ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {session?.user ? (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div className="flex space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={session.user.image || ''} alt={session.user.name || 'User'} />
                <AvatarFallback>
                  {session.user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="写下你的想法..."
                  className="w-full p-4 border border-input rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-muted-foreground">
                    支持 Markdown 语法
                  </p>
                  <Button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitting ? '发布中...' : '发布评论'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground mb-4">登录后即可参与讨论</p>
            <Button asChild>
              <a href="/auth/signin">登录</a>
            </Button>
          </div>
        )}
      </motion.div>

      {/* Comments List */}
      <div className="space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">暂无评论，来发表第一个评论吧！</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </section>
  )
}