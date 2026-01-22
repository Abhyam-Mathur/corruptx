import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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
  const heatmapLayerRef = useRef<any>(null)

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

    // Create heatmap layer using simple circles for now
    // In a production app, you'd use a proper heatmap library like leaflet.heat
    const createHeatmapLayer = () => {
      const layerGroup = L.layerGroup()

      points.forEach((point) => {
        const color = getColorForIntensity(point.intensity)
        const circle = L.circle([point.lat, point.lng], {
          color: color,
          fillColor: color,
          fillOpacity: 0.6,
          radius: Math.max(5000, point.intensity * 1000), // Minimum radius, scale with intensity
          weight: 2,
        })

        if (onPointClick) {
          circle.on('click', () => onPointClick(point))
        }

        circle.bindTooltip(`Reports: ${point.intensity}`)
        layerGroup.addLayer(circle)
      })

      return layerGroup
    }

    const heatmapLayer = createHeatmapLayer()
    heatmapLayer.addTo(map)
    heatmapLayerRef.current = heatmapLayer

    // Add controls if requested
    if (showControls) {
      L.control.layers({}, { 'Corruption Heatmap': heatmapLayer }).addTo(map)
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [center, zoom, showControls])

  // Update heatmap when points change
  useEffect(() => {
    if (!leafletMapRef.current || !heatmapLayerRef.current) return

    // Remove old layer
    leafletMapRef.current.removeLayer(heatmapLayerRef.current)

    // Create new layer
    const layerGroup = L.layerGroup()
    points.forEach((point) => {
      const color = getColorForIntensity(point.intensity)
      const circle = L.circle([point.lat, point.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.6,
        radius: Math.max(5000, point.intensity * 1000),
        weight: 2,
      })

      if (onPointClick) {
        circle.on('click', () => onPointClick(point))
      }

      circle.bindTooltip(`Reports: ${point.intensity}`)
      layerGroup.addLayer(circle)
    })

    layerGroup.addTo(leafletMapRef.current)
    heatmapLayerRef.current = layerGroup
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