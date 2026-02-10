import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../App";

interface ReportDetails {
  id: string;
  location?: string;
  description?: string;
  corruption_type?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
}

const ReporterSubmitPage = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reportDetails, setReportDetails] = useState<ReportDetails | null>(null);
  const [reporterId, setReporterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verificationDescription, setVerificationDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadReportDetails = async () => {
      if (!reportId || !user) return;

      try {
        // Fetch reporter ID
        const { data: reporter, error: reporterError } = await supabase
          .from("reporters")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (reporterError || !reporter) {
          setError("Reporter profile not found");
          setLoading(false);
          return;
        }

        setReporterId(reporter.id);

        // Fetch report details
        const { data: report, error: reportError } = await supabase
          .from("uploads")
          .select("id, location, description, corruption_type, latitude, longitude, created_at")
          .eq("id", reportId)
          .single();

        if (reportError || !report) {
          setError("Report not found");
          setLoading(false);
          return;
        }

        setReportDetails(report);
      } catch (err) {
        console.error("Error loading report details:", err);
        setError("Failed to load report details");
      } finally {
        setLoading(false);
      }
    };

    loadReportDetails();
  }, [reportId, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (images and videos)
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'video/mp4', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        setError("Please select a valid image or video file");
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError("File size must be less than 50MB");
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    if (!verificationDescription.trim()) {
      setError("Please provide a verification description");
      return;
    }

    if (!reporterId || !reportId) {
      setError("Missing required information");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${reporterId}_${reportId}_${Date.now()}.${fileExt}`;
      const filePath = `reporter-verifications/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      // Update report with verification details
      const { error: updateError } = await supabase
        .from("uploads")
        .update({
          verification_media_url: publicUrl,
          verification_description: verificationDescription,
          verification_status: 'submitted',
          verified_by: reporterId,
          verified_at: new Date().toISOString()
        })
        .eq("id", reportId);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/reporter");
      }, 2000);

    } catch (err: any) {
      console.error("Error submitting verification:", err);
      setError(err.message || "Failed to submit verification");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f14] via-[#121826] to-[#1a1a2e] text-white flex items-center justify-center">
        <p>Loading report details...</p>
      </div>
    );
  }

  if (error && !reportDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f14] via-[#121826] to-[#1a1a2e] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate("/reporter")}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f14] via-[#121826] to-[#1a1a2e] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-emerald-400 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2">Verification Submitted!</h2>
          <p className="text-gray-400 mb-4">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f14] via-[#121826] to-[#1a1a2e] text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-cyan-300 uppercase tracking-wide">Reporter Verification</p>
            <h1 className="text-3xl font-bold">Submit Verification</h1>
          </div>
          <button
            onClick={() => navigate("/reporter")}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400 text-sm"
          >
            Cancel
          </button>
        </div>

        {/* Report Details */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
          <h2 className="text-xl font-semibold mb-4">Report Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Location:</span>
              <span className="text-white">{reportDetails?.location || "Not specified"}</span>
            </div>
            {reportDetails?.latitude && reportDetails?.longitude && (
              <div className="flex justify-between">
                <span className="text-gray-400">Coordinates:</span>
                <span className="text-white">
                  {reportDetails.latitude.toFixed(4)}, {reportDetails.longitude.toFixed(4)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="text-white">{reportDetails?.corruption_type || "Unspecified"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Description:</span>
              <span className="text-white text-right max-w-md">
                {reportDetails?.description || "No description"}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
          <h2 className="text-xl font-semibold">Verification Evidence</h2>

          {error && (
            <div className="p-4 rounded-lg border bg-red-500/10 border-red-500/30 text-red-400">
              {error}
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Photo or Video <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-cyan-600 file:text-white
                  hover:file:bg-cyan-500
                  file:cursor-pointer cursor-pointer
                  border border-white/10 rounded-lg
                  bg-black/30 p-2"
              />
            </div>
            {selectedFile && (
              <p className="mt-2 text-sm text-emerald-400">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Accepted: Images (JPG, PNG, GIF) or Videos (MP4, MOV). Max size: 50MB
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Verification Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={verificationDescription}
              onChange={(e) => setVerificationDescription(e.target.value)}
              placeholder="Describe what you verified, what you saw, and any additional details..."
              rows={5}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-colors resize-none"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Provide clear details about your verification of this report
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/reporter")}
              className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedFile || !verificationDescription.trim()}
              className="flex-1 px-4 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/40 transition-all"
            >
              {submitting ? "Submitting..." : "Submit Verification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReporterSubmitPage;
