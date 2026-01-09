import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, Video, Image, X, CheckCircle, Loader2 } from 'lucide-react'
import { supabase } from '../supabaseClient'

interface FileWithPreview {
  file: File
  preview: string
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error'
  progress: number
}

const DashboardPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [uploadType, setUploadType] = useState<'video' | 'photo'>('video')
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime']
  const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png']

  /* ================= FILE SELECTION ================= */

  const processFiles = (incoming: File[]) => {
    const processed: FileWithPreview[] = []

    for (const file of incoming) {
      const isValid =
        uploadType === 'video'
          ? validVideoTypes.includes(file.type)
          : validImageTypes.includes(file.type)

      if (!isValid) {
        alert(`Unsupported file type: ${file.name}`)
        continue
      }

      processed.push({
        file,
        preview: URL.createObjectURL(file),
        uploadStatus: 'idle',
        progress: 0
      })
    }

    setFiles(prev => [...prev, ...processed])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files))
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files))
    }
  }

  /* ================= REAL SUPABASE UPLOAD ================= */

  const handleUpload = async () => {
    if (!user || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    let completed = 0

    for (let i = 0; i < files.length; i++) {
      const current = files[i]

      setFiles(prev =>
        prev.map((f, idx) =>
          idx === i ? { ...f, uploadStatus: 'uploading', progress: 20 } : f
        )
      )

      const ext = current.file.name.split('.').pop()
      const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`

      const { error } = await supabase.storage
        .from('uploads')
        .upload(filePath, current.file)

      if (error) {
        console.error(error.message)
        setFiles(prev =>
          prev.map((f, idx) =>
            idx === i ? { ...f, uploadStatus: 'error', progress: 0 } : f
          )
        )
        continue
      }

      completed++
      setFiles(prev =>
        prev.map((f, idx) =>
          idx === i ? { ...f, uploadStatus: 'success', progress: 100 } : f
        )
      )
      setUploadProgress((completed / files.length) * 100)
    }

    setIsUploading(false)
  }

  /* ================= CLEANUP ================= */

  useEffect(() => {
    return () => {
      files.forEach(f => URL.revokeObjectURL(f.preview))
    }
  }, [files])

  const removeFile = (index: number) => {
    URL.revokeObjectURL(files[index].preview)
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-black/20 backdrop-blur-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">
          <span className="text-accent">CORRUPT</span>X
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-white">Welcome</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 px-4 py-2 rounded text-white"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto bg-secondary p-8 rounded-xl">

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setUploadType('video')}
              className={`px-6 py-2 rounded ${uploadType === 'video' ? 'bg-accent' : 'bg-gray-600'}`}
            >
              <Video className="inline w-4 h-4 mr-2" /> Video
            </button>
            <button
              onClick={() => setUploadType('photo')}
              className={`px-6 py-2 rounded ${uploadType === 'photo' ? 'bg-accent' : 'bg-gray-600'}`}
            >
              <Image className="inline w-4 h-4 mr-2" /> Photo
            </button>
          </div>

          <div
            className={`border-2 border-dashed p-12 rounded text-center ${
              isDragging ? 'border-accent' : 'border-gray-600'
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              hidden
              id="file-upload"
              accept={uploadType === 'video' ? '.mp4,.webm,.mov' : '.jpg,.jpeg,.png'}
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer text-white">
              <UploadCloud className="mx-auto mb-2" />
              Click or drop files
            </label>
          </div>

          {files.length > 0 && (
            <>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="mt-6 bg-accent px-6 py-2 rounded"
              >
                {isUploading ? 'Uploading…' : 'Upload Evidence'}
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {files.map((f, i) => (
                  <div key={i} className="bg-gray-800 p-4 rounded">
                    {f.file.type.startsWith('image') ? (
                      <img src={f.preview} className="rounded mb-2" />
                    ) : (
                      <video src={f.preview} controls className="rounded mb-2" />
                    )}

                    <p className="text-white truncate">{f.file.name}</p>
                    <p className="text-gray-400 text-sm">{formatFileSize(f.file.size)}</p>

                    {f.uploadStatus === 'success' && (
                      <p className="text-green-400 flex items-center gap-1">
                        <CheckCircle size={16} /> Uploaded
                      </p>
                    )}

                    <button
                      onClick={() => removeFile(i)}
                      className="text-red-400 mt-2"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
