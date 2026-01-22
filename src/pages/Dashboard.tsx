import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, Video, Image, ArrowLeft, MapPin } from 'lucide-react'
import { supabase } from '../supabaseClient'
import CampaignCard from '../components/CampaignCard'
import CampaignIntroPanel from '../components/CampaignIntroPanel'
import HeatmapView from '../components/HeatmapView'

interface FileWithPreview {
  file: File
  preview: string
}

const CorruptionTypes = [
  'Bribery',
  'Fraud',
  'Abuse of Power',
  'Embezzlement',
  'Blackmail',
  'Nepotism',
  'Other',
]

const DashboardPage = () => {
  const { user, logout, role } = useAuth()
  const navigate = useNavigate()

  // Flow state
  const [currentView, setCurrentView] = useState<'campaigns' | 'reporting'>('campaigns')
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
  const [isProposalMode, setIsProposalMode] = useState(false)
  const [submittedProposalId, setSubmittedProposalId] = useState<string | null>(null)

  const [uploadType, setUploadType] = useState<'video' | 'photo'>('video')
  const [file, setFile] = useState<FileWithPreview | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [shareX, setShareX] = useState(false)
  const [shareInstagram, setShareInstagram] = useState(false)
  const [shareFacebook, setShareFacebook] = useState(false)
  const [corruptionType, setCorruptionType] = useState(CorruptionTypes[0])
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [reporterName, setReporterName] = useState('')
  const [reporterContact, setReporterContact] = useState('')
  const [isCheckingReporter, setIsCheckingReporter] = useState(false)
  const [campaignSearchTerm, setCampaignSearchTerm] = useState('')

  // Heatmap data
  const [heatmapPoints, setHeatmapPoints] = useState<any[]>([])

  const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime']
  const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png']

  /* ================= FILE SELECTION ================= */

  const processFiles = (incoming: File[]) => {
    if (incoming.length === 0) return
    const file = incoming[0]
    const isValid =
      uploadType === 'video' ? validVideoTypes.includes(file.type) : validImageTypes.includes(file.type)

    if (!isValid) {
      alert(`Unsupported file type: ${file.name}`)
      return
    }

    setFile({ file, preview: URL.createObjectURL(file) })
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

  /* ================= GEOLOCATION ================= */

  const getGeolocation = () => {
    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          console.warn('Geolocation error:', error)
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      )
    })
  }

  /* ================= REAL SUPABASE UPLOAD + METADATA ================= */

  const handleUpload = async () => {
    if (!user || !file) return
    
    // Check if proposal is required but not submitted
    if (isProposalMode && !submittedProposalId) {
      alert('Please submit the campaign proposal first before uploading evidence')
      return
    }
    
    // Ensure campaign selected or proposal submitted
    if (!selectedCampaign && !submittedProposalId) {
      alert('Please select a campaign or submit a proposal before uploading')
      return
    }
    
    // validate metadata
    if (!description.trim()) {
      alert('Please provide a description')
      return
    }
    if (!location.trim()) {
      alert('Please provide a location')
      return
    }
    if (!corruptionType) {
      alert('Please select a corruption type')
      return
    }
    if (!isAnonymous) {
      if (!reporterName.trim() || !reporterContact.trim()) {
        alert('Please provide your name and contact or submit anonymously')
        return
      }
    }

    setIsUploading(true)

    // Get geolocation - MANDATORY
    let coords: { latitude: number; longitude: number }
    try {
      coords = await getGeolocation()
      console.log('📍 Location captured:', coords)
      console.log('Latitude:', coords.latitude, 'Longitude:', coords.longitude)
    } catch (err: any) {
      console.error('❌ Geolocation failed:', err)
      setIsUploading(false)
      alert('Location access is required to submit a report. Please enable location permissions in your browser and try again.')
      return
    }

    const ext = file.file.name.split('.').pop()
    const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`

    try {
      const { error: uploadError } = await supabase.storage.from('uploads').upload(filePath, file.file)
      if (uploadError) throw uploadError

      // Build metadata row
      const metadata = {
        id: (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2),
        user_id: user.id,
        file_path: filePath,
        description: description.trim(),
        location: location.trim(),
        corruption_type: corruptionType,
        campaign_id: selectedCampaign?.id || null,
        campaign_type: selectedCampaign?.type || null,
        campaign_request_id: submittedProposalId,
        campaign_pending: !!submittedProposalId,
        latitude: coords.latitude,
        longitude: coords.longitude,
        share_x: shareX,
        share_instagram: shareInstagram,
        share_facebook: shareFacebook,
        is_anonymous: !!isAnonymous,
        reporter_name: isAnonymous ? null : reporterName.trim(),
        reporter_contact: isAnonymous ? null : reporterContact.trim(),
        created_at: new Date().toISOString(),
      }

      console.log('💾 Inserting report with coordinates:', {
        latitude: metadata.latitude,
        longitude: metadata.longitude,
        file_path: metadata.file_path
      })

      const { error: insertError } = await supabase.from('uploads').insert([metadata])
      if (insertError) {
        // rollback uploaded file
        await supabase.storage.from('uploads').remove([filePath])
        throw insertError
      }

      console.log('✅ Report uploaded successfully with location data')

      const successMessage = submittedProposalId 
        ? 'Report uploaded successfully under proposed campaign. It will be reviewed by administrators.'
        : 'Report uploaded successfully'

      alert(successMessage)

      // Refresh heatmap data to show new marker
      loadHeatmapData()

      // If user requested sharing, generate a signed url and open share intents
      try {
        if (shareX || shareFacebook || shareInstagram) {
          const { data: signed } = await supabase.storage.from('uploads').createSignedUrl(filePath, 60)
          const url = signed?.signedUrl
          const text = `${description.trim().slice(0, 240)}...` // short summary
          if (shareX && url) {
            const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
            window.open(intent, '_blank')
          }
          if (shareFacebook && url) {
            const intent = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`
            window.open(intent, '_blank')
          }
          if (shareInstagram && url) {
            // Instagram doesn't support prefilled web posting; open Instagram and copy text to clipboard
            try {
              await navigator.clipboard.writeText(`${text}\n\n${url}`)
              alert('Share text copied to clipboard. Open Instagram to paste and post.')
              window.open('https://www.instagram.com/', '_blank')
            } catch (e) {
              // fallback: just open instagram
              window.open('https://www.instagram.com/', '_blank')
            }
          }
        }
      } catch (e) {
        console.warn('Share intent generation failed', e)
      }

      // reset
      setFile(null)
      setDescription('')
      setLocation('')
      setCorruptionType(CorruptionTypes[0])
      setIsAnonymous(true)
      setReporterName('')
      setReporterContact('')
    } catch (err: any) {
      console.error('Upload failed', err)
      alert('Upload failed: ' + (err.message ?? String(err)))
    } finally {
      setIsUploading(false)
    }
  }

  /* ================= CLEANUP ================= */

  useEffect(() => {
    return () => {
      if (file) URL.revokeObjectURL(file.preview)
    }
  }, [file])

  const removeFile = () => {
    if (!file) return
    URL.revokeObjectURL(file.preview)
    setFile(null)
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

  /* ================= CAMPAIGN FETCH + PROPOSAL ================= */

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const { data, error } = await supabase.from('campaigns').select('*').eq('status', 'active')
        if (error) {
          console.error('Failed to load campaigns', error)
          setCampaigns([])
        } else {
          setCampaigns(Array.isArray(data) ? data as any[] : [])
        }
      } catch (e) {
        console.error(e)
      }
    }

    loadCampaigns()
  }, [])

  // Load heatmap data function
  const loadHeatmapData = async () => {
    try {
      const { data, error } = await supabase
        .from('uploads')
        .select('latitude, longitude, campaign_id, corruption_type')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      if (error) {
        console.error('Failed to load heatmap data', error)
        return
      }

      console.log(`🗺️ Loaded ${data.length} reports with location data`)

      // Group by location and count reports
      const locationCounts: { [key: string]: { lat: number; lng: number; count: number; campaigns: Set<string>; types: Set<string> } } = {}

      data.forEach((upload: any) => {
        const key = `${upload.latitude.toFixed(4)},${upload.longitude.toFixed(4)}`
        if (!locationCounts[key]) {
          locationCounts[key] = {
            lat: upload.latitude,
            lng: upload.longitude,
            count: 0,
            campaigns: new Set(),
            types: new Set()
          }
        }
        locationCounts[key].count++
        if (upload.campaign_id) locationCounts[key].campaigns.add(upload.campaign_id)
        if (upload.corruption_type) locationCounts[key].types.add(upload.corruption_type)
      })

      const points = Object.values(locationCounts).map((loc) => ({
        lat: loc.lat,
        lng: loc.lng,
        intensity: loc.count,
        campaign: Array.from(loc.campaigns).join(', '),
        corruptionType: Array.from(loc.types).join(', ')
      }))

      console.log(`📍 Displaying ${points.length} unique locations on map`)
      setHeatmapPoints(points)
    } catch (e) {
      console.error('Failed to load heatmap data', e)
    }
  }

  // Load heatmap data on mount
  useEffect(() => {
    loadHeatmapData()
  }, [])

  const [proposal, setProposal] = useState({ title: '', location: '', description: '', impact_summary: '' })

  const submitProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    const words = proposal.description.trim().split(/\s+/).filter(Boolean).length
    if (words < 250) {
      alert('Description must be at least 250 words. Current: ' + words)
      return
    }
    if (!user) {
      alert('You must be logged in to submit a proposal')
      return
    }

    const id = (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2)
    const payload = {
      id,
      user_id: user.id,
      title: proposal.title.trim(),
      description: proposal.description.trim(),
      location: proposal.location.trim(),
      impact_summary: proposal.impact_summary.trim(),
      created_at: new Date().toISOString(),
      status: 'pending'
    }

    setIsUploading(true)
    try {
      const { error } = await supabase.from('campaign_requests').insert([payload])
      if (error) throw error
      setSubmittedProposalId(id)
      // Don't reset proposal form or go back - user can now submit their report
    } catch (err: any) {
      console.error('Failed to submit proposal', err)
      alert('Failed to submit proposal: ' + (err.message ?? String(err)))
    } finally {
      setIsUploading(false)
    }
  }

  const handleCampaignSelect = (campaign: any) => {
    setSelectedCampaign(campaign)
    setCurrentView('reporting')
  }

  const handleBackToCampaigns = () => {
    setCurrentView('campaigns')
    setSelectedCampaign(null)
    setIsProposalMode(false)
    setSubmittedProposalId(null)
    setProposal({ title: '', location: '', description: '', impact_summary: '' })
    // Reset form
    setFile(null)
    setDescription('')
    setLocation('')
    setCorruptionType(CorruptionTypes[0])
    setIsAnonymous(true)
    setReporterName('')
    setReporterContact('')
    setShareX(false)
    setShareInstagram(false)
    setShareFacebook(false)
  }

  const handleJoinReporterClick = async () => {
    if (!user) return;
    
    setIsCheckingReporter(true);
    
    try {
      const { data: reporter, error } = await supabase
        .from('reporters')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking reporter status:', error);
        setIsCheckingReporter(false);
        return;
      }

      if (reporter) {
        // User already a reporter → redirect to dashboard
        navigate('/reporter');
      } else {
        // Not a reporter → navigate to join form
        navigate('/join-reporter');
      }
    } catch (err) {
      console.error('Failed to check reporter status:', err);
    } finally {
      setIsCheckingReporter(false);
    }
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-black/20 backdrop-blur-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">
          <span className="text-accent">CORRUPT</span>X
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleJoinReporterClick}
            disabled={isCheckingReporter}
            className="px-4 py-2 rounded-lg bg-accent text-white font-semibold hover:bg-accent/80 transition-colors shadow-lg shadow-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCheckingReporter ? 'Checking...' : 'Join as Reporter'}
          </button>
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
        {currentView === 'campaigns' ? (
          // Campaign Discovery View
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Report Corruption</h2>
              <p className="text-gray-400 mb-6">
                Choose a campaign to understand the context and start your corruption report.
                Your evidence will contribute to exposing and combating corruption in targeted areas.
              </p>

              {/* Corruption Heatmap */}
              <div className="bg-secondary p-6 rounded-xl mb-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-accent" />
                  Corruption Hotspots
                </h3>
                <div className="h-64 rounded-lg overflow-hidden">
                  <HeatmapView
                    points={heatmapPoints}
                    height="100%"
                    showControls={false}
                  />
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  View corruption intensity across locations. Areas with more reports appear more intense.
                </p>
              </div>
            </div>

            {/* Search Bar for Campaigns */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search campaigns by title or location..."
                value={campaignSearchTerm}
                onChange={(e) => setCampaignSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-secondary border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-accent focus:outline-none transition-colors"
              />
            </div>

            {/* Campaign Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns
                .filter((campaign) => {
                  const searchLower = campaignSearchTerm.toLowerCase();
                  return (
                    campaign.title?.toLowerCase().includes(searchLower) ||
                    campaign.location?.toLowerCase().includes(searchLower) ||
                    campaign.description?.toLowerCase().includes(searchLower)
                  );
                })
                .map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onClick={handleCampaignSelect}
                />
              ))}
              
              {/* Special option for proposing new campaign */}
              <div 
                className="bg-secondary p-6 rounded-xl border-2 border-dashed border-gray-600 hover:border-accent cursor-pointer transition-colors"
                onClick={() => {
                  setIsProposalMode(true)
                  setCurrentView('reporting')
                }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">➕</div>
                  <h3 className="text-xl font-semibold text-white mb-2">I don't see a relevant campaign</h3>
                  <p className="text-gray-400 text-sm">
                    Propose a new campaign and submit your report
                  </p>
                </div>
              </div>
            </div>

            {campaigns.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No active campaigns available at the moment.</p>
                <p className="text-gray-500 text-sm mt-2">
                  You can still report corruption by proposing a new campaign.
                </p>
              </div>
            )}
          </div>
        ) : (
          // Split View: Campaign Context + Reporting Form
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleBackToCampaigns}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Campaigns
              </button>
              <div className="text-gray-500">|</div>
              <h2 className="text-xl font-semibold text-white">
                {isProposalMode ? 'Proposing New Campaign & Reporting' : `Reporting under: ${selectedCampaign?.title}`}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side: Campaign Context or Proposal Form */}
              <div className="space-y-6">
                {isProposalMode ? (
                  <div className="bg-secondary p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-white mb-6">Campaign Proposal</h3>
                    <p className="text-gray-400 mb-4">
                      To report corruption in an area not covered by existing campaigns, you must first propose a new campaign. 
                      This ensures structured and responsible reporting.
                    </p>
                    
                    {submittedProposalId ? (
                      <div className="text-center py-8">
                        <div className="text-green-400 text-2xl mb-4">✅</div>
                        <h4 className="text-white font-semibold mb-2">Proposal Submitted Successfully</h4>
                        <p className="text-gray-400 text-sm">
                          Your report will be submitted under the proposed campaign and reviewed by administrators.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={submitProposal} className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Proposed Campaign Title *</label>
                          <input
                            required
                            placeholder="e.g., Corruption in City Government Procurement"
                            value={proposal.title}
                            onChange={(e) => setProposal({ ...proposal, title: e.target.value })}
                            className="w-full p-3 bg-gray-800 border border-gray-600 rounded"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Location (City / Area / Region) *</label>
                          <input
                            required
                            placeholder="e.g., New York City, Manhattan District"
                            value={proposal.location}
                            onChange={(e) => setProposal({ ...proposal, location: e.target.value })}
                            className="w-full p-3 bg-gray-800 border border-gray-600 rounded"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">
                            Detailed Description (Minimum 250 words) *
                          </label>
                          <textarea
                            required
                            placeholder="Explain the nature of corruption, why existing campaigns don't cover it, how it affects people, why a new campaign should be initiated, expected impact, number of people affected, severity/scale..."
                            value={proposal.description}
                            onChange={(e) => setProposal({ ...proposal, description: e.target.value })}
                            className="w-full p-3 bg-gray-800 border border-gray-600 rounded h-40"
                          />
                          <p className="text-gray-500 text-xs mt-1">
                            Word count: {proposal.description.trim().split(/\s+/).filter(Boolean).length} / 250 minimum
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Expected Impact Summary *</label>
                          <textarea
                            required
                            placeholder="Brief summary of the impact this campaign could have"
                            value={proposal.impact_summary}
                            onChange={(e) => setProposal({ ...proposal, impact_summary: e.target.value })}
                            className="w-full p-3 bg-gray-800 border border-gray-600 rounded h-24"
                          />
                        </div>
                        
                        <button
                          type="submit"
                          disabled={isUploading}
                          className="w-full bg-accent py-3 rounded text-white font-semibold hover:bg-accent/80 disabled:opacity-50"
                        >
                          {isUploading ? 'Submitting Proposal...' : 'Submit Proposal & Continue to Report'}
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <CampaignIntroPanel campaign={selectedCampaign} />
                )}
              </div>

              {/* Right Side: Reporting Form */}
              <div className="space-y-6">
                <div className="bg-secondary p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-white mb-6">
                    {submittedProposalId ? 'Submit Your Evidence' : 'Submit Corruption Evidence'}
                  </h3>

                  {submittedProposalId && (
                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded mb-6">
                      <p className="text-blue-300 text-sm">
                        Your report will be submitted under the proposed campaign and will be reviewed by administrators before being made public.
                      </p>
                    </div>
                  )}

                  {/* Upload Type Selection */}
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

                  {/* File Upload */}
                  {!file ? (
                    <div
                      className={`border-2 border-dashed p-8 rounded text-center mb-6 ${
                        isDragging ? 'border-accent' : 'border-gray-600'
                      }`}
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        hidden
                        id="file-upload"
                        accept={uploadType === 'video' ? '.mp4,.webm,.mov' : '.jpg,.jpeg,.png'}
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer text-white">
                        <UploadCloud className="mx-auto mb-2 w-8 h-8" />
                        Click or drop a file
                      </label>
                    </div>
                  ) : (
                    <div className="bg-gray-800 p-4 rounded mb-6">
                      {file.file.type.startsWith('image') ? (
                        <img src={file.preview} className="rounded mb-2 max-h-48 mx-auto" />
                      ) : (
                        <video src={file.preview} controls className="rounded mb-2 max-h-48 mx-auto" />
                      )}
                      <p className="text-white truncate text-center">{file.file.name}</p>
                      <p className="text-gray-400 text-sm text-center">{formatFileSize(file.file.size)}</p>
                      <div className="flex justify-center mt-2">
                        <button onClick={removeFile} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">
                          Remove
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Location</label>
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded"
                        placeholder="City, region, or specific location"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Corruption Type</label>
                      <select
                        value={corruptionType}
                        onChange={(e) => setCorruptionType(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded"
                      >
                        {CorruptionTypes.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded h-24"
                        placeholder="Describe what you witnessed or experienced..."
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => {
                            setIsAnonymous(e.target.checked)
                            if (e.target.checked) {
                              setReporterName('')
                              setReporterContact('')
                            }
                          }}
                        />
                        <span className="text-sm text-gray-400">Submit anonymously</span>
                      </label>
                    </div>

                    {!isAnonymous && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          placeholder="Full name"
                          value={reporterName}
                          onChange={(e) => setReporterName(e.target.value)}
                          className="p-3 bg-gray-800 border border-gray-600 rounded"
                        />
                        <input
                          placeholder="Contact (email or phone)"
                          value={reporterContact}
                          onChange={(e) => setReporterContact(e.target.value)}
                          className="p-3 bg-gray-800 border border-gray-600 rounded"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Optional: Share on social media</label>
                      <div className="flex flex-wrap gap-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={shareX}
                            onChange={(e) => setShareX(e.target.checked)}
                          />
                          <span className="text-sm">X (Twitter)</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={shareInstagram}
                            onChange={(e) => setShareInstagram(e.target.checked)}
                          />
                          <span className="text-sm">Instagram</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={shareFacebook}
                            onChange={(e) => setShareFacebook(e.target.checked)}
                          />
                          <span className="text-sm">Facebook</span>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={handleUpload}
                      disabled={isUploading || !file}
                      className="w-full bg-accent py-3 rounded text-white font-semibold hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? 'Submitting Report...' : 'Submit Corruption Report'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default DashboardPage
