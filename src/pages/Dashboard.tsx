import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, Video, Image, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface FileWithPreview extends File {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files))
    }
  }

  const processFiles = (newFiles: File[]) => {
    const processedFiles: FileWithPreview[] = []

    for (const file of newFiles) {
      // Safety check: ensure file.type exists before calling .includes()
      const isValid = uploadType === 'video'
        ? (file.type && validVideoTypes.includes(file.type))
        : (file.type && validImageTypes.includes(file.type))

      if (!isValid) {
        alert(`Unsupported file type: ${file.name}. Please upload ${uploadType === 'video' ? 'MP4, WEBM, or MOV videos' : 'JPG, JPEG, or PNG images'}`)
        continue
      }

      const previewUrl = URL.createObjectURL(file)
      processedFiles.push({
        ...file,
        preview: previewUrl,
        uploadStatus: 'idle',
        progress: 0
      })
    }

    if (processedFiles.length > 0) {
      setFiles(prev => [...prev, ...processedFiles])
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

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)
    setFiles(files.map(file => ({ ...file, uploadStatus: 'uploading', progress: 0 })))

    const totalFiles = files.length
    let completedFiles = 0
    let isMounted = true

    for (let i = 0; i < totalFiles && isMounted; i++) {
      const fileProgressInterval = setInterval(() => {
        if (!isMounted) {
          clearInterval(fileProgressInterval)
          return
        }
        setFiles(prevFiles =>
          prevFiles.map((file, index) =>
            index === i && file.uploadStatus === 'uploading'
              ? { ...file, progress: Math.min(file.progress + 10, 90) }
              : file
          )
        )
      }, 200)

      await new Promise(resolve => setTimeout(resolve, 1800))
      clearInterval(fileProgressInterval)

      if (!isMounted) break

      setFiles(prevFiles =>
        prevFiles.map((file, index) =>
          index === i
            ? { ...file, uploadStatus: 'success', progress: 100 }
            : file
        )
      )

      completedFiles++
      setUploadProgress((completedFiles / totalFiles) * 100)
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    if (isMounted) {
      setIsUploading(false)
      setUploadProgress(100)
    }
  }

  const removeFile = (index: number) => {
    const fileToRemove = files[index]
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
    setFiles(files.filter((_, i) => i !== index))
  }

  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [files])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-black/20 backdrop-blur-sm p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white">
            <span className="text-accent">CORRUPT</span><span className="text-white">X</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white font-medium">Welcome, {user?.username}</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-secondary rounded-2xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome to CorruptX</h2>
            <p className="text-gray-300 mb-8">Upload evidence of corruption to help expose the truth</p>

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setUploadType('video')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  uploadType === 'video' ? 'bg-accent text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                <Video className="w-4 h-4" />
                Video Evidence
              </button>
              <button
                onClick={() => setUploadType('photo')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  uploadType === 'photo' ? 'bg-accent text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                <Image className="w-4 h-4" />
                Photo Evidence
              </button>
            </div>

            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                isDragging ? 'border-accent bg-gray-800' : 'border-gray-600 bg-gray-900'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept={uploadType === 'video' ? '.mp4,.webm,.mov' : '.jpg,.jpeg,.png'}
                multiple
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                    {uploadType === 'video' ? <Video className="w-8 h-8 text-white" /> : <Image className="w-8 h-8 text-white" />}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Drag & Drop {uploadType === 'video' ? 'Videos' : 'Photos'} Here
                  </h3>
                  <p className="text-gray-400 mb-4">or click to browse files</p>
                  <button className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg text-white font-medium transition-colors flex items-center gap-2">
                    <UploadCloud className="w-4 h-4" />
                    Select Files
                  </button>
                </div>
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">Selected Files ({files.length})</h3>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      isUploading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-accent hover:bg-accent/90 text-white'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading ({Math.round(uploadProgress)}%)
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        Upload Evidence
                      </>
                    )}
                  </button>
                </div>

                {isUploading && (
                  <div className="mb-6">
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div className="bg-accent h-2.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      Uploading {files.filter(f => f.uploadStatus === 'uploading').length} of {files.length} files...
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-4 relative">
                      <div className="relative aspect-video mb-3 rounded-lg overflow-hidden bg-gray-700">
                        {/* Safety check: ensure file.type exists before calling .startsWith() */}
                        {file.type && file.type.startsWith('image') ? (
                          <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                        ) : file.type && file.type.startsWith('video') ? (
                          <video src={file.preview} controls className="w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-600 text-white">
                            <span>File preview not available</span>
                          </div>
                        )}

                        <div className="absolute top-2 right-2">
                          {file.uploadStatus === 'uploading' && (
                            <div className="w-6 h-6 rounded-full bg-gray-900/80 flex items-center justify-center">
                              <Loader2 className="w-4 h-4 text-white animate-spin" />
                            </div>
                          )}
                          {file.uploadStatus === 'success' && (
                            <div className="w-6 h-6 rounded-full bg-green-500/80 flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{file.name}</p>
                          <p className="text-gray-400 text-sm">
                            {/* FIX: Check if file.type exists before splitting to prevent the crash */}
                            {formatFileSize(file.size)} • {file.type ? file.type.split('/')[1].toUpperCase() : 'UNKNOWN'}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-400 hover:text-red-300 transition-colors ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage