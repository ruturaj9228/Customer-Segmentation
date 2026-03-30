import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { UploadCloud, File as FileIcon, CheckCircle } from 'lucide-react';

const FileUpload = ({ onFileUpload, loading }) => {
  const [fileSelected, setFileSelected] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFileSelected(true);
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  return (
    <motion.div 
      {...getRootProps()} 
      className={`glass-panel cursor-pointer flex flex-col items-center justify-center p-12 transition-all ${isDragActive ? 'opacity-80 scale-[1.02]' : ''}`}
      style={{
        borderStyle: 'dashed',
        borderWidth: '2px',
        borderColor: isDragActive ? 'var(--primary)' : 'var(--border-color)',
        minHeight: '250px'
      }}
      whileHover={{ y: -5, boxShadow: 'var(--shadow-neon)' }}
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
    >
      <input {...getInputProps()} />
      
      {loading ? (
        <div className="flex flex-col items-center gap-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
            <p className="gradient-text font-medium text-lg">Parsing Dataset...</p>
        </div>
      ) : fileSelected && acceptedFiles[0] ? (
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="p-4 rounded-full" style={{ background: 'rgba(20, 184, 166, 0.2)', color: 'var(--accent)' }}>
            <CheckCircle size={48} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{acceptedFiles[0].name}</h3>
            <p className="text-muted text-sm">{(acceptedFiles[0].size / 1024).toFixed(1)} KB loaded successfully</p>
          </div>
          <p className="text-xs text-muted mt-4">Click or drag a new file to replace</p>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="p-5 rounded-3xl" style={{ background: 'var(--bg-card-hover)' }}>
            <UploadCloud size={54} color="var(--primary)" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Upload Dataset</h3>
            <p className="text-muted" style={{ fontSize: '1.1rem' }}>
              {isDragActive ? "Drop the file here..." : "Drag & drop your CSV file here, or click to browse"}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 text-sm font-medium" style={{ color: 'var(--secondary)' }}>
            <FileIcon size={16} /> Only .csv files are supported
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FileUpload;
