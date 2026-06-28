import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { downloadBackup, restoreBackup } from "../services/api.js";
import { FiDatabase, FiDownload, FiUpload } from "react-icons/fi"; // Icons import kiye

export const BackupButtons = () => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Dropdown state
  const dropdownRef = useRef(null);

  // Bahar click karne par dropdown close karne ke liye
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ===== DOWNLOAD BACKUP =====
  const handleDownloadBackup = async () => {
    try {
      setLoading(true);
      setIsOpen(false); // Dropdown close karein
      toast.info('Preparing encrypted backup...');

      const response = await downloadBackup();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `backup_encrypted_${new Date().toISOString().split('T')[0]}.json`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success('✅ Encrypted backup downloaded successfully');
    } catch (error) {
      toast.error('❌ Download failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== RESTORE BACKUP =====
  const handleRestoreBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setLoading(true);
        setIsOpen(false); // Dropdown close karein
        toast.info('Reading encrypted backup...');

        const fileContent = JSON.parse(e.target.result);

        if (!fileContent.encryptedData || !fileContent.iv) {
          toast.error('❌ Invalid backup file format');
          return;
        }

        const response = await restoreBackup({
          encryptedData: fileContent.encryptedData,
          iv: fileContent.iv
        });

        if (response.data.success) {
          toast.success('✅ Backup file validated and decrypted');
          alert(`
Backup File Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Date: ${response.data.data.backupDate}
📊 Sales: ${response.data.data.salesToRestore}
💳 Payments: ${response.data.data.paymentsToRestore}
👥 Customers: ${response.data.data.customersToRestore}
📦 Products: ${response.data.data.productsToRestore}
🏢 Suppliers: ${response.data.data.suppliersToRestore}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 Encryption: AES-256
✅ Status: Valid & Decrypted
          `);
        }
      } catch (error) {
        toast.error('❌ Restore failed: ' + error.message);
      } finally {
        setLoading(false);
        event.target.value = ''; 
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Main Database Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 shadow-sm transition-all flex items-center justify-center relative ${loading ? 'opacity-50' : ''}`}
        title="Database Actions"
      >
        <FiDatabase size={20} className="text-gray-600" />
        {loading && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-bg-primary"></span>
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-gray-100 shadow-xl z-50 py-1 transition-all origin-top-right">
          <div className="px-4 py-2 border-b border-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Database Actions</p>
          </div>
          
          {/* Download Action */}
          <button
            onClick={handleDownloadBackup}
            className="w-full text-left px-4 py-3 mt-1  rounded-2xl text-sm bg-bg-primary text-white hover:bg-bg-secondary flex items-center gap-3 font-semibold transition-colors"
          >
            <FiDownload size={16} className="text-white" />
            <span>Download Backup</span>
          </button>

          {/* Restore Action */}
          <label className="w-full text-left px-4 py-3 mt-1 rounded-2xl bg-red-500 text-sm text-white hover:bg-red-600 flex items-center gap-3 font-semibold cursor-pointer transition-colors">
            <FiUpload size={16} className="text-white" />
            <span>Restore Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreBackup}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default BackupButtons;