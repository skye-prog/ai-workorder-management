/**
 * Custom hook for inspection operations
 */
import { useState } from 'react';
import apiService from '../services/api';
import { AuditPhoto, AuditStatus } from '../types';

export const useInspection = () => {
  const [auditStatus, setAuditStatus] = useState<AuditStatus>('Good');
  const [comments, setComments] = useState('');
  const [photos, setPhotos] = useState<AuditPhoto[]>([]);
  const [voiceFileUrl, setVoiceFileUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoUpload = async (files: FileList) => {
    setLoading(true);
    setError(null);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const result = await apiService.uploadPhoto(file);
        return {
          file,
          preview: URL.createObjectURL(file),
          url: result.url,
          ai_notes: result.ai_notes
        };
      });
      
      const uploadedPhotos = await Promise.all(uploadPromises);
      setPhotos([...photos, ...uploadedPhotos]);
    } catch (err: any) {
      setError('Failed to upload photos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      // In production, stop actual recording and upload
      setTimeout(() => {
        setComments(comments + (comments ? ' ' : '') + '[Voice note transcribed]');
      }, 500);
    } else {
      setIsRecording(true);
    }
  };

  const submitAudit = async (assetId: number, inspectorId: number) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const photoUrls = photos.map(p => p.url).filter(url => url !== undefined) as string[];
      
      const result = await apiService.submitAudit({
        asset_id: assetId,
        inspector_id: inspectorId,
        audit_status: auditStatus,
        raw_comments: comments,
        voice_file_url: voiceFileUrl || undefined,
        photo_urls: photoUrls
      });
      
      return result;
    } catch (err: any) {
      setError('Failed to submit audit: ' + err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAuditStatus('Good');
    setComments('');
    setPhotos([]);
    setVoiceFileUrl(null);
    setIsRecording(false);
    setError(null);
  };

  return {
    auditStatus,
    setAuditStatus,
    comments,
    setComments,
    photos,
    voiceFileUrl,
    isRecording,
    isSubmitting,
    loading,
    error,
    handlePhotoUpload,
    handleVoiceRecord,
    submitAudit,
    resetForm
  };
};