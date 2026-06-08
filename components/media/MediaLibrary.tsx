'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  File, 
  X, 
  Search,
  Grid3X3,
  List,
  Filter,
  MoreHorizontal,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MediaFile } from '@/types/media'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'


interface MediaLibraryProps {
  isOpen: boolean
  onClose: () => void
  onSelect?: (file: MediaFile) => void
  onUpload?: (files: File[]) => Promise<MediaFile[]>
  multiple?: boolean
  accept?: string
  className?: string
}

export default function MediaLibrary({
  isOpen,
  onClose,
  onSelect,
  onUpload,
  multiple = false,
  accept = 'image/*,video/*',
  className
}: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all')
  const [isDragOver, setIsDragOver] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Load media files
  const loadFiles = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/upload')
      if (response.ok) {
        const data = await response.json()
        setFiles(data.media || [])
      }
    } catch (error) {
      console.error('Failed to load media files:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadFiles()
    }
  }, [isOpen, loadFiles])

  // Handle file upload
  const handleUpload = useCallback(async (uploadFiles: File[]) => {
    if (!onUpload) return

    setUploading(true)
    try {
      const uploaded = await onUpload(uploadFiles)
      setFiles(prev => [...uploaded, ...prev])
      
      toast({
        title: '上传成功',
        description: `已上传 ${uploaded.length} 个文件`
      })
    } catch (error) {
      console.error('Upload failed:', error)
      toast({
        title: '上传失败',
        description: '请稍后重试',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }, [onUpload, toast])

  // Handle drag and drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      await handleUpload(droppedFiles)
    }
  }, [handleUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  // File selection
  const handleFileSelect = (file: MediaFile) => {
    if (multiple) {
      const newSelected = new Set(selectedFiles)
      if (newSelected.has(file.id)) {
        newSelected.delete(file.id)
      } else {
        newSelected.add(file.id)
      }
      setSelectedFiles(newSelected)
    } else {
      onSelect?.(file)
      onClose()
    }
  }

  // Filter files
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'image' && file.mimeType.startsWith('image/')) ||
      (filterType === 'video' && file.mimeType.startsWith('video/'))
    
    return matchesSearch && matchesFilter
  })

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Copy URL to clipboard
  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: '已复制',
        description: '文件链接已复制到剪贴板'
      })
    } catch (error) {
      toast({
        title: '复制失败',
        description: '请手动复制链接',
        variant: 'destructive'
      })
    }
  }

  const deleteFile = async (file: MediaFile) => {
    if (!confirm(`确定要删除「${file.originalName}」吗？`)) return

    try {
      const response = await fetch(`/api/upload?id=${encodeURIComponent(file.id)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error || 'Delete failed')
      }

      setFiles((prev) => prev.filter((item) => item.id !== file.id))
      setSelectedFiles((prev) => {
        const next = new Set(prev)
        next.delete(file.id)
        return next
      })
      toast({
        title: '删除成功',
        description: '媒体文件已删除'
      })
    } catch (error: any) {
      toast({
        title: '删除失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cn(
          'bg-background border border-border rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold">媒体库</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2"
              disabled={uploading}
            >
              <Upload className="h-4 w-4" />
              <span>{uploading ? '上传中...' : '上传文件'}</span>
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                全部
              </Button>
              <Button
                variant={filterType === 'image' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterType('image')}
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                图片
              </Button>
              <Button
                variant={filterType === 'video' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterType('video')}
              >
                <Video className="h-4 w-4 mr-1" />
                视频
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索文件..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div 
          className="flex-1 p-4 overflow-auto"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <File className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">暂无文件</p>
              <p className="text-muted-foreground mb-4">
                拖拽文件到此处或点击上传按钮开始上传
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                上传文件
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFiles.map((file) => (
                <motion.div
                  key={file.id}
                  layout
                  className={cn(
                    'group relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary',
                    selectedFiles.has(file.id) && 'border-primary'
                  )}
                  onClick={() => handleFileSelect(file)}
                >
                  {file.mimeType.startsWith('image/') ? (
                    <img
                      src={file.thumbnailUrl || file.url}
                      alt={file.alt || file.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-2 w-full">
                      <p className="text-white text-xs font-medium truncate">
                        {file.originalName}
                      </p>
                      <p className="text-white/70 text-xs">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          copyUrl(file.url)
                        }}>
                          <Copy className="h-4 w-4 mr-2" />
                          复制链接
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          window.open(file.url, '_blank')
                        }}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          在新标签页打开
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteFile(file)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <motion.div
                  key={file.id}
                  layout
                  className={cn(
                    'flex items-center space-x-4 p-3 rounded-lg border border-transparent hover:border-primary cursor-pointer',
                    selectedFiles.has(file.id) && 'border-primary bg-primary/5'
                  )}
                  onClick={() => handleFileSelect(file)}
                >
                  <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                    {file.mimeType.startsWith('image/') ? (
                      <img
                        src={file.thumbnailUrl || file.url}
                        alt={file.originalName}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <Video className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.originalName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                    </p>
                    {file.width && file.height && (
                      <p className="text-xs text-muted-foreground">
                        {file.width} × {file.height}
                      </p>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        copyUrl(file.url)
                      }}>
                        <Copy className="h-4 w-4 mr-2" />
                        复制链接
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        window.open(file.url, '_blank')
                      }}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        在新标签页打开
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteFile(file)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}
            </div>
          )}

          {/* Drag overlay */}
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-4 bg-primary/10 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-primary rounded-lg"
            >
              <div className="text-center">
                <Upload className="h-16 w-16 mx-auto mb-4 text-primary" />
                <p className="text-xl font-medium text-primary mb-2">拖拽文件到此处上传</p>
                <p className="text-muted-foreground">支持图片和视频格式</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        {multiple && selectedFiles.size > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              已选择 {selectedFiles.size} 个文件
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" onClick={() => setSelectedFiles(new Set())}>
                取消选择
              </Button>
              <Button 
                onClick={() => {
                  const selected = files.filter(f => selectedFiles.has(f.id))
                  selected.forEach(file => onSelect?.(file))
                  onClose()
                }}
              >
                选择文件
              </Button>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            if (files.length > 0) {
              handleUpload(files)
            }
          }}
        />
      </motion.div>
    </div>
  )
}
