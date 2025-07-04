import React, { useEffect, useState } from 'react';
import apiService, { api } from '../services/api';

const CertificateList = () => {
  const [certificates, setCertificates] = useState([]);
  useEffect(() => {
    api.get('/api/certificates/').then(res => setCertificates(res.data));
  }, []);

  if (!certificates.length) return <div>No certificates yet.</div>;

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Certificates</h2>
      <ul className="space-y-2">
        {certificates.map(c => (
          <li key={c.id} className="bg-green-50 rounded p-2 flex justify-between items-center">
            <span>{c.course}</span>
            {c.file_url ? (
              <a href={c.file_url} className="text-purple-600 underline" target="_blank" rel="noopener noreferrer">Download</a>
            ) : (
              <span className="text-gray-500">Pending</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CertificateList;
