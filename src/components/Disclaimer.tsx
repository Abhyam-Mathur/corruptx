import React from 'react';

interface DisclaimerProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  title?: string;
}

const Disclaimer: React.FC<DisclaimerProps> = ({
  isOpen,
  onClose,
  onAccept,
  title = "Disclaimer"
}) => {
  if (!isOpen) return null;

  const disclaimerText = `By using this corruption reporting platform (the "Platform"), you acknowledge and agree that:

The Platform serves solely as a medium for citizen reporters to upload and share information in the public interest. The Platform, its owners, operators, affiliates, and administrators bear no responsibility or liability for the accuracy, completeness, legality, or truthfulness of any content uploaded by users.

All content uploaded by citizen reporters is the sole responsibility of the individual uploader. You represent and warrant that:

• The information is accurate to the best of your knowledge and belief.
• There is no malafide intent; submissions are made exclusively for public good, such as exposing corruption, and not for personal gain, harassment, defamation, or any unlawful purpose.
• You have the right to share the content and it does not infringe on any third-party rights, including privacy, intellectual property, or confidentiality.

The Platform does not endorse, verify, moderate, or fact-check user-submitted content in real-time. Users are solely liable for any claims, damages, losses, or legal actions arising from their submissions, including but not limited to defamation, misinformation, or privacy violations.

The Platform reserves the right to remove content at its discretion and report illegal activity to authorities. By uploading content, you indemnify the Platform against all claims related to your submissions.

This disclaimer is governed by the laws of India. Continued use constitutes acceptance.`;

  return (
    <div className="modal-overlay fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="modal-content max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
              <span className="text-accent text-lg">⚠️</span>
            </div>
            {title}
          </h2>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <div className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">
            {disclaimerText}
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="btn-secondary px-6 py-3 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            className="btn-primary px-6 py-3 text-sm font-medium"
          >
            I Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;