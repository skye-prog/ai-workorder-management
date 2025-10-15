/**
 * Reports View Component
 */
import React, { useState } from 'react';
import { Download, ArrowLeft } from 'lucide-react';

interface ReportFilters {
  start_date: string;
  end_date: string;
  urgency_level?: string;
  workflow_status?: string;
}

interface ReportsViewProps {
  loading: boolean;
  error: string | null;
  onGenerateReport: (filters: ReportFilters) => Promise<void>;
  onBack: () => void;
  onLogout: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  loading,
  error,
  onGenerateReport,
  onBack,
  onLogout
}) => {
  const [reportStartDate, setReportStartDate] = useState('2025-10-01');
  const [reportEndDate, setReportEndDate] = useState('2025-10-31');
  const [reportUrgency, setReportUrgency] = useState<string>('all');
  const [reportStatus, setReportStatus] = useState<string>('all');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerateReport({
      start_date: reportStartDate,
      end_date: reportEndDate,
      urgency_level: reportUrgency !== 'all' ? reportUrgency : undefined,
      workflow_status: reportStatus !== 'all' ? reportStatus : undefined
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Audit Reports</h1>
          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-indigo-700 rounded-lg hover:bg-indigo-800 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
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

      <div className="container mx-auto p-6 max-w-6xl">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Generate Audit Report</h2>

          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Start Date</label>
                <input
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">End Date</label>
                <input
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Urgency Level</label>
                <select
                  value={reportUrgency}
                  onChange={(e) => setReportUrgency(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Levels</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Audit Status</label>
                <select
                  value={reportStatus}
                  onChange={(e) => setReportStatus(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 flex items-center justify-center gap-2 disabled:bg-gray-400"
            >
              <Download className="w-5 h-5" />
              {loading ? 'Generating Report...' : 'Generate PDF Report'}
            </button>
          </form>
        </div>

        {/* Recent Audits Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Audits Preview</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Asset</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Urgency</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Summary</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    id: 1,
                    asset: 'Pump Station A1',
                    date: '2025-10-10',
                    status: 'Closed',
                    urgency: 'Low',
                    summary: 'Normal operations verified'
                  },
                  {
                    id: 2,
                    asset: 'HVAC Unit B2',
                    date: '2025-10-08',
                    status: 'Closed',
                    urgency: 'Medium',
                    summary: 'Filter replacement scheduled'
                  },
                  {
                    id: 3,
                    asset: 'Generator C3',
                    date: '2025-10-05',
                    status: 'Closed',
                    urgency: 'Low',
                    summary: 'All tests passed successfully'
                  },
                  {
                    id: 4,
                    asset: 'Fire Pump F6',
                    date: '2025-10-03',
                    status: 'Closed',
                    urgency: 'Critical',
                    summary: 'Urgent maintenance completed'
                  }
                ].map((audit) => (
                  <tr key={audit.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{audit.asset}</td>
                    <td className="py-3 px-4">{audit.date}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          audit.status === 'Closed'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {audit.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          audit.urgency === 'Low'
                            ? 'bg-blue-100 text-blue-800'
                            : audit.urgency === 'Medium'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {audit.urgency}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{audit.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};