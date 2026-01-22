import { Play, Tag } from 'lucide-react'

interface Campaign {
  id: string
  title: string
  description: string
  type: string
  status?: string
}

interface CampaignCardProps {
  campaign: Campaign
  onClick: (campaign: Campaign) => void
}

const CampaignCard = ({ campaign, onClick }: CampaignCardProps) => {
  return (
    <div
      onClick={() => onClick(campaign)}
      className="bg-secondary p-6 rounded-xl cursor-pointer hover:bg-gray-700 transition-all duration-200 hover:scale-105 hover:shadow-lg border border-gray-600 hover:border-accent"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold text-white">{campaign.title}</h3>
        <div className="flex items-center gap-1 bg-accent/20 px-2 py-1 rounded-full">
          <Tag className="w-3 h-3 text-accent" />
          <span className="text-xs text-accent font-medium">{campaign.type}</span>
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
        {campaign.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-accent">
          <Play className="w-4 h-4" />
          <span className="text-sm font-medium">View & Report</span>
        </div>

        <div className="text-xs text-gray-400">
          Click to start reporting
        </div>
      </div>
    </div>
  )
}

export default CampaignCard