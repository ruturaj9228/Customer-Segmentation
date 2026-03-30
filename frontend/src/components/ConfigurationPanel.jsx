import { motion } from 'framer-motion';
import { Settings2, BarChart2 } from 'lucide-react';

const ConfigurationPanel = ({ numericColumns, selectedColumns, setSelectedColumns, k, setK }) => {

  const toggleColumn = (col) => {
    if (selectedColumns.includes(col)) {
      setSelectedColumns(selectedColumns.filter(c => c !== col));
    } else {
      setSelectedColumns([...selectedColumns, col]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Column Selection */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Settings2 size={18} className="text-primary" />
          <h3 className="text-lg font-semibold m-0 text-white">Select Features</h3>
        </div>
        <p className="text-sm text-muted mb-4">Choose numeric columns to include in clustering.</p>
        
        <div className="flex flex-wrap gap-2">
            {numericColumns.length === 0 ? (
                <div className="text-sm text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                    No numeric columns found. Clustering requires numeric data.
                </div>
            ) : (
                numericColumns.map((col, idx) => {
                    const isSelected = selectedColumns.includes(col);
                    return (
                        <button
                            key={idx}
                            onClick={() => toggleColumn(col)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                isSelected 
                                ? 'bg-primary/20 text-primary border-primary border' 
                                : 'bg-card text-muted hover:bg-white/10 border-transparent border'
                            }`}
                            style={{
                                background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                color: isSelected ? '#a5b4fc' : '#94a3b8',
                                borderColor: isSelected ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            {col}
                        </button>
                    );
                })
            )}
        </div>
      </motion.div>

      {/* K Slider */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col justify-center"
      >
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <BarChart2 size={18} className="text-secondary" />
                <h3 className="text-lg font-semibold m-0 text-white">Number of Clusters (K)</h3>
            </div>
            <div className="text-2xl font-bold text-secondary">{k}</div>
        </div>
        
        <p className="text-sm text-muted mb-6">Drag the slider to define group count.</p>
        
        <div className="relative w-full">
            <input 
                type="range" 
                min="2" 
                max="10" 
                value={k}
                onChange={(e) => setK(parseInt(e.target.value))}
                className="w-full slider"
            />
            <div className="flex justify-between text-xs text-muted mt-2">
                <span>2</span>
                <span>10</span>
            </div>
        </div>
      </motion.div>
      
      <style>{`
        .slider {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 9999px;
          outline: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--secondary);
          cursor: pointer;
          border: 3px solid rgba(22, 26, 33, 1);
          box-shadow: 0 0 15px var(--secondary-glow);
          transition: transform 0.1s;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--secondary);
          cursor: pointer;
          border: 3px solid rgba(22, 26, 33, 1);
          box-shadow: 0 0 15px var(--secondary-glow);
        }
        
        /* Flexbox specific classes not in index.css */
        .flex-wrap { flex-wrap: wrap; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        @media (min-width: 768px) {
            .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        .text-lg { font-size: 1.125rem; }
        .text-2xl { font-size: 1.5rem; }
        .font-semibold { font-weight: 600; }
        .font-bold { font-weight: 700; }
        .m-0 { margin: 0; }
        .rounded-full { border-radius: 9999px; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 300ms; }
        .text-primary { color: var(--primary); }
        .text-secondary { color: var(--secondary); }
        .relative { position: relative; }
      `}</style>
    </div>
  );
};

export default ConfigurationPanel;
