import React from 'react'

const StatCard = ({ title, value, icon }: { title: string; value: React.ReactNode; icon?: React.ReactNode }) => {
  return (
    <div className="bg-secondary/50 backdrop-blur-sm p-6 rounded-xl card-hover border border-white/10 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className="text-accent text-2xl ml-4 opacity-80">
          {icon}
        </div>
      </div>
      <div className="mt-4 h-1 bg-gradient-to-r from-accent/20 to-accent/5 rounded-full">
        <div className="h-full bg-accent rounded-full animate-pulse" style={{ width: '60%' }}></div>
      </div>
    </div>
  )
}

export default StatCard
