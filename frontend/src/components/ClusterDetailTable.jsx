import { motion, AnimatePresence } from 'framer-motion';
import { Database, Download } from 'lucide-react';

const ClusterDetailTable = ({ clusterLabel, clusterIdx, data }) => {
  if (!data || !data.rows || data.rows.length === 0) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `data:text/csv;base64,${data.csv}`;
    // Sanitize the label to make a nice filename
    const safeLabel = clusterLabel.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `cluster_${clusterIdx}_${safeLabel}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = Object.keys(data.rows[0]);

  return (
    <motion.div 
      className="glass-panel overflow-hidden mt-8"
      initial={{ opacity: 0, height: 0, scale: 0.95 }}
      animate={{ opacity: 1, height: 'auto', scale: 1 }}
      exit={{ opacity: 0, height: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between p-5 border-b border-white/10" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
        <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-primary/20 text-primary">
                <Database size={20} />
            </div>
            <div>
                <h4 className="font-bold text-lg m-0 text-white">Segment Data: {clusterLabel}</h4>
                <div className="text-xs text-muted mt-1">Previewing top {data.rows.length} records in this specific cluster</div>
            </div>
        </div>
        
        <button 
          onClick={handleDownload} 
          className="btn-primary flex items-center gap-2"
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          <Download size={16} /> Export Segment
        </button>
      </div>
      
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto" style={{ borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
        <table className="w-full text-left border-collapse" style={{ minWidth: '800px' }}>
          <thead className="sticky top-0 z-10 bg-[#161a21]/95 backdrop-blur-md">
            <tr className="border-b border-white/10">
              {columns.map((col, idx) => (
                <th key={idx} className="p-4 py-3 text-xs font-semibold text-muted tracking-wider uppercase whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className="border-b border-white/5 transition-colors hover:bg-white/5"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="p-4 py-3 text-sm text-gray-300 whitespace-nowrap truncate max-w-[200px]" title={String(row[col])}>
                    {row[col] !== null && row[col] !== '' ? row[col] : <span className="text-white/20 italic">null</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <style>{`
        table { width: 100%; border-collapse: collapse; }
        .overflow-x-auto { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .overflow-y-auto { overflow-y: auto; }
        .max-h-\\[400px\\] { max-height: 400px; }
        .sticky { position: sticky; }
        .top-0 { top: 0; }
        .z-10 { z-index: 10; }
        .bg-\\[\\#161a21\\]\\/95 { background-color: rgba(22, 26, 33, 0.95); }
        .backdrop-blur-md { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .text-left { text-align: left; }
        .w-full { width: 100%; }
        .border-b { border-bottom-width: 1px; }
        .border-white\\/10 { border-color: rgba(255, 255, 255, 0.1); }
        .border-white\\/5 { border-color: rgba(255, 255, 255, 0.05); }
        .p-4 { padding: 1rem; }
        .p-5 { padding: 1.25rem; }
        .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .font-semibold { font-weight: 600; }
        .tracking-wider { letter-spacing: 0.05em; }
        .uppercase { text-transform: uppercase; }
        .whitespace-nowrap { white-space: nowrap; }
        .hover\\:bg-white\\/5:hover { background-color: rgba(255, 255, 255, 0.05); }
        .text-gray-300 { color: #d1d5db; }
        .text-white\\/20 { color: rgba(255, 255, 255, 0.2); }
        .italic { font-style: italic; }
      `}</style>
    </motion.div>
  );
};

export default ClusterDetailTable;
