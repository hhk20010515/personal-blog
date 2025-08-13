'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Bold, 
  Italic, 
  Link, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Image, 
  Eye, 
  EyeOff,
  Type,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onImageUpload?: (file: File) => Promise<string>
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = '开始写作...',
  className,
  onImageUpload
}: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Toolbar actions
  const insertText = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const replacement = selectedText || placeholder
    
    const newText = value.substring(0, start) + before + replacement + after + value.substring(end)
    onChange(newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + replacement.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [value, onChange])

  const toolbarButtons = [
    {
      icon: Heading1,
      label: '标题 1',
      action: () => insertText('# ', '', '标题 1')
    },
    {
      icon: Heading2,
      label: '标题 2',
      action: () => insertText('## ', '', '标题 2')
    },
    {
      icon: Heading3,
      label: '标题 3',
      action: () => insertText('### ', '', '标题 3')
    },
    { divider: true },
    {
      icon: Bold,
      label: '粗体',
      action: () => insertText('**', '**', '粗体文字')
    },
    {
      icon: Italic,
      label: '斜体',
      action: () => insertText('*', '*', '斜体文字')
    },
    {
      icon: Code,
      label: '代码',
      action: () => insertText('`', '`', '代码')
    },
    { divider: true },
    {
      icon: Link,
      label: '链接',
      action: () => insertText('[', '](http://)', '链接文字')
    },
    {
      icon: Image,
      label: '图片',
      action: () => {
        if (onImageUpload) {
          fileInputRef.current?.click()
        } else {
          insertText('![', ']()', '图片描述')
        }
      }
    },
    { divider: true },
    {
      icon: List,
      label: '无序列表',
      action: () => insertText('- ', '', '列表项')
    },
    {
      icon: ListOrdered,
      label: '有序列表',
      action: () => insertText('1. ', '', '列表项')
    },
    {
      icon: Quote,
      label: '引用',
      action: () => insertText('> ', '', '引用内容')
    }
  ]

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!onImageUpload || !file.type.startsWith('image/')) return

    try {
      const url = await onImageUpload(file)
      const altText = file.name.split('.')[0]
      insertText(`![${altText}](${url})`)
    } catch (error) {
      console.error('Image upload failed:', error)
    }
  }

  // Handle drag and drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    for (const file of imageFiles) {
      await handleFileUpload(file)
    }
  }, [onImageUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  // Simple markdown to HTML converter (basic implementation)
  const markdownToHtml = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`(.*)`/gim, '<code>$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>')
      .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg" />')
      .replace(/^> (.*)$/gim, '<blockquote class="border-l-4 border-primary pl-4 italic">$1</blockquote>')
      .replace(/^- (.*)$/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/g, '<ul class="list-disc list-inside space-y-1">$1</ul>')
      .replace(/^\d+\. (.*)$/gim, '<li>$1</li>')
      .replace(/\n/gim, '<br />')
  }

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center space-x-1">
          {toolbarButtons.map((button, index) => {
            if ('divider' in button) {
              return <div key={index} className="w-px h-6 bg-border mx-1" />
            }
            
            const Icon = button.icon
            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={button.action}
                title={button.label}
                className="h-8 w-8 p-0"
              >
                <Icon className="h-4 w-4" />
              </Button>
            )
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center space-x-2"
        >
          {isPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span>{isPreview ? '编辑' : '预览'}</span>
        </Button>
      </div>

      {/* Editor/Preview Area */}
      <div className="relative">
        {!isPreview ? (
          <div
            className={cn(
              'relative',
              isDragOver && 'ring-2 ring-primary ring-opacity-50'
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full h-96 p-4 bg-transparent resize-none focus:outline-none font-mono text-sm leading-relaxed"
              style={{ minHeight: '400px' }}
            />
            
            {/* Drag overlay */}
            {isDragOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-primary/10 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-primary"
              >
                <div className="text-center">
                  <Image className="h-12 w-12 mx-auto mb-2 text-primary" />
                  <p className="text-primary font-medium">拖拽图片到此处上传</p>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div 
            className="p-4 prose prose-sm max-w-none min-h-96"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
          />
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file)
        }}
      />
    </div>
  )
}