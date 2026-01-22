import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { supabase } from '../supabaseClient'

type Request = {
  id: string
  user_id: string
  title: string
  description: string
  location?: string
  impact_summary?: string
  created_at?: string
  status?: string
}

const AdminCampaignRequests = () => {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Request | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase.from('campaign_requests').select('*').order('created_at', { ascending: false })
        if (error) {
          console.error('Failed to load requests', error)
          setRequests([])
        } else {
          setRequests(Array.isArray(data) ? data as Request[] : [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const approve = async (r: Request) => {
    if (!confirm('Approve this campaign request and create campaign?')) return
    const campaignId = (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2)
    setLoading(true)
    try {
      // create campaign
      const campaign = {
        id: campaignId,
        title: r.title,
        description: r.description,
        type: 'Awareness',
        status: 'active',
        created_at: new Date().toISOString(),
      }
      const { error: cErr } = await supabase.from('campaigns').insert([campaign])
      if (cErr) throw cErr

      // update request status
      const { error: uErr } = await supabase.from('campaign_requests').update({ status: 'approved' }).eq('id', r.id)
      if (uErr) throw uErr

      // update associated uploads to link to the new campaign and mark as not pending
      const { error: uploadErr } = await supabase
        .from('uploads')
        .update({ 
          campaign_id: campaignId, 
          campaign_type: 'Awareness',
          campaign_pending: false 
        })
        .eq('campaign_request_id', r.id)
      if (uploadErr) {
        console.warn('Failed to update associated uploads:', uploadErr)
        // Don't fail the whole operation for this
      }

      setRequests((prev) => prev.map((p) => (p.id === r.id ? { ...p, status: 'approved' } : p)))
      alert('Campaign approved and created. Associated reports have been linked to the new campaign.')
    } catch (e: any) {
      console.error('Approve failed', e)
      alert('Failed to approve: ' + (e.message ?? String(e)))
    } finally {
      setLoading(false)
    }
  }

  const reject = async (r: Request) => {
    if (!confirm('Reject this campaign request? This will also delete associated evidence uploads.')) return
    try {
      // First, get associated uploads to delete their files from storage
      const { data: uploads, error: fetchErr } = await supabase
        .from('uploads')
        .select('file_path')
        .eq('campaign_request_id', r.id)
      
      if (fetchErr) {
        console.warn('Failed to fetch associated uploads:', fetchErr)
      } else if (uploads && uploads.length > 0) {
        // Delete files from storage
        const filePaths = uploads.map(u => u.file_path)
        const { error: storageErr } = await supabase.storage.from('uploads').remove(filePaths)
        if (storageErr) {
          console.warn('Failed to delete upload files from storage:', storageErr)
        }
        
        // Delete upload records
        const { error: deleteErr } = await supabase
          .from('uploads')
          .delete()
          .eq('campaign_request_id', r.id)
        if (deleteErr) {
          console.warn('Failed to delete upload records:', deleteErr)
        }
      }

      // Update request status
      const { error } = await supabase.from('campaign_requests').update({ status: 'rejected' }).eq('id', r.id)
      if (error) throw error
      
      setRequests((prev) => prev.map((p) => (p.id === r.id ? { ...p, status: 'rejected' } : p)))
      alert('Campaign request rejected and associated uploads deleted')
    } catch (e) {
      console.error('Reject failed', e)
      alert('Failed to reject')
    }
  }

  if (loading) return (
    <AdminLayout>
      <div>Loading requests…</div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Campaign Requests</h2>
        <div className="grid gap-3">
          {requests.map((r) => (
            <div key={r.id} className="bg-secondary p-4 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{r.title}</h3>
                  <p className="text-sm text-gray-400">{r.location} • {r.created_at}</p>
                  <p className="text-sm mt-2 text-gray-500">{r.description.slice(0, 200)}{r.description.length > 200 ? '...' : ''}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setSelected(r)} className="bg-gray-600 px-3 py-1 rounded">View</button>
                  <button onClick={() => approve(r)} className="bg-accent px-3 py-1 rounded text-white">Approve</button>
                  <button onClick={() => reject(r)} className="bg-red-600 px-3 py-1 rounded text-white">Reject</button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Status: {r.status ?? 'pending'}</p>
            </div>
          ))}
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white text-black p-6 rounded w-full max-w-2xl">
              <h3 className="text-lg font-bold mb-2">{selected.title}</h3>
              <p className="text-sm text-gray-600 mb-4">Location: {selected.location} • Submitted: {selected.created_at}</p>
              <div className="prose max-h-80 overflow-auto mb-4">{selected.description}</div>
              <div className="text-sm text-gray-700 mb-4">Impact summary: {selected.impact_summary}</div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setSelected(null)} className="px-3 py-1">Close</button>
                <button onClick={() => { approve(selected); setSelected(null) }} className="bg-accent px-3 py-1 rounded text-white">Approve</button>
                <button onClick={() => { reject(selected); setSelected(null) }} className="bg-red-600 px-3 py-1 rounded text-white">Reject</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminCampaignRequests
