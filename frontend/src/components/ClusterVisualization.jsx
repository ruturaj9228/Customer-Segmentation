import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ReferenceDot } from 'recharts';

// Distinct colors for up to 10 clusters matching the cyber/antigravity theme
const CLUSTER_COLORS = [
  '#6366f1', // primary
  '#ec4899', // secondary
  '#14b8a6', // accent
  '#eab308', // yellow
  '#8b5cf6', // purple
  '#f97316', // orange
  '#0ea5e9', // sky
  '#10b981', // emerald
  '#f43f5e', // rose
  '#84cc16'  // lime
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const tooltipData = data.tooltip;
    
    return (
      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-hover)', minWidth: '200px' }}>
        <h4 className="font-bold text-white mb-2" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          Cluster {data.cluster}
        </h4>
        <div className="text-sm grid gap-1">
            {tooltipData && Object.entries(tooltipData).slice(0, 8).map(([key, val], idx) => (
                <div key={idx} className="flex justify-between items-center gap-4">
                    <span className="text-muted">{key}:</span>
                    <span className="text-white font-medium">{typeof val === 'number' ? val.toFixed(2) : val}</span>
                </div>
            ))}
            {tooltipData && Object.keys(tooltipData).length > 8 && (
                 <div className="text-muted text-xs italic mt-1">...and {Object.keys(tooltipData).length - 8} more features</div>
            )}
        </div>
      </div>
    );
  }

  return null;
};

const ClusterVisualization = ({ plotData }) => {
  if (!plotData || !plotData.points) return null;

  const { points, centroids, xLabel, yLabel } = plotData;

  // Enhance points with colors and format for recharts
  const formattedData = points.map(p => ({
    ...p,
    fill: CLUSTER_COLORS[p.cluster % CLUSTER_COLORS.length]
  }));

  // Render
  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            
            <XAxis 
                type="number" 
                dataKey="x" 
                name={xLabel} 
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                domain={['auto', 'auto']}
            />
            
            <YAxis 
                type="number" 
                dataKey="y" 
                name={yLabel} 
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                domain={['auto', 'auto']}
            />
            
            <RechartsTooltip 
                content={<CustomTooltip />} 
                cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }} 
            />
            
            <Scatter name="Clusters" data={formattedData} fill="#8884d8">
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Scatter>

            {/* Render Centroids separately to make them stand out */}
            {centroids && centroids.map((c, i) => (
                <ReferenceDot 
                    key={`centroid-${i}`}
                    x={c.x}
                    y={c.y}
                    r={8}
                    fill={CLUSTER_COLORS[c.cluster % CLUSTER_COLORS.length]}
                    stroke="white"
                    strokeWidth={2}
                    isFront={true}
                />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 justify-center mt-6 flex-wrap">
          {centroids.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CLUSTER_COLORS[c.cluster % CLUSTER_COLORS.length], border: '1px solid white' }}></div>
                 <span className="text-sm text-white font-medium">Cluster {c.cluster}</span>
              </div>
          ))}
      </div>
      <style>{`
         .h-\\[500px\\] { height: 500px; }
         .w-3 { width: 0.75rem; }
         .h-3 { height: 0.75rem; }
      `}</style>
    </div>
  );
};

export default ClusterVisualization;
