import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import AdminLayout from '../components/AdminLayout'
import HeatmapView from '../components/HeatmapView'

const AdminHeatmapPage = () => {
  const [heatmapPoints, setHeatmapPoints] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [campaignFilter, setCampaignFilter] = useState<string>('')
  const [corruptionTypeFilter, setCorruptionTypeFilter] = useState<string>('')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const { data, error } = await supabase.from('campaigns').select('*').eq('status', 'active')
        if (error) {
          console.error('Failed to load campaigns', error)
        } else {
          setCampaigns(Array.isArray(data) ? data : [])
        }
      } catch (e) {
        console.error(e)
      }
    }

    loadCampaigns()
    loadHeatmapData()
  }, [])

  const loadHeatmapData = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('uploads')
        .select('id, latitude, longitude, campaign_id, corruption_type, created_at')
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
        console.error('❌ Admin Heatmap - Failed to load data:', error)
        return
      }

      console.log(`🗺️ Admin Heatmap - Loaded ${data?.length || 0} reports with location data`)
      console.log('📊 Sample data:', data?.slice(0, 3))

      if (!data || data.length === 0) {
        console.log('⚠️ No reports with location data found')
        setHeatmapPoints([])
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

      console.log(`📍 Admin Heatmap - Displaying ${points.length} unique locations on map`)
      console.log('Sample points:', points.slice(0, 3))
      setHeatmapPoints(points)
    } catch (e) {
      console.error('Failed to load heatmap data', e)
    } finally {
      setLoading(false)
    }
  }

  // Reload heatmap when filters change
  useEffect(() => {
    loadHeatmapData()
  }, [campaignFilter, corruptionTypeFilter, dateFilter])

  const clearFilters = () => {
    setCampaignFilter('')
    setCorruptionTypeFilter('')
    setDateFilter('')
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Corruption Heatmap</h1>
          <p className="text-gray-400">
            Visualize corruption reports geographically. Use filters to focus on specific campaigns, corruption types, or time periods.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-secondary p-6 rounded-xl mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Filters</h2>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Campaign</label>
              <select
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded"
              >
                <option value="">All Campaigns</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Corruption Type</label>
              <select
                value={corruptionTypeFilter}
                onChange={(e) => setCorruptionTypeFilter(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded"
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
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded"
              />
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-secondary p-6 rounded-xl">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white mb-2">Corruption Intensity Map</h2>
            <p className="text-gray-400 text-sm">
              Click on any hotspot to see detailed information about reports in that area.
            </p>
          </div>

          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-gray-400">Loading heatmap...</div>
            </div>
          ) : (
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
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <div>
                <div className="text-white font-medium">Low Intensity</div>
                <div className="text-gray-400 text-sm">1-2 reports</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-orange-400 rounded"></div>
              <div>
                <div className="text-white font-medium">Medium Intensity</div>
                <div className="text-gray-400 text-sm">3-5 reports</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <div>
                <div className="text-white font-medium">High Intensity</div>
                <div className="text-gray-400 text-sm">6+ reports</div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white font-medium mb-2">Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Total Hotspots:</span>
                <span className="text-white ml-2">{heatmapPoints.length}</span>
              </div>
              <div>
                <span className="text-gray-400">Total Reports:</span>
                <span className="text-white ml-2">{heatmapPoints.reduce((sum, p) => sum + p.intensity, 0)}</span>
              </div>
              <div>
                <span className="text-gray-400">Avg Reports/Hotspot:</span>
                <span className="text-white ml-2">
                  {heatmapPoints.length > 0
                    ? (heatmapPoints.reduce((sum, p) => sum + p.intensity, 0) / heatmapPoints.length).toFixed(1)
                    : '0'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminHeatmapPage