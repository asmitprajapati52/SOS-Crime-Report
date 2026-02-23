import React, { useState } from 'react';
import { toast } from 'react-toastify';

const FileUpload = ({ onFilesChange }) => {
  const [files, setFiles] = useState([]);

  const handleFiles = (fileList) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['image/', 'video/', 'audio/'];
    
    const newFiles = Array.from(fileList).filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max 50MB)`);
        return false;
      }
      
      const isAllowed = allowedTypes.some(type => file.type.startsWith(type));
      if (!isAllowed) {
        toast.error(`${file.name} type not supported`);
        return false;
      }
      
      return true;
    }).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    if (onFilesChange) onFilesChange(updatedFiles);
    
    newFiles.forEach(f => toast.success(`✅ ${f.file.name} uploaded`));
  };

  const removeFile = (id) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    if (onFilesChange) onFilesChange(updatedFiles);
    toast.info('🗑️ File removed');
  };

  return (
    <div>
      <div
        className="file-upload-area"
        onClick={() => document.getElementById('fileInput').click()}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('dragover');
          handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add('dragover');
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('dragover');
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📎</div>
        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
          Drop files here or click to upload
        </p>
        <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
          Supports: Images, Videos, Audio (Max 50MB each)
        </p>
        <input
          type="file"
          id="fileInput"
          multiple
          accept="image/*,video/*,audio/*"
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      {files.length > 0 && (
        <div className="file-preview">
          {files.map((item) => (
            <div key={item.id} className="file-preview-item">
              <button className="file-remove" onClick={() => removeFile(item.id)}>✕</button>
              {item.file.type.startsWith('image/') && (
                <img src={item.preview} alt={item.file.name} />
              )}
              {item.file.type.startsWith('video/') && (
                <video src={item.preview} controls />
              )}
              {item.file.type.startsWith('audio/') && (
                <audio src={item.preview} controls />
              )}
              <div style={{ fontSize: '0.75rem', opacity: 0.7, wordBreak: 'break-all' }}>
                {item.file.name}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                {(item.file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
