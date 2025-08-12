import React, { useEffect, useRef } from 'react';

export default function WorldMapV2Page() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = React.useState<{
    show: boolean;
    text: string;
    x: number;
    y: number;
  }>({ show: false, text: '', x: 0, y: 0 });

  useEffect(() => {
    // Check if MapTiler SDK is already loaded
    if (typeof window !== 'undefined' && (window as any).maptilersdk) {
      initializeMap();
      return;
    }

    // Load MapTiler SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.maptiler.com/maptiler-sdk-js/v3.6.1/maptiler-sdk.umd.min.js';
    script.onload = () => {
      // Add CSS
      if (!document.querySelector('link[href*="maptiler-sdk"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.maptiler.com/maptiler-sdk-js/v3.6.1/maptiler-sdk.css';
        document.head.appendChild(link);
      }
      
      // Wait a bit for CSS to load, then initialize
      setTimeout(initializeMap, 100);
    };
    document.head.appendChild(script);

    function initializeMap() {
      const maptilersdk = (window as any).maptilersdk;
      if (!maptilersdk || !mapContainerRef.current) return;

      // Configure API key
      maptilersdk.config.apiKey = 'LwlR5e2rf7A2MFtHdeox';

      try {
                 // Create map with basic style
         const map = new maptilersdk.Map({
           container: mapContainerRef.current,
           style: 'https://api.maptiler.com/maps/streets-dark/style.json?key=LwlR5e2rf7A2MFtHdeox',
           center: [0, 20],
           zoom: 2,
           maxZoom: 18,
           minZoom: 1
         });

        let hoveredCountryId: string | null = null;

        map.on('load', function () {
          console.log('Map loaded successfully');
          
          // Add world countries source
          map.addSource('countries', {
            'type': 'geojson',
            'data': 'https://docs.maptiler.com/sdk-js/assets/countries.geojson'
          });

          // Add country fills with hover effect
          map.addLayer({
            'id': 'country-fills',
            'type': 'fill',
            'source': 'countries',
            'layout': {},
            'paint': {
              'fill-color': '#627BC1',
              'fill-opacity': 0.6
            }
          });

          // Add country borders
          map.addLayer({
            'id': 'country-borders',
            'type': 'line',
            'source': 'countries',
            'layout': {},
            'paint': {
              'line-color': '#627BC1',
              'line-width': 1,
              'line-opacity': 0.8
            }
          });

          // Add a highlight layer that will be shown on hover
          map.addLayer({
            'id': 'country-highlight',
            'type': 'fill',
            'source': 'countries',
            'layout': {},
            'paint': {
              'fill-color': '#FF6B6B',
              'fill-opacity': 0.8
            },
            'filter': ['==', ['get', 'name'], ''] // Start with no countries highlighted
          });

          console.log('Countries layers added');

          // Mouse move event for hover detection
          map.on('mousemove', function (e: any) {
            const features = map.queryRenderedFeatures(e.point, {
              layers: ['country-fills']
            });
            
            if (features.length > 0) {
              const feature = features[0];
              const countryName = feature.properties.name || feature.properties.ADMIN || 'Unknown Country';
              
              // Change cursor
              map.getCanvas().style.cursor = 'pointer';
              
              // Show the highlight layer for this specific country
              map.setFilter('country-highlight', ['==', ['get', 'name'], countryName]);
              
              // Show tooltip
              setTooltip({
                show: true,
                text: countryName,
                x: e.point.x,
                y: e.point.y
              });
              
              console.log('Hovering over:', countryName);
            } else {
              // Reset cursor and hide highlight when not over a country
              map.getCanvas().style.cursor = '';
              map.setFilter('country-highlight', ['==', ['get', 'name'], '']); // Hide all highlights
              
              // Hide tooltip
              setTooltip({ show: false, text: '', x: 0, y: 0 });
            }
          });

          // Click effect for countries
          map.on('click', function (e: any) {
            const features = map.queryRenderedFeatures(e.point, {
              layers: ['country-fills']
            });
            
            if (features.length > 0) {
              const country = features[0];
              const countryName = country.properties.name || country.properties.ADMIN || 'Unknown Country';
              console.log('Clicked country:', countryName);
              
              // Flash effect - temporarily change the highlight color
              map.setPaintProperty('country-highlight', 'fill-color', '#FFD700');
              
              // Reset after 500ms
              setTimeout(() => {
                map.setPaintProperty('country-highlight', 'fill-color', '#FF6B6B');
              }, 500);
            }
          });
        });

        // Add navigation controls
        map.addControl(new maptilersdk.NavigationControl(), 'top-right');
        
        // Add fullscreen control
        map.addControl(new maptilersdk.FullscreenControl(), 'top-right');

        // Store map reference for cleanup
        (mapContainerRef.current as any).map = map;

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }

    // Cleanup function
    return () => {
      if (mapContainerRef.current && (mapContainerRef.current as any).map) {
        (mapContainerRef.current as any).map.remove();
      }
    };
  }, []);

  return (
    <div className="h-full w-full relative" style={{ minHeight: '500px' }}>
      <style jsx>{`
        .map-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          min-height: 500px;
        }
        
        /* Ensure the map canvas is visible */
        .maplibregl-canvas {
          width: 100% !important;
          height: 100% !important;
          filter: brightness(0.8) contrast(1.2);
        }
        
        /* Hide any branding */
        .maplibregl-ctrl-bottom-right,
        .maplibregl-ctrl-bottom-left {
          display: none !important;
        }
        
        /* Tooltip styles */
        .country-tooltip {
          position: absolute;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          pointer-events: none;
          z-index: 1000;
          transform: translate(-50%, -100%);
          margin-top: -10px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        .country-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: rgba(0, 0, 0, 0.8);
        }
      `}</style>
      <div ref={mapContainerRef} className="map-container" />
      
      {/* Country Tooltip */}
      {tooltip.show && (
        <div 
          className="country-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
} 