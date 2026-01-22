import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import StatCard from '../components/StatCard'
import HeatmapView from '../components/HeatmapView'

const AdminPage = () => {
  const [userCount, setUserCount] = useState<number | null>(null)
  const [uploadCount, setUploadCount] = useState<number | null>(null)
  const [recent, setRecent] = useState<any[]>([])
  const [heatmapPoints, setHeatmapPoints] = useState<any[]>([])
  const [campaignFilter, setCampaignFilter] = useState<string>('')
  const [corruptionTypeFilter, setCorruptionTypeFilter] = useState<string>('')
  const [dateFilter, setDateFilter] = useState<string>('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data: profiles } = await supabase.from('profiles').select('id')
        setUserCount(Array.isArray(profiles) ? profiles.length : 0)

        const { data: rootList } = await supabase.storage.from('uploads').list('')
        const folders = Array.isArray(rootList)
          ? rootList.filter((i: any) => !i.name.includes('.')).map((f: any) => f.name)
          : []

        let files: any[] = []
        for (const folder of folders) {
          const { data: inner } = await supabase.storage.from('uploads').list(folder)
          if (Array.isArray(inner)) {
            const mapped = inner.map((it: any) => ({ ...it, path: `${folder}/${it.name}` }))
            files = files.concat(mapped)
          }
        }

        setUploadCount(files.length)

        const sorted = files
          .slice()
          .sort((a, b) => {
            const ta = new Date(a.updated_at ?? a.created_at ?? 0).getTime()
            const tb = new Date(b.updated_at ?? b.created_at ?? 0).getTime()
            return tb - ta
          })
          .slice(0, 10)

        setRecent(sorted)

        // Load heatmap data
        await loadHeatmapData()
      } catch (err) {
        console.error(err)
        setUserCount(0)
        setUploadCount(0)
      }
    }

    load()
  }, [])

  const loadHeatmapData = async () => {
    try {
      let query = supabase
        .from('uploads')
        .select('latitude, longitude, campaign_id, corruption_type, created_at, campaigns(title)')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      // Apply filters
      if (campaignFilter) {
        query = query.eq('campaign_id', campaignFilter)
      }
      if (corruptionTypeFilter) {
        query = query.eq('corruption_type', corruptionTypeFilter)
      }
      if (dateFilter) {
        const date = new Date(dateFilter)
        const startOfDay = new Date(date.setHours(0, 0, 0, 0))
        const endOfDay = new Date(date.setHours(23, 59, 59, 999))
        query = query.gte('created_at', startOfDay.toISOString()).lte('created_at', endOfDay.toISOString())
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to load heatmap data', error)
        return
      }

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
        if (upload.campaign_id) locationCounts[key].campaigns.add(upload.campaigns?.title || upload.campaign_id)
        if (upload.corruption_type) locationCounts[key].types.add(upload.corruption_type)
      })

      const points = Object.values(locationCounts).map((loc) => ({
        lat: loc.lat,
        lng: loc.lng,
        intensity: loc.count,
        campaign: Array.from(loc.campaigns).join(', '),
        corruptionType: Array.from(loc.types).join(', ')
      }))

      setHeatmapPoints(points)
    } catch (e) {
      console.error('Failed to load heatmap data', e)
    }
  }

  // Reload heatmap when filters change
  useEffect(() => {
    loadHeatmapData()
  }, [campaignFilter, corruptionTypeFilter, dateFilter])

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard title="Total Users" value={userCount ?? '—'} />
          <StatCard title="Total Uploads" value={uploadCount ?? '—'} />
          <div className="bg-secondary p-4 rounded">
            <h2 className="text-sm text-gray-400">Recent Uploads</h2>
            <ul>
              {recent.map((r, i) => (
                <li key={i} className="text-sm text-white truncate">{r.path ?? r.name}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Heatmap Section */}
        <div className="bg-secondary p-6 rounded-xl mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Corruption Heatmap</h2>
            <Link
              to="/admin/heatmap"
              className="bg-accent px-4 py-2 rounded text-white hover:bg-accent/80 transition-colors"
            >
              View Full Heatmap
            </Link>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Campaign</label>
              <select
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
              >
                <option value="">All Campaigns</option>
                {/* We'll load campaigns dynamically in a real implementation */}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Corruption Type</label>
              <select
                value={corruptionTypeFilter}
                onChange={(e) => setCorruptionTypeFilter(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
              >
                <option value="">All Types</option>
                <option value="Bribery">Bribery</option>
                <option value="Fraud">Fraud</option>
                <option value="Abuse of Power">Abuse of Power</option>
                <option value="Embezzlement">Embezzlement</option>
                <option value="Blackmail">Blackmail</option>
                <option value="Nepotism">Nepotism</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
              />
            </div>
          </div>

          <div className="h-96 rounded-lg overflow-hidden">
            <HeatmapView
              points={heatmapPoints}
              height="100%"
              showControls={true}
              onPointClick={(point) => {
                alert(`Location: ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}\nReports: ${point.intensity}\nCampaigns: ${point.campaign}\nTypes: ${point.corruptionType}`)
              }}
            />
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span>Low (1-2 reports)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-400 rounded"></div>
              <span>Medium (3-5 reports)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>High (6+ reports)</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminPage
