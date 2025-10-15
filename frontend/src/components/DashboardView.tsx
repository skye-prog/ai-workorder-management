/**
 * Dashboard View Component
 */
import React from 'react';
import { Calendar } from 'lucide-react';
import { ScheduledInspection, User } from '../types';

interface DashboardViewProps {
  user: User | null;
  inspections: ScheduledInspection[];
  loading: boolean;
  error: string | null;
  onSelectAsset: (inspection: ScheduledInspection) => void;
  onNavigateToReports: () => void;
  onLogout: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  inspections,
  loading,
  error,
  onSelectAsset,
  onNavigateToReports,
  onLogout
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Asset Inspection Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={onNavigateToReports}
              className="px-4 py-2 bg-indigo-700 rounded-lg hover:bg-indigo-800"
            >
              Reports
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.full_name || 'Inspector'}
          </h2>
          <p className="text-gray-600">
            You have {inspections.length} scheduled inspections
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading inspections...</p>
          </div>
        ) : inspections.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No scheduled inspections at this time</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {inspections.map((inspection) => (
              <div
                key={inspection.schedule_id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
                onClick={() => onSelectAsset(inspection)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {inspection.asset_name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-semibold">Type:</span> {inspection.asset_type}</p>
                      <p><span className="font-semibold">Location:</span> {inspection.location}</p>
                      <p>
                        <span className="font-semibold">Scheduled:</span>{' '}
                        {new Date(inspection.scheduled_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                      Pending
                    </span>
                    <Calendar className="w-8 h-8 text-indigo-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};