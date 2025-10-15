/**
 * Asset Inspection React App - Complete with Split Components
 */
import React, { useState, useEffect } from 'react';
import apiService from './services/api';
import { useInspection } from './hooks/useInspection';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { AssetDetailView } from './components/AssetDetailView';
import { InspectionView } from './components/InspectionView';
import { ReportsView } from './components/ReportsView';
import { User, Asset, ScheduledInspection, AuditHistory, ViewType } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [user, setUser] = useState<User | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [scheduledInspections, setScheduledInspections] = useState<ScheduledInspection[]>([]);
  const [assetHistory, setAssetHistory] = useState<AuditHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use custom inspection hook
  const inspection = useInspection();

  // Load scheduled inspections when dashboard is shown
  useEffect(() => {
    if (currentView === 'dashboard' && user) {
      loadScheduledInspections();
    }
  }, [currentView, user]);

  // Load asset history when asset detail is shown
  useEffect(() => {
    if (currentView === 'asset-detail' && selectedAsset) {
      loadAssetHistory();
    }
  }, [currentView, selectedAsset]);

  const loadScheduledInspections = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const inspections = await apiService.getScheduledInspections(user.employee_id);
      setScheduledInspections(inspections);
    } catch (err: any) {
      setError('Failed to load inspections: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAssetHistory = async () => {
    if (!selectedAsset) return;
    setLoading(true);
    try {
      const history = await apiService.getAssetHistory(selectedAsset.asset_id);
      setAssetHistory(history);
    } catch (err: any) {
      setError('Error loading asset history: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await apiService.login(username, password);
      setUser(userData);
      setCurrentView('dashboard');
    } catch (err: any) {
      setError('Invalid credentials. Use: john.doe / password123');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAsset = async (inspectionItem: ScheduledInspection) => {
    setLoading(true);
    setError(null);
    try {
      const assetDetail = await apiService.getAssetDetail(inspectionItem.asset_id);
      setSelectedAsset(assetDetail);
      setCurrentView('asset-detail');
    } catch (err: any) {
      setError('Failed to load asset details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInspection = () => {
    inspection.resetForm();
    setCurrentView('inspection');
  };

  const handleSubmitInspection = async () => {
    if (!selectedAsset || !user) return;
    
    try {
      const result = await inspection.submitAudit(selectedAsset.asset_id, user.employee_id);
      
      alert(
        `Audit submitted successfully!\n\n` +
        `AI Analysis:\n` +
        `- Status: ${inspection.auditStatus}\n` +
        `- Urgency: ${result.ai_analysis.urgency_level}\n` +
        `- Summary: ${result.ai_analysis.summary}\n` +
        `- Workflow Status: Closed`
      );
      
      setCurrentView('dashboard');
      await loadScheduledInspections();
    } catch (err) {
      // Error already handled in hook
      console.error('Submission error:', err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedAsset(null);
    setScheduledInspections([]);
    setAssetHistory([]);
    setCurrentView('login');
  };

  // Render appropriate view based on current state
  switch (currentView) {
    case 'login':
      return (
        <LoginView
          onLogin={handleLogin}
          loading={loading}
          error={error}
        />
      );

    case 'dashboard':
      return (
        <DashboardView
          user={user}
          inspections={scheduledInspections}
          loading={loading}
          error={error}
          onSelectAsset={handleSelectAsset}
          onNavigateToReports={() => setCurrentView('reports')}
          onLogout={handleLogout}
        />
      );

    case 'asset-detail':
      return (
        <AssetDetailView
          asset={selectedAsset}
          history={assetHistory}
          loading={loading}
          error={error}
          onBack={() => setCurrentView('dashboard')}
          onStartInspection={handleStartInspection}
        />
      );

    case 'inspection':
      return (
        <InspectionView
          asset={selectedAsset}
          auditStatus={inspection.auditStatus}
          setAuditStatus={inspection.setAuditStatus}
          comments={inspection.comments}
          setComments={inspection.setComments}
          photos={inspection.photos}
          isRecording={inspection.isRecording}
          isSubmitting={inspection.isSubmitting}
          loading={inspection.loading}
          error={inspection.error}
          onPhotoUpload={inspection.handlePhotoUpload}
          onVoiceRecord={inspection.handleVoiceRecord}
          onSubmit={handleSubmitInspection}
          onCancel={() => setCurrentView('asset-detail')}
        />
      );

    case 'reports':
      return (
        <ReportsView
          loading={loading}
          error={error}
          onGenerateReport={async (filters) => {
            setLoading(true);
            setError(null);
            try {
              const result = await apiService.generateReport(filters);
              window.open(result.report_url, '_blank');
              alert(
                `Report generated successfully!\n\n` +
                `Total Audits: ${result.total_audits}\n\n` +
                `The PDF will open in a new tab.`
              );
            } catch (err: any) {
              setError('Failed to generate report: ' + err.message);
            } finally {
              setLoading(false);
            }
          }}
          onBack={() => setCurrentView('dashboard')}
          onLogout={handleLogout}
        />
      );

    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p>Unknown view</p>
        </div>
      );
  }
};

export default App;