import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import AdminLayout from '../components/AdminLayout'

type StoredFile = {
  name: string
  path: string
  mime?: string
  updated_at?: string
  url?: string
  owner?: string
  description?: string
  location?: string
  corruption_type?: string
  campaign_id?: string
  campaign_type?: string
  campaign_request_id?: string
  campaign_pending?: boolean
  is_anonymous?: boolean
  reporter_name?: string
  reporter_contact?: string
  id?: string
}

const AdminUploadsPage = () => {
  const [files, setFiles] = useState<StoredFile[]>([])
  const [loading, setLoading] = useState(true)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [filterCampaign, setFilterCampaign] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState<string | null>(null)
  const [dateTo, setDateTo] = useState<string | null>(null)
  const [anonymousFilter, setAnonymousFilter] = useState<'any' | 'anonymous' | 'identified'>('any')
  const [pendingFilter, setPendingFilter] = useState<'any' | 'pending' | 'approved'>('any')

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false })
        setCampaigns(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error('Failed to load campaigns', e)
      }
    }

    loadCampaigns()
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        let query = supabase.from('uploads').select('*')
        if (filterCampaign) query = query.eq('campaign_id', filterCampaign)
        if (filterType) query = query.eq('corruption_type', filterType)
        if (anonymousFilter === 'anonymous') query = query.eq('is_anonymous', true)
        if (anonymousFilter === 'identified') query = query.eq('is_anonymous', false)
        if (pendingFilter === 'pending') query = query.eq('campaign_pending', true)
        if (pendingFilter === 'approved') query = query.eq('campaign_pending', false)
        if (dateFrom) query = query.gte('created_at', dateFrom)
        if (dateTo) query = query.lte('created_at', dateTo)

        const { data, error } = await query.order('created_at', { ascending: false })
        if (error) {
          console.error('Failed to fetch uploads metadata', error)
          setFiles([])
          return
        }

        const rows = Array.isArray(data) ? data : []

        const withUrls = await Promise.all(rows.map(async (r: any) => {
          let url: string | undefined = undefined
          try {
            const { data: signed } = await supabase.storage.from('uploads').createSignedUrl(r.file_path, 60)
            url = signed?.signedUrl
          } catch (e) {
            // ignore
          }
          return {
            name: r.file_path.split('/').pop(),
            path: r.file_path,
            updated_at: r.created_at,
            url,
            owner: r.user_id,
            description: r.description,
            location: r.location,
            corruption_type: r.corruption_type,
            campaign_id: r.campaign_id,
            campaign_type: r.campaign_type,
            campaign_request_id: r.campaign_request_id,
            campaign_pending: r.campaign_pending,
            is_anonymous: r.is_anonymous,
            reporter_name: r.reporter_name,
            reporter_contact: r.reporter_contact,
            id: r.id,
          }
        }))

        setFiles(withUrls)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [filterCampaign, filterType, dateFrom, dateTo, anonymousFilter, pendingFilter])

  const handleDelete = async (path: string) => {
    if (!confirm('Delete this file permanently?')) return

    // optimistic UI
    setFiles((prev) => prev.filter((f) => f.path !== path))

    try {
      const { error } = await supabase.storage.from('uploads').remove([path])
      if (error) console.error('Storage delete error', error)

      // attempt to remove metadata row from a potential uploads table
      try {
        await supabase.from('uploads').delete().eq('path', path)
      } catch (e) {
        // ignore if table doesn't exist
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">Loading uploads…</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-3 items-center">
          <select value={filterCampaign ?? ''} onChange={(e) => setFilterCampaign(e.target.value || null)} className="p-2 bg-gray-800">
            <option value="">All campaigns</option>
            {campaigns.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>

          <select value={filterType ?? ''} onChange={(e) => setFilterType(e.target.value || null)} className="p-2 bg-gray-800">
            <option value="">All types</option>
            <option>Bribery</option>
            <option>Fraud</option>
            <option>Abuse of Power</option>
            <option>Embezzlement</option>
            <option>Blackmail</option>
            <option>Nepotism</option>
            <option>Other</option>
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input type="radio" checked={pendingFilter === 'any'} onChange={() => setPendingFilter('any')} /> Any Status
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" checked={pendingFilter === 'pending'} onChange={() => setPendingFilter('pending')} /> Pending Review
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" checked={pendingFilter === 'approved'} onChange={() => setPendingFilter('approved')} /> Approved
          </label>

          <input type="date" value={dateFrom ?? ''} onChange={(e) => setDateFrom(e.target.value || null)} className="p-2 bg-gray-800" />
          <input type="date" value={dateTo ?? ''} onChange={(e) => setDateTo(e.target.value || null)} className="p-2 bg-gray-800" />

          <button onClick={() => { setFilterCampaign(null); setFilterType(null); setAnonymousFilter('any'); setPendingFilter('any'); setDateFrom(null); setDateTo(null) }} className="px-3 py-1 bg-gray-600 rounded">Clear</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {files.map((f) => (
            <div key={f.path} className="bg-secondary p-4 rounded">
            <div className="mb-2">
              {f.url && f.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.url} alt={f.name} className="rounded w-full h-40 object-cover" />
              ) : f.url ? (
                <video src={f.url} controls className="rounded w-full h-40 object-cover" />
              ) : (
                <div className="h-40 flex items-center justify-center bg-gray-800">No preview</div>
              )}
            </div>

            <p className="text-white truncate">{f.name}</p>
            <p className="text-gray-400 text-sm">By: {f.owner}</p>
            <p className="text-gray-400 text-sm">Path: {f.path}</p>
            <p className="text-gray-400 text-sm">Type: {f.corruption_type}</p>
            <p className="text-gray-400 text-sm">Location: {f.location}</p>
            <p className="text-gray-400 text-sm">Description: {f.description}</p>
            <p className="text-gray-400 text-sm">Reporter: {f.is_anonymous ? 'Anonymous' : `${f.reporter_name} (${f.reporter_contact})`}</p>
            {f.campaign_pending && <p className="text-yellow-400 text-sm font-semibold">⚠️ Pending Campaign Approval</p>}
            <div className="mt-2 flex gap-2">
              <button onClick={() => handleDelete(f.path)} className="bg-red-600 px-3 py-1 rounded text-white">Delete</button>
              <a href={f.url} target="_blank" rel="noreferrer" className="bg-gray-600 px-3 py-1 rounded text-white">Open</a>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}

export default AdminUploadsPage
