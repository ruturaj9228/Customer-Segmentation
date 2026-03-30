import { motion } from 'framer-motion';
import { Database } from 'lucide-react';

const DataPreview = ({ data }) => {
  if (!data || !data.preview || data.preview.length === 0) return null;

  const { columns, preview, numericColumns } = data;

  return (
    <motion.div 
      className="glass-panel overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 p-4 border-b border-white/10" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
        <Database size={20} color="var(--accent)" />
        <h4 className="font-semibold m-0 text-lg">Dataset Preview</h4>
        <span className="ml-auto text-xs text-muted bg-white/5 py-1 px-3 rounded-full">
          Displaying first {preview.length} rows
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" style={{ minWidth: '800px' }}>
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {columns.map((col, idx) => (
                <th key={idx} className="p-4 py-3 text-sm font-semibold text-muted tracking-wider uppercase">
                  <div className="flex items-center gap-2">
                    {col}
                    {numericColumns.includes(col) && (
                      <span className="text-secondary text-[10px] px-1.5 py-0.5 rounded-sm bg-secondary/10 border border-secondary/20">NUM</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className="border-b border-white/5 transition-colors hover:bg-white/5"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="p-4 py-3 text-sm text-gray-300">
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
        .text-left { text-align: left; }
        .w-full { width: 100%; }
        .border-b { border-bottom-width: 1px; }
        .border-white\\/10 { border-color: rgba(255, 255, 255, 0.1); }
        .border-white\\/5 { border-color: rgba(255, 255, 255, 0.05); }
        .bg-white\\/5 { background-color: rgba(255, 255, 255, 0.05); }
        .p-4 { padding: 1rem; }
        .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .font-semibold { font-weight: 600; }
        .tracking-wider { letter-spacing: 0.05em; }
        .uppercase { text-transform: uppercase; }
        .hover\\:bg-white\\/5:hover { background-color: rgba(255, 255, 255, 0.05); }
        .text-gray-300 { color: #d1d5db; }
        .text-white\\/20 { color: rgba(255, 255, 255, 0.2); }
        .italic { font-style: italic; }
        .text-\\[10px\\] { font-size: 10px; }
        .px-1\\.5 { padding-left: 0.375rem; padding-right: 0.375rem; }
        .py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
        .rounded-sm { border-radius: 0.125rem; }
        .bg-secondary\\/10 { background-color: rgba(236, 72, 153, 0.1); }
        .border-secondary\\/20 { border-color: rgba(236, 72, 153, 0.2); border-width: 1px; }
        .text-secondary { color: var(--secondary); }
      `}</style>
    </motion.div>
  );
};

export default DataPreview;
