import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Activity, Download, ChevronRight, AlertCircle, Settings } from 'lucide-react';
import axios from 'axios';

import FileUpload from './components/FileUpload';
import DataPreview from './components/DataPreview';
import ConfigurationPanel from './components/ConfigurationPanel';
import ClusterVisualization from './components/ClusterVisualization';
import InsightsCards from './components/InsightsCards';
import ClusterDetailTable from './components/ClusterDetailTable';

const API_BASE_URL = 'https://customer-segmentation-uum2.onrender.com/api';

function App() {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null); // { columns, numericColumns, preview }
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [k, setK] = useState(3);

  const [plotData, setPlotData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [downloadCsv, setDownloadCsv] = useState(null);
  const [clusterDataMap, setClusterDataMap] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file); // 👈 VERY IMPORTANT

      const response = await axios.post(
        `${API_BASE_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload success:", response.data);

      // update your states
      setPreviewData(response.data);
      // Automatically select all numeric columns initially
      if (response.data.numericColumns && response.data.numericColumns.length > 0) {
        setSelectedColumns(response.data.numericColumns);
      }

    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file");
    }
  };

  const handleCluster = async () => {
    if (!file || selectedColumns.length === 0) {
      setError("Please ensure a file is uploaded and at least one numeric column is selected.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('features', JSON.stringify(selectedColumns));
    formData.append('k', k.toString());

    try {
      const response = await axios.post(`${API_BASE_URL}/cluster`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setPlotData(response.data.plotData);
      setInsights(response.data.insights);
      setDownloadCsv(response.data.downloadCSV_base64);
      setClusterDataMap(response.data.clusterData);
      setSelectedCluster(null);

      // Scroll to results slightly later to allow render
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      setError(err.response?.data?.detail || 'Error running clustering. Check your data and selected columns.');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = () => {
    if (!downloadCsv) return;
    const link = document.createElement("a");
    link.href = `data:text/csv;base64,${downloadCsv}`;
    link.download = "clustered_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container min-h-screen pb-20">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center justify-between mt-8 mb-12 glass-panel"
        style={{ padding: '20px 32px' }}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl" style={{ background: 'var(--primary-glow)' }}>
            <Activity size={28} color="white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text" style={{ fontSize: '1.75rem', margin: 0 }}>ClusterIQ</h1>
            <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0, marginTop: '4px' }}>AI-Powered Customer Segmentation</p>
          </div>
        </div>

        {downloadCsv && (
          <button onClick={downloadFile} className="btn-primary flex items-center gap-2">
            <Download size={18} /> Download Results
          </button>
        )}
      </motion.header>

      {/* Main Content Grid */}
      <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '2rem' }}>

        {/* Step 1: Upload */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-col gap-4"
        >
          <h2 className="flex items-center gap-3 mb-4" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
            <span style={{ color: 'var(--primary)', opacity: 0.8 }}>01.</span> Data Ingestion
          </h2>
          <FileUpload onFileUpload={handleFileUpload} loading={loading && !previewData} />

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="glass-panel mt-4"
              style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <AlertCircle size={20} />
              <p style={{ margin: 0 }}>{error}</p>
            </motion.div>
          )}

          <AnimatePresence>
            {previewData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6"
              >
                <DataPreview data={previewData} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Step 2: Configure */}
        <AnimatePresence>
          {previewData && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8"
            >
              <h2 className="flex items-center gap-3 mb-4" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--primary)', opacity: 0.8 }}>02.</span> Model Configuration
              </h2>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <ConfigurationPanel
                  numericColumns={previewData.numericColumns}
                  selectedColumns={selectedColumns}
                  setSelectedColumns={setSelectedColumns}
                  k={k}
                  setK={setK}
                />

                <div className="flex justify-center mt-8 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <button
                    onClick={handleCluster}
                    disabled={loading || selectedColumns.length === 0}
                    className="btn-primary flex items-center gap-2"
                    style={{ padding: '14px 40px', fontSize: '1.1rem' }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> Processing...
                      </span>
                    ) : (
                      <>Run Clustering Engine <ChevronRight size={20} /></>
                    )}
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Step 3: Results */}
        <AnimatePresence>
          {plotData && insights && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mt-12"
              id="results-section"
            >
              <h2 className="flex items-center gap-3 mb-6" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--primary)', opacity: 0.8 }}>03.</span> Insights & Visualization
              </h2>

              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                <InsightsCards
                  insights={insights}
                  selectedColumns={selectedColumns}
                  selectedCluster={selectedCluster}
                  onSelectCluster={(cid) => {
                    setSelectedCluster(cid === selectedCluster ? null : cid);
                    setTimeout(() => {
                      document.getElementById('detail-table-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                />
              </div>

              <AnimatePresence>
                {selectedCluster && clusterDataMap && clusterDataMap[selectedCluster] && (
                  <div id="detail-table-section">
                    <ClusterDetailTable
                      clusterLabel={insights.find(i => String(i.cluster) === selectedCluster)?.label || `Cluster ${selectedCluster}`}
                      clusterIdx={selectedCluster}
                      data={clusterDataMap[selectedCluster]}
                    />
                  </div>
                )}
              </AnimatePresence>

              <div className="glass-panel animate-float-delayed mt-8" style={{ padding: '24px', minHeight: '500px' }}>
                <ClusterVisualization plotData={plotData} />
              </div>
            </motion.section>
          )}
        </AnimatePresence>

      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default App;
