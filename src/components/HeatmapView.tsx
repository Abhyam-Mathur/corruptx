import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface HeatmapPoint {
  lat: number
  lng: number
  intensity: number
  campaign?: string
  corruptionType?: string
}

interface HeatmapViewProps {
  points: HeatmapPoint[]
  center?: [number, number]
  zoom?: number
  height?: string
  showControls?: boolean
  onPointClick?: (point: HeatmapPoint) => void
}

const HeatmapView = ({
  points,
  center = [20, 0], // Default center
  zoom = 2,
  height = '400px',
  showControls = true,
  onPointClick
}: HeatmapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<L.Map | null>(null)
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom)
    leafletMapRef.current = map

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Initialize marker cluster group with custom styling
    const markerClusterGroup = L.markerClusterGroup({
      maxClusterRadius: 80,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: function(cluster) {
        const count = cluster.getChildCount()
        let className = 'marker-cluster-small'
        
        if (count >= 10) {
          className = 'marker-cluster-large'
        } else if (count >= 5) {
          className = 'marker-cluster-medium'
        }
        
        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster ${className}`,
          iconSize: L.point(40, 40)
        })
      }
    })
    
    markerClusterGroup.addTo(map)
    markerClusterGroupRef.current = markerClusterGroup

    // Add controls if requested
    if (showControls) {
      L.control.layers({}, { 'Corruption Reports': markerClusterGroup }).addTo(map)
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [center, zoom, showControls])

  // Update markers when points change
  useEffect(() => {
    if (!leafletMapRef.current || !markerClusterGroupRef.current) return

    // Clear existing markers
    markerClusterGroupRef.current.clearLayers()

    // Add markers for each point
    points.forEach((point) => {
      const color = getColorForIntensity(point.intensity)
      
      // Create custom icon based on intensity
      const icon = L.divIcon({
        className: 'custom-marker-icon',
        html: `
          <div style="
            background-color: ${color};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
          ">
            ${point.intensity}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      })

      const marker = L.marker([point.lat, point.lng], { icon })

      // Add popup with details
      const popupContent = `
        <div style="min-width: 150px;">
          <strong>Reports: ${point.intensity}</strong><br/>
          ${point.campaign ? `Campaign: ${point.campaign}<br/>` : ''}
          ${point.corruptionType ? `Type: ${point.corruptionType}` : ''}
        </div>
      `
      marker.bindPopup(popupContent)

      // Add click handler if provided
      if (onPointClick) {
        marker.on('click', () => onPointClick(point))
      }

      // Add marker to cluster group
      markerClusterGroupRef.current!.addLayer(marker)
    })

    // Fit bounds to show all markers if there are any
    if (points.length > 0 && leafletMapRef.current) {
      const bounds = markerClusterGroupRef.current.getBounds()
      if (bounds.isValid()) {
        leafletMapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 })
      }
    }
  }, [points, onPointClick])

  const getColorForIntensity = (intensity: number): string => {
    // Color gradient: yellow (low) -> orange (medium) -> red (high)
    if (intensity <= 1) return '#ffff00' // yellow
    if (intensity <= 5) return '#ffa500' // orange
    return '#ff0000' // red
  }

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
      className="rounded-lg border"
    />
  )
}

export default HeatmapView