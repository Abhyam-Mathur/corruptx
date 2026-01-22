import { Play, Info } from 'lucide-react'

interface Campaign {
  id: string
  title: string
  description: string
  type: string
  status?: string
}

interface CampaignIntroPanelProps {
  campaign: Campaign
}

const CampaignIntroPanel = ({ campaign }: CampaignIntroPanelProps) => {
  return (
    <div className="bg-secondary p-6 rounded-xl h-full">
      <h2 className="text-2xl font-bold text-white mb-6">{campaign.title}</h2>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-3">Campaign Description</h3>
        <p className="text-gray-400 leading-relaxed">
          {campaign.description}
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <Play className="w-5 h-5 text-accent" />
          Campaign Introduction Video
        </h3>
        <div className="bg-gray-800 rounded-lg p-8 text-center border-2 border-dashed border-gray-600">
          <Play className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">
            Video will be added here later
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Campaign introduction and context
          </p>
        </div>
      </div>

      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-accent mt-0.5" />
          <div>
            <h4 className="text-accent font-semibold mb-1">Reporting Context</h4>
            <p className="text-gray-300 text-sm">
              You are reporting corruption under the <strong className="text-white">{campaign.title}</strong> campaign.
              Your evidence will contribute to exposing and combating corruption in this specific area.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CampaignIntroPanel