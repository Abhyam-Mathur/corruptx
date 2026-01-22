import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { supabase } from '../supabaseClient'

type Campaign = {
  id: string
  title: string
  description?: string
  type?: string
  status?: string
  start_date?: string
  end_date?: string
  created_at?: string
}

const CAMPAIGN_TYPES = [
  'Awareness',
  'Promotion',
  'Fundraising',
  'Recruitment',
  'Product Launch',
]

const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: CAMPAIGN_TYPES[0],
    status: 'active',
    start_date: '',
    end_date: '',
  })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Failed to load campaigns', error)
          setCampaigns([])
        } else {
          setCampaigns(Array.isArray(data) ? (data as Campaign[]) : [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const id = (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2)
    const payload = {
      id,
      title: form.title,
      description: form.description,
      type: form.type,
      status: form.status,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      created_at: new Date().toISOString(),
    }

    // optimistic UI
    setCampaigns((prev) => [payload as Campaign, ...prev])
    setShowAdd(false)

    const { error } = await supabase.from('campaigns').insert([payload])
    if (error) {
      console.error('Failed to insert campaign', error)
      // rollback
      setCampaigns((prev) => prev.filter((c) => c.id !== id))
      alert('Failed to create campaign')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete campaign?')) return
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
    const { error } = await supabase.from('campaigns').delete().eq('id', id)
    if (error) {
      console.error('Failed to delete', error)
      alert('Delete failed')
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div>Loading campaigns…</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Campaigns</h2>
          <button onClick={() => setShowAdd(true)} className="bg-accent px-4 py-2 rounded">Add Campaign</button>
        </div>

        <div className="grid gap-4">
          {campaigns.map((c) => (
            <div key={c.id} className="bg-secondary p-4 rounded flex justify-between items-start">
              <div>
                <h3 className="font-bold">{c.title}</h3>
                <p className="text-sm text-gray-400">{c.type} • {c.status}</p>
                <p className="text-sm text-gray-500 mt-2">{c.description}</p>
                <p className="text-xs text-gray-400 mt-2">{c.start_date} — {c.end_date}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button className="bg-gray-600 px-3 py-1 rounded text-white">View</button>
                <button className="bg-yellow-600 px-3 py-1 rounded text-white">Edit</button>
                <button onClick={() => handleDelete(c.id)} className="bg-red-600 px-3 py-1 rounded text-white">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {showAdd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <form onSubmit={handleAdd} className="bg-white p-6 rounded w-full max-w-md text-black">
              <h3 className="text-lg font-bold mb-4">Add Campaign</h3>
              <label className="block mb-2">Title</label>
              <input required className="w-full p-2 mb-3" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

              <label className="block mb-2">Description</label>
              <textarea className="w-full p-2 mb-3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

              <label className="block mb-2">Type</label>
              <select className="w-full p-2 mb-3" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {CAMPAIGN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>

              <label className="block mb-2">Status</label>
              <select className="w-full p-2 mb-3" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">active</option>
                <option value="paused">paused</option>
                <option value="completed">completed</option>
              </select>

              <label className="block mb-2">Start Date</label>
              <input type="date" className="w-full p-2 mb-3" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />

              <label className="block mb-2">End Date</label>
              <input type="date" className="w-full p-2 mb-3" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />

              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1">Cancel</button>
                <button type="submit" className="bg-accent px-4 py-1 rounded text-white">Save</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminCampaigns
