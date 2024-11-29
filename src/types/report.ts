export interface Report {
  id: string;
  name: string;
  platforms: ('meta' | 'tiktok' | 'google')[];
  metrics: string[];
  campaigns: string[];
  created_at: string;
  status: 'generating' | 'ready' | 'error';
  share_url?: string;
  last_updated: string;
  enable_date_range: boolean;
}

export interface ReportFormData {
  name: string;
  platforms: ('meta' | 'tiktok' | 'google')[];
  metrics: string[];
  campaigns: string[];
  enableDateRange?: boolean;
}