'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  Save, 
  Eye, 
  Send, 
  ArrowLeft,
  Settings,
  Image as ImageIcon,
  Tag,
  Calendar,
  Globe,
  Lock,
  Eye as EyeIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import MarkdownEditor from '@/components/editor/MarkdownEditor'
import MediaLibrary from '@/components/media/MediaLibrary'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
}

import { MediaFile } from '@/types/media'

export default function WritePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [postStatus, setPostStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'UNLISTED'>('PUBLIC')
  const [isFeatured, setIsFeatured] = useState(false)
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [camera, setCamera] = useState('')
  const [lens, setLens] = useState('')
  const [focalLength, setFocalLength] = useState('')
  const [aperture, setAperture] = useState('')
  const [shutterSpeed, setShutterSpeed] = useState('')
  const [iso, setIso] = useState('')
  const [takenAt, setTakenAt] = useState('')
  const [locationName, setLocationName] = useState('')
  const [locationLat, setLocationLat] = useState('')
  const [locationLng, setLocationLng] = useState('')
  const [photoSeries, setPhotoSeries] = useState('')
  const [gearBrand, setGearBrand] = useState('')
  const [gearModel, setGearModel] = useState('')
  const [gearType, setGearType] = useState('')
  const [sensorFormat, setSensorFormat] = useState('')
  const [megapixels, setMegapixels] = useState('')
  const [weightGrams, setWeightGrams] = useState('')
  const [priceCny, setPriceCny] = useState('')
  const [reviewRating, setReviewRating] = useState('')
  const [dynamicRange, setDynamicRange] = useState('')
  const [autofocusSystem, setAutofocusSystem] = useState('')
  const [stabilization, setStabilization] = useState('')
  const [weatherSealed, setWeatherSealed] = useState<'unset' | 'true' | 'false'>('unset')
  const [sampleVariation, setSampleVariation] = useState('')
  const [firmwareVersion, setFirmwareVersion] = useState('')

  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/write')
    } else if (status === 'authenticated' && session?.user.role !== 'ADMIN') {
      router.push('/')
    }
  }, [status, session, router])

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }

    loadCategories()
  }, [])

  // Handle image upload
  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const data = await response.json()
    return data.url
  }

  // Handle multiple file upload
  const handleMultipleUpload = async (files: File[]): Promise<MediaFile[]> => {
    const uploaded: MediaFile[] = []
    
    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          uploaded.push(data)
        }
      } catch (error) {
        console.error('Failed to upload file:', file.name, error)
      }
    }

    return uploaded
  }

  // Add tag
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setTagInput('')
    }
  }

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  // Save post
  const savePost = async (publish = false) => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: '请填写必填字段',
        description: '标题和内容不能为空',
        variant: 'destructive'
      })
      return
    }

    setSaving(true)
    
    try {
      const postData = {
        title: title.trim(),
        content,
        excerpt: excerpt.trim() || undefined,
        categoryId: categoryId || undefined,
        tags,
        status: publish ? 'PUBLISHED' : postStatus,
        visibility,
        isFeatured,
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
        camera: camera.trim() || undefined,
        lens: lens.trim() || undefined,
        focalLength: focalLength.trim() || undefined,
        aperture: aperture.trim() || undefined,
        shutterSpeed: shutterSpeed.trim() || undefined,
        iso: iso ? Number(iso) : undefined,
        takenAt: takenAt || undefined,
        locationName: locationName.trim() || undefined,
        locationLat: locationLat ? Number(locationLat) : undefined,
        locationLng: locationLng ? Number(locationLng) : undefined,
        photoSeries: photoSeries.trim() || undefined,
        gearBrand: gearBrand.trim() || undefined,
        gearModel: gearModel.trim() || undefined,
        gearType: gearType.trim() || undefined,
        sensorFormat: sensorFormat.trim() || undefined,
        megapixels: megapixels ? Number(megapixels) : undefined,
        weightGrams: weightGrams ? Number(weightGrams) : undefined,
        priceCny: priceCny ? Number(priceCny) : undefined,
        reviewRating: reviewRating ? Number(reviewRating) : undefined,
        dynamicRange: dynamicRange.trim() || undefined,
        autofocusSystem: autofocusSystem.trim() || undefined,
        stabilization: stabilization.trim() || undefined,
        weatherSealed: weatherSealed === 'unset' ? undefined : weatherSealed === 'true',
        sampleVariation: sampleVariation.trim() || undefined,
        firmwareVersion: firmwareVersion.trim() || undefined
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: publish ? '发布成功' : '保存成功',
          description: publish ? '文章已成功发布' : '草稿已保存'
        })
        
        // Redirect to the post page
        router.push(`/posts/${data.slug}`)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Save failed')
      }
    } catch (error: any) {
      console.error('Save failed:', error)
      toast({
        title: '保存失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回首页
                </Button>
              </Link>
              
              <div className="h-6 w-px bg-border" />
              
              <h1 className="text-xl font-semibold">写文章</h1>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMediaLibrary(true)}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                媒体库
              </Button>

              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    设置
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>文章设置</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Basic Settings */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">摘要</label>
                      <textarea
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="文章摘要（可选）"
                        className="w-full p-3 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">分类</label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择分类" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">可见性</label>
                        <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PUBLIC">
                              <div className="flex items-center">
                                <Globe className="h-4 w-4 mr-2" />
                                公开
                              </div>
                            </SelectItem>
                            <SelectItem value="UNLISTED">
                              <div className="flex items-center">
                                <EyeIcon className="h-4 w-4 mr-2" />
                                不公开列表
                              </div>
                            </SelectItem>
                            <SelectItem value="PRIVATE">
                              <div className="flex items-center">
                                <Lock className="h-4 w-4 mr-2" />
                                私人
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">标签</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 text-primary/60 hover:text-primary"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addTag(tagInput)
                            }
                          }}
                          placeholder="添加标签"
                          className="flex-1 p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <Button 
                          type="button"
                          onClick={() => addTag(tagInput)}
                          disabled={!tagInput.trim()}
                        >
                          添加
                        </Button>
                      </div>
	                    </div>

	                    {/* Photography Metadata */}
	                    <div className="space-y-4">
	                      <h3 className="font-medium">摄影信息</h3>

	                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
	                        <div>
	                          <label className="text-sm font-medium mb-2 block">相机</label>
	                          <input
	                            type="text"
	                            value={camera}
	                            onChange={(e) => setCamera(e.target.value)}
	                            placeholder="例如 Fujifilm X-T5"
	                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
	                          />
	                        </div>

	                        <div>
	                          <label className="text-sm font-medium mb-2 block">镜头</label>
	                          <input
	                            type="text"
	                            value={lens}
	                            onChange={(e) => setLens(e.target.value)}
	                            placeholder="例如 XF 35mm F1.4"
	                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
	                          />
	                        </div>

	                        <div>
	                          <label className="text-sm font-medium mb-2 block">焦段</label>
	                          <input
	                            type="text"
	                            value={focalLength}
	                            onChange={(e) => setFocalLength(e.target.value)}
	                            placeholder="例如 35mm"
	                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
	                          />
	                        </div>

	                        <div>
	                          <label className="text-sm font-medium mb-2 block">光圈</label>
	                          <input
	                            type="text"
	                            value={aperture}
	                            onChange={(e) => setAperture(e.target.value)}
	                            placeholder="例如 f/2.8"
	                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
	                          />
	                        </div>

	                        <div>
	                          <label className="text-sm font-medium mb-2 block">快门</label>
	                          <input
	                            type="text"
	                            value={shutterSpeed}
	                            onChange={(e) => setShutterSpeed(e.target.value)}
	                            placeholder="例如 1/250s"
	                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
	                          />
	                        </div>

	                        <div>
	                          <label className="text-sm font-medium mb-2 block">ISO</label>
	                          <input
	                            type="number"
	                            min="1"
	                            value={iso}
	                            onChange={(e) => setIso(e.target.value)}
	                            placeholder="例如 400"
	                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
	                          />
	                        </div>

	                        <div>
	                          <label className="text-sm font-medium mb-2 block">拍摄时间</label>
	                          <input
	                            type="datetime-local"
	                            value={takenAt}
	                            onChange={(e) => setTakenAt(e.target.value)}
	                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
	                          />
	                        </div>

	                        <div>
	                          <label className="text-sm font-medium mb-2 block">地点</label>
	                          <input
	                            type="text"
	                            value={locationName}
	                            onChange={(e) => setLocationName(e.target.value)}
	                            placeholder="例如 上海"
	                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
	                          />
	                        </div>

	                        <div>
	                          <label className="text-sm font-medium mb-2 block">纬度</label>
	                          <input
	                            type="number"
	                            min="-90"
	                            max="90"
	                            step="0.000001"
	                            value={locationLat}
	                            onChange={(e) => setLocationLat(e.target.value)}
	                            placeholder="31.230416"
	                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
	                          />
	                        </div>

	                        <div>
	                          <label className="text-sm font-medium mb-2 block">经度</label>
	                          <input
	                            type="number"
	                            min="-180"
	                            max="180"
	                            step="0.000001"
	                            value={locationLng}
	                            onChange={(e) => setLocationLng(e.target.value)}
	                            placeholder="121.473701"
	                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
	                          />
	                        </div>
	                      </div>

	                      <div>
	                        <label className="text-sm font-medium mb-2 block">作品系列</label>
	                        <input
	                          type="text"
	                          value={photoSeries}
	                          onChange={(e) => setPhotoSeries(e.target.value)}
	                          placeholder="例如 城市夜行"
	                          className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
	                        />
	                      </div>
	                    </div>

                    {/* Gear Review Metadata */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">器材测评参数</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          适合相机、镜头、稳定器、存储、灯光等硬核测评内容；留空不会影响普通文章。
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">品牌</label>
                          <input
                            type="text"
                            value={gearBrand}
                            onChange={(e) => setGearBrand(e.target.value)}
                            placeholder="例如 Sony / Fujifilm / DJI"
                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">型号</label>
                          <input
                            type="text"
                            value={gearModel}
                            onChange={(e) => setGearModel(e.target.value)}
                            placeholder="例如 A7C II / X100VI"
                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">器材类型</label>
                          <input
                            type="text"
                            value={gearType}
                            onChange={(e) => setGearType(e.target.value)}
                            placeholder="相机 / 镜头 / 稳定器 / 灯光"
                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">传感器 / 规格</label>
                          <input
                            type="text"
                            value={sensorFormat}
                            onChange={(e) => setSensorFormat(e.target.value)}
                            placeholder="全画幅 / APS-C / M4/3 / 1-inch"
                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">有效像素 MP</label>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={megapixels}
                            onChange={(e) => setMegapixels(e.target.value)}
                            placeholder="例如 33"
                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">重量 g</label>
                          <input
                            type="number"
                            min="1"
                            value={weightGrams}
                            onChange={(e) => setWeightGrams(e.target.value)}
                            placeholder="例如 514"
                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">参考价格 CNY</label>
                          <input
                            type="number"
                            min="1"
                            value={priceCny}
                            onChange={(e) => setPriceCny(e.target.value)}
                            placeholder="例如 12999"
                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">评分 0-10</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={reviewRating}
                            onChange={(e) => setReviewRating(e.target.value)}
                            placeholder="例如 8.7"
                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">动态范围</label>
                          <input
                            type="text"
                            value={dynamicRange}
                            onChange={(e) => setDynamicRange(e.target.value)}
                            placeholder="例如 14 stops / 高光宽容度优秀"
                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">对焦系统</label>
                          <input
                            type="text"
                            value={autofocusSystem}
                            onChange={(e) => setAutofocusSystem(e.target.value)}
                            placeholder="例如 AI subject tracking / 759 PDAF"
                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">防抖</label>
                          <input
                            type="text"
                            value={stabilization}
                            onChange={(e) => setStabilization(e.target.value)}
                            placeholder="例如 7 stops IBIS / Lens IS"
                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">防尘防滴</label>
                          <Select value={weatherSealed} onValueChange={(value: any) => setWeatherSealed(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unset">未填写</SelectItem>
                              <SelectItem value="true">支持</SelectItem>
                              <SelectItem value="false">不支持 / 未标注</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">测试样本</label>
                          <input
                            type="text"
                            value={sampleVariation}
                            onChange={(e) => setSampleVariation(e.target.value)}
                            placeholder="零售版 / 工程样机 / 借测"
                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">固件版本</label>
                          <input
                            type="text"
                            value={firmwareVersion}
                            onChange={(e) => setFirmwareVersion(e.target.value)}
                            placeholder="例如 v2.01"
                            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>

	                    {/* SEO Settings */}
                    <div className="space-y-4">
                      <h3 className="font-medium">SEO 设置</h3>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">SEO 标题</label>
                        <input
                          type="text"
                          value={metaTitle}
                          onChange={(e) => setMetaTitle(e.target.value)}
                          placeholder="SEO 标题（可选）"
                          className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">SEO 描述</label>
                        <textarea
                          value={metaDescription}
                          onChange={(e) => setMetaDescription(e.target.value)}
                          placeholder="SEO 描述（可选）"
                          className="w-full p-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Advanced Options */}
                    {session.user.role === 'ADMIN' && (
                      <div>
                        <h3 className="font-medium mb-2">高级选项</h3>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                            className="rounded border-input"
                          />
                          <span className="text-sm">设为推荐文章</span>
                        </label>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <div className="h-6 w-px bg-border" />

              <Button
                variant="ghost"
                onClick={() => savePost(false)}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? '保存中...' : '保存草稿'}
              </Button>

              <Button
                onClick={() => savePost(true)}
                disabled={saving || !title.trim() || !content.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                发布
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="文章标题..."
            className="w-full text-4xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground"
          />

          {/* Editor */}
          <MarkdownEditor
            value={content}
            onChange={setContent}
            onImageUpload={handleImageUpload}
            className="min-h-[600px]"
            placeholder="开始写作你的故事..."
          />
        </motion.div>
      </main>

      {/* Media Library */}
      <MediaLibrary
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onUpload={handleMultipleUpload}
        onSelect={(file) => {
          // Insert image into editor
          const imageMarkdown = `![${file.originalName}](${file.url})`
          setContent(content + '\n\n' + imageMarkdown)
        }}
      />
    </div>
  )
}
