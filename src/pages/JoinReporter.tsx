import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../App";

// Fix default marker assets for Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DEFAULT_CENTER: [number, number] = [20, 0];
const DEFAULT_ZOOM = 2;
const ACTIVE_ZOOM = 12;
const DEFAULT_RADIUS_KM = 5;

const JoinReporterPage = () => {
  const { user, refreshRole } = useAuth();
  const navigate = useNavigate();

  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Prefer not to say");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setMarkerPosition = (latitude: number, longitude: number, pan = false) => {
    if (!leafletMapRef.current) return;

    if (!markerRef.current) {
      markerRef.current = L.marker([latitude, longitude], { draggable: true }).addTo(leafletMapRef.current);
      markerRef.current.on("dragend", () => {
        const pos = markerRef.current!.getLatLng();
        setLat(pos.lat);
        setLng(pos.lng);
      });
    } else {
      markerRef.current.setLatLng([latitude, longitude]);
    }

    if (pan) {
      leafletMapRef.current.setView([latitude, longitude], ACTIVE_ZOOM, { animate: true });
    }
  };

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const map = L.map(mapRef.current).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    leafletMapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      setLat(e.latlng.lat);
      setLng(e.latlng.lng);
      setMarkerPosition(e.latlng.lat, e.latlng.lng, true);
    });
  }, []);

  // Update marker when coordinates change
  useEffect(() => {
    if (lat != null && lng != null) {
      setMarkerPosition(lat, lng);
    }
  }, [lat, lng]);

  // Attempt geolocation on mount
  useEffect(() => {
    const locate = async () => {
      if (!navigator.geolocation) return;
      setIsLocating(true);
      setError(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setMarkerPosition(pos.coords.latitude, pos.coords.longitude, true);
          setIsLocating(false);
        },
        (err) => {
          console.warn("Geolocation failed", err);
          setError("We could not detect your location automatically. You can set it manually on the map.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    };

    locate();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);

    if (!fullName.trim()) {
      setError("Full Name is required.");
      return;
    }
    const ageNumber = Number(age);
    if (!age || Number.isNaN(ageNumber) || ageNumber < 18) {
      setError("Age must be 18 or older.");
      return;
    }
    if (lat == null || lng == null) {
      setError("Please set your location using the map.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: existing, error: existingError } = await supabase
        .from("reporters")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existingError && existingError.code !== "PGRST116") throw existingError;

      if (existing) {
        setError("You are already registered as a reporter.");
        setIsSubmitting(false);
        return;
      }

      const id = (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2);

      const payload = {
        id,
        user_id: user.id,
        name: fullName.trim(),
        age: ageNumber,
        gender,
        latitude: lat,
        longitude: lng,
        radius_km: DEFAULT_RADIUS_KM,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase.from("reporters").insert([payload]);
      if (insertError) throw insertError;

      const { error: roleError } = await supabase.from("profiles").update({ role: "reporter" }).eq("id", user.id);
      if (roleError) throw roleError;

      await refreshRole();
      navigate("/reporter");
    } catch (err: any) {
      console.error("Failed to register reporter", err);
      setError(err?.message || "Failed to register as reporter. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f14] via-[#121826] to-[#1a1a2e] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <p className="text-sm text-cyan-300 uppercase tracking-wide">Reporter Program</p>
            <h1 className="text-3xl font-bold mt-2">Join as a Reporter</h1>
            <p className="text-gray-400 mt-2">Help verify corruption reports near you. Set your location and we will match nearby reports within your radius.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Full Name *</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400 outline-none"
                placeholder="Enter your full legal name"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Age *</label>
                <input
                  type="number"
                  min={18}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400 outline-none"
                  placeholder="18+"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400 outline-none"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm text-gray-300">Location *</label>
                <button
                  type="button"
                  onClick={() => {
                    if (!navigator.geolocation) return;
                    setIsLocating(true);
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setLat(pos.coords.latitude);
                        setLng(pos.coords.longitude);
                        setMarkerPosition(pos.coords.latitude, pos.coords.longitude, true);
                        setIsLocating(false);
                      },
                      () => setIsLocating(false),
                      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
                    );
                  }}
                  className="text-sm text-cyan-300 hover:text-cyan-200"
                >
                  {isLocating ? "Detecting..." : "Use my location"}
                </button>
              </div>
              <p className="text-xs text-gray-500">Click on the map or drag the pin to adjust your exact position.</p>
              <div className="h-64 rounded-xl overflow-hidden border border-white/10">
                <div ref={mapRef} className="h-full w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                <div>Latitude: <span className="text-white">{lat ? lat.toFixed(5) : '—'}</span></div>
                <div>Longitude: <span className="text-white">{lng ? lng.toFixed(5) : '—'}</span></div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-900/40 hover:from-cyan-400 hover:to-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Become a Reporter"}
            </button>
          </form>
        </div>

        {/* Right: Summary */}
        <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-semibold">Why join?</h2>
            <p className="text-gray-400 mt-2">Verify corruption reports near you, strengthen civic accountability, and keep your community informed.</p>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-gray-300">Auto-matching</p>
              <p className="text-gray-400 text-sm">We match reports within {DEFAULT_RADIUS_KM} km of your pin.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-gray-300">Control</p>
              <p className="text-gray-400 text-sm">Accept or ignore assignments with a single tap.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-gray-300">Safety</p>
              <p className="text-gray-400 text-sm">Your location radius can be adjusted later for privacy.</p>
            </div>
          </div>
          <div className="mt-auto text-xs text-gray-500">
            Location is stored securely and only used to match nearby reports.
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinReporterPage;
