import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";

// TopoJSON URL for world map
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  data: { name: string; count: number }[];
  onCountryClick?: (name: string) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ data, onCountryClick }) => {
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Map data to a record for easy lookup
  const dataMap = data.reduce((acc, curr) => {
    acc[curr.name.toLowerCase()] = curr.count;
    return acc;
  }, {} as Record<string, number>);

  const maxCount = Math.max(...data.map((d) => d.count), 0);

  const colorScale = scaleLinear<string>()
    .domain([0, maxCount])
    .range(["#E2E8F0", "#3b82f6"]); // From slate-200 to primary blue

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPos({ x: event.clientX, y: event.clientY });
  };

  return (
    <div className="relative w-full h-full min-h-[300px]" onMouseMove={handleMouseMove}>
      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147,
        }}
        width={800}
        height={450}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryName = geo.properties.name;
              const count = dataMap[countryName.toLowerCase()] || 0;
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={count > 0 ? colorScale(count) : "#F8FAFC"}
                  stroke="#D1D5DB"
                  strokeWidth={0.5}
                  onMouseEnter={() => {
                    setTooltipContent(`${countryName}: ${count} visitantes`);
                  }}
                  onMouseLeave={() => {
                    setTooltipContent(null);
                  }}
                  onClick={() => {
                    if (onCountryClick && count > 0) {
                      onCountryClick(countryName);
                    }
                  }}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: count > 0 ? "#2563eb" : "#f1f5f9", cursor: count > 0 ? "pointer" : "default" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {tooltipContent && (
        <div
          className="fixed z-50 pointer-events-none bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-xl border border-slate-700/50"
          style={{
            left: tooltipPos.x + 15,
            top: tooltipPos.y - 10,
            transform: "translateY(-100%)",
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
};

export default WorldMap;
