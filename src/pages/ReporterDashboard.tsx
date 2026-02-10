import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../App";
import HeatmapView from "../components/HeatmapView";

interface Upload {
  latitude: number | null;
  longitude: number | null;
  description?: string | null;
  location?: string | null;
  corruption_type?: string | null;
  created_at?: string | null;
}

interface Assignment {
  id: string;
  status: string;
  created_at: string;
  report_id: string;
  uploads: Upload[];
}

interface ReporterLocation {
  latitude: number;
  longitude: number;
  radius_km: number;
}

const ReporterDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [reporterLocation, setReporterLocation] = useState<ReporterLocation | null>(null);
  const [reporterId, setReporterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadAssignments = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Step 1: Fetch reporter record with location
      const { data: reporter, error: reporterError } = await supabase
        .from("reporters")
        .select("id, latitude, longitude, radius_km")
        .eq("user_id", user.id)
        .single();

      if (reporterError) {
        console.error("Failed to fetch reporter profile", reporterError);
        setAssignments([]);
        setLoading(false);
        return;
      }

      if (!reporter) {
        console.warn("No reporter profile found for user");
        setAssignments([]);
        setLoading(false);
        return;
      }

      // Store reporter location
      setReporterLocation({
        latitude: reporter.latitude,
        longitude: reporter.longitude,
        radius_km: reporter.radius_km || 5
      });
      setReporterId(reporter.id);

      console.log("Reporter location:", reporter.latitude, reporter.longitude, "radius:", reporter.radius_km);

      // Step 2: Fetch assignments using reporter.id
      const { data, error } = await supabase
        .from("reporter_assignments")
        .select("id, status, created_at, report_id, uploads:report_id(latitude, longitude, description, location, corruption_type, created_at)")
        .eq("reporter_id", reporter.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load assignments", error);
        setAssignments([]);
      } else {
        console.log("Assignments loaded:", data?.length || 0);
        setAssignments(data as Assignment[]);
      }
    } catch (err) {
      console.error("Error loading assignments", err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [user]);

  const handleStatusChange = async (assignmentId: string, status: string, reportId: string) => {
    setActionLoading(assignmentId + status);
    setFeedback(null);
    
    try {
      // Update the assignment status
      const { error: assignmentError } = await supabase
        .from("reporter_assignments")
        .update({ status })
        .eq("id", assignmentId);
      
      if (assignmentError) {
        console.error("Failed to update assignment status", assignmentError);
        setFeedback({ type: 'error', message: `Failed to ${status === 'accepted' ? 'accept' : 'ignore'} assignment` });
        setActionLoading(null);
        return;
      }

      // If accepting, update the report with reporter details
      if (status === 'accepted' && reporterId) {
        const { error: reportError } = await supabase
          .from("uploads")
          .update({ 
            assigned_reporter_id: reporterId,
            accepted_at: new Date().toISOString()
          })
          .eq("id", reportId);
        
        if (reportError) {
          console.error("Failed to update report", reportError);
        }
      }

      // Update local state immediately
      setAssignments(prev => 
        prev.map(a => a.id === assignmentId ? { ...a, status } : a)
      );

      if (status === 'accepted') {
        setFeedback({ 
          type: 'success', 
          message: 'Assignment accepted! Redirecting to verification page...' 
        });
        
        // Navigate to verification page after a short delay
        setTimeout(() => {
          navigate(`/reporter/submit/${reportId}`);
        }, 1000);
      } else {
        setFeedback({ 
          type: 'success', 
          message: 'Assignment ignored successfully' 
        });
        
        // Clear feedback after 3 seconds
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error("Error updating assignment", err);
      setFeedback({ type: 'error', message: 'An error occurred' });
    } finally {
      setActionLoading(null);
    }
  };

  // Filter assignments to show only 'notified' status (not yet accepted/ignored)
  const activeAssignments = assignments.filter(a => a.status === 'notified');

  // Use active assignments for map points
  const mapPoints = activeAssignments
    .filter((a) => a.uploads.length > 0 && a.uploads[0]?.latitude && a.uploads[0]?.longitude)
    .map((a) => {
      const upload = a.uploads[0];
      console.log("Map point:", upload!.latitude, upload!.longitude);
      return {
        lat: upload!.latitude as number,
        lng: upload!.longitude as number,
        intensity: 1,
        campaign: upload?.location || "",
        corruptionType: upload?.corruption_type || "",
      };
    });
  
  console.log("Total active assignments:", activeAssignments.length);
  console.log("Total map points:", mapPoints.length);

  const filteredAssignments = activeAssignments.filter((a) => {
    const searchLower = searchTerm.toLowerCase();
    const upload = a.uploads[0];
    return (
      upload?.location?.toLowerCase().includes(searchLower) ||
      upload?.description?.toLowerCase().includes(searchLower) ||
      upload?.corruption_type?.toLowerCase().includes(searchLower) ||
      a.status.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f14] via-[#121826] to-[#1a1a2e] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-cyan-300 uppercase tracking-wide">Reporter Mode</p>
            <h1 className="text-3xl font-bold">Your Assignments</h1>
            <p className="text-gray-400 text-sm">Review nearby corruption reports and verify their details.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400 text-sm"
            >
              Back to user dashboard
            </button>
            <button
              onClick={loadAssignments}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-sm shadow-lg shadow-cyan-900/40"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-2xl">
          <input
            type="text"
            placeholder="Search assignments by location, type, description, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-colors"
          />
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div className={`p-4 rounded-lg border ${
            feedback.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {feedback.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-2xl">
            <h2 className="text-xl font-semibold mb-3">Nearby reports ({mapPoints.length})</h2>
            <div className="h-[380px] overflow-hidden rounded-xl">
              <HeatmapView 
                points={mapPoints} 
                center={reporterLocation ? [reporterLocation.latitude, reporterLocation.longitude] : [20, 0]} 
                zoom={reporterLocation && mapPoints.length > 0 ? 12 : 2} 
                height="100%" 
              />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-2xl">
            <h2 className="text-xl font-semibold mb-3">Assignments</h2>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading assignments...</p>
            ) : activeAssignments.length === 0 ? (
              <p className="text-gray-400 text-sm">No assignments yet. You will be notified when a report is near you.</p>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredAssignments.length === 0 ? (
                  <p className="text-gray-400 text-sm">No assignments match your search.</p>
                ) : (
                  filteredAssignments.map((a) => {
                    const upload = a.uploads[0];
                    // Determine location display
                    const locationDisplay = upload?.location 
                      ? upload.location 
                      : (upload?.latitude && upload?.longitude)
                        ? `Coordinates: ${upload.latitude.toFixed(4)}, ${upload.longitude.toFixed(4)}`
                        : "Location unavailable";
                    
                    return (
                      <div key={a.id} className="p-3 rounded-xl bg-black/30 border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm text-gray-300">Status</p>
                          <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/10">
                            {a.status}
                          </span>
                        </div>
                        <p className="text-sm text-white font-semibold">{locationDisplay}</p>
                        <p className="text-xs text-gray-400 truncate">{upload?.description || "No description"}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>{upload?.corruption_type || "Unspecified"}</span>
                          <span>{new Date(a.created_at).toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleStatusChange(a.id, "accepted", a.report_id)}
                            disabled={actionLoading === a.id + "accepted"}
                            className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm disabled:opacity-60"
                          >
                            {actionLoading === a.id + "accepted" ? "Saving..." : "Accept"}
                          </button>
                          <button
                            onClick={() => handleStatusChange(a.id, "ignored", a.report_id)}
                            disabled={actionLoading === a.id + "ignored"}
                            className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm disabled:opacity-60"
                          >
                            {actionLoading === a.id + "ignored" ? "Saving..." : "Ignore"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReporterDashboardPage;
