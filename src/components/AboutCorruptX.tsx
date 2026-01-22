import React from 'react';

const AboutCorruptX: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="card-hover p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            Know About CorruptX
          </h2>
          <div className="h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent mb-6"></div>
        </div>

        <div className="space-y-6">
          <p className="text-gray-300 leading-relaxed text-sm">
            CorruptX is a citizen-driven platform designed to empower individuals to report corruption responsibly and securely.
          </p>

          <p className="text-gray-300 leading-relaxed text-sm">
            The platform enables people to submit evidence in the public interest while protecting anonymity, promoting transparency, and organizing reports through focused campaigns.
          </p>

          <p className="text-gray-300 leading-relaxed text-sm">
            Our mission is not to accuse or defame, but to highlight systemic issues that affect communities, governance, and public trust. CorruptX provides structured reporting, ethical safeguards, and administrative oversight to ensure information is handled responsibly.
          </p>

          <p className="text-gray-300 leading-relaxed text-sm">
            By participating, users contribute to awareness, accountability, and long-term reform.
          </p>

          {/* Video Placeholder */}
          <div className="mt-8">
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-gray-700">
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                    <span className="text-2xl">▶️</span>
                    {/* Play icon overlay effect */}
                    <div className="absolute inset-0 rounded-full bg-accent/10 animate-pulse"></div>
                  </div>
                  <p className="text-gray-400 text-sm font-medium">
                    Introduction Video (Coming Soon)
                  </p>
                </div>
              </div>
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
            {/* Comment for future video integration */}
            {/* Video will be added here later */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutCorruptX;