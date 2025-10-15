/**
 * Asset Detail View Component
 */
import React from 'react';
import { Camera, ArrowLeft } from 'lucide-react';
import { Asset, AuditHistory } from '../types';

interface AssetDetailViewProps {
  asset: Asset | null;
  history: AuditHistory[];
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onStartInspection: () => void;
}

export const AssetDetailView: React.FC<AssetDetailViewProps> = ({
  asset,
  history,
  loading,
  error,
  onBack,
  onStartInspection
}) => {
  if (!asset) {
    return <div>No asset selected</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Asset Details</h1>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-indigo-700 rounded-lg hover:bg-indigo-800 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{asset.asset_name}</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600">
                <span className="font-semibold">Type:</span> {asset.asset_type}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Location:</span> {asset.location}
              </p>
            </div>
            <div>
              <p className="text-gray-600">
                <span className="font-semibold">Status:</span> {asset.status}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Last Inspection:</span>{' '}
                {asset.last_inspection_date
                  ? new Date(asset.last_inspection_date).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={onStartInspection}
            className="w-full md:w-auto px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition duration-200 flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Start Inspection
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Previous Audits</h3>
          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : history.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No previous audits found</p>
          ) : (
            <div className="space-y-4">
              {history.map((audit) => (
                <div key={audit.audit_id} className="border-l-4 border-indigo-600 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {new Date(audit.inspection_date).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600 text-sm">{audit.summary}</p>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          audit.audit_status === 'Good'
                            ? 'bg-green-100 text-green-800'
                            : audit.audit_status === 'Fair'
                            ? 'bg-yellow-100 text-yellow-800'
                            : audit.audit_status === 'Poor'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {audit.audit_status}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          audit.urgency_level === 'Low'
                            ? 'bg-blue-100 text-blue-800'
                            : audit.urgency_level === 'Medium'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {audit.urgency_level}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};