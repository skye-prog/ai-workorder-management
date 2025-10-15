/**
 * Inspection View Component
 */
import React from 'react';
import { Camera, CheckCircle, AlertTriangle, XCircle, Mic, Upload, Send } from 'lucide-react';
import { Asset, AuditPhoto, AuditStatus } from '../types';

interface InspectionViewProps {
  asset: Asset | null;
  auditStatus: AuditStatus;
  setAuditStatus: (status: AuditStatus) => void;
  comments: string;
  setComments: (comments: string) => void;
  photos: AuditPhoto[];
  isRecording: boolean;
  isSubmitting: boolean;
  loading: boolean;
  error: string | null;
  onPhotoUpload: (files: FileList) => Promise<void>;
  onVoiceRecord: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const InspectionView: React.FC<InspectionViewProps> = ({
  asset,
  auditStatus,
  setAuditStatus,
  comments,
  setComments,
  photos,
  isRecording,
  isSubmitting,
  loading,
  error,
  onPhotoUpload,
  onVoiceRecord,
  onSubmit,
  onCancel
}) => {
  if (!asset) {
    return <div>No asset selected</div>;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onPhotoUpload(e.target.files);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Camera className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Perform Inspection</h1>
          </div>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-indigo-700 rounded-lg hover:bg-indigo-800"
          >
            Cancel
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{asset.asset_name}</h2>
          <p className="text-gray-600">{asset.location}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Audit Status */}
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-3">Audit Status</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['Good', 'Fair', 'Poor', 'Critical'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setAuditStatus(status)}
                  disabled={loading}
                  className={`py-3 px-4 rounded-lg font-semibold transition duration-200 ${
                    auditStatus === status
                      ? status === 'Good'
                        ? 'bg-green-600 text-white'
                        : status === 'Fair'
                        ? 'bg-yellow-600 text-white'
                        : status === 'Poor'
                        ? 'bg-orange-600 text-white'
                        : 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'Good' && <CheckCircle className="w-5 h-5 inline mr-1" />}
                  {status === 'Critical' && <AlertTriangle className="w-5 h-5 inline mr-1" />}
                  {status === 'Poor' && <XCircle className="w-5 h-5 inline mr-1" />}
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Photos */}
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-3">
              Upload Photos
            </label>
            <label className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center cursor-pointer hover:border-indigo-500 transition">
              <Upload className="w-12 h-12 text-gray-400 mb-2" />
              <span className="text-gray-600">Click to upload photos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
              />
            </label>

            {loading && photos.length === 0 && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="mt-2 text-gray-600">Uploading and analyzing photos...</p>
              </div>
            )}

            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo.preview}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {photo.ai_notes && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-gray-700">
                        <p className="font-semibold">AI Notes:</p>
                        <p>{photo.ai_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-3">Comments</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={6}
              placeholder="Enter your inspection notes here..."
            />
            <button
              onClick={onVoiceRecord}
              disabled={loading}
              className={`mt-3 px-6 py-2 rounded-lg font-semibold transition duration-200 flex items-center gap-2 ${
                isRecording
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <Mic className="w-5 h-5" />
              {isRecording ? 'Stop Recording' : 'Record Voice Note'}
            </button>
          </div>

          {/* Submit Button */}
          <button
            onClick={onSubmit}
            disabled={isSubmitting || loading || !comments}
            className="w-full py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing with AI...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Audit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};