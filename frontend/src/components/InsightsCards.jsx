import { motion } from 'framer-motion';
import { Users, TrendingUp, BarChart } from 'lucide-react';

const CLUSTER_COLORS = [
  'var(--primary)',
  'var(--secondary)',
  'var(--accent)',
  '#eab308',
  '#8b5cf6',
  '#f97316',
  '#0ea5e9',
  '#10b981',
  '#f43f5e',
  '#84cc16'
];

const InsightsCards = ({ insights, selectedColumns }) => {
  if (!insights || insights.length === 0) return null;

  return (
    <>
      {insights.map((insight, idx) => (
        <motion.div 
          key={idx}
          className="glass-panel group relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
          whileHover={{ y: -5 }}
        >
          {/* Top colored accent line */}
          <div 
            className="absolute top-0 left-0 right-0 h-1" 
            style={{ backgroundColor: CLUSTER_COLORS[insight.cluster % CLUSTER_COLORS.length] }} 
          />
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div 
                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-white font-bold"
                        style={{ color: CLUSTER_COLORS[insight.cluster % CLUSTER_COLORS.length] }}
                    >
                        #{insight.cluster}
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-white m-0 leading-none">{insight.label || `Group ${insight.cluster}`}</h4>
                        <span className="text-xs text-muted flex items-center gap-1 mt-1">
                            <Users size={12} /> {insight.count} Members
                        </span>
                    </div>
                </div>
            </div>
            
            {insight.description && (
                <p className="text-sm text-gray-300 mb-6 italic" style={{ lineHeight: 1.4, opacity: 0.9 }}>
                    "{insight.description}"
                </p>
            )}

            <div className="space-y-4">
              <h5 className="text-xs tracking-wider text-muted font-semibold uppercase flex items-center gap-2 m-0 mb-3">
                  <BarChart size={14} /> Key Characteristics
              </h5>
              
              <div className="grid gap-3">
                  {selectedColumns.slice(0, 5).map((col, cIdx) => (
                      <div key={cIdx} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                          <span className="text-muted truncate pr-2 max-w-[60%]" title={col}>{col}</span>
                          <span className="font-medium text-white break-all">{insight.means[col]}</span>
                      </div>
                  ))}
                  {selectedColumns.length > 5 && (
                      <div className="text-xs text-primary text-center italic mt-2">
                          +{selectedColumns.length - 5} more metrics available in standard export
                      </div>
                  )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      <style>{`
        .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .max-w-\\[60\\%\\] { max-width: 60%; }
        .break-all { word-break: break-all; }
        .leading-none { line-height: 1; }
        .pb-2 { padding-bottom: 0.5rem; }
        .p-6 { padding: 1.5rem; }
        .p-2 { padding: 0.5rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .text-center { text-align: center; }
        .mt-1 { margin-top: 0.25rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-6 { margin-bottom: 1.5rem; }
      `}</style>
    </>
  );
};

export default InsightsCards;
