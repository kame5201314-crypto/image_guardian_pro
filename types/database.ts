/**
 * Supabase Database Types
 * 資料庫型別定義
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      assets: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          description: string | null;
          file_path: string;
          file_url: string;
          file_hash: string | null;
          file_size: number;
          mime_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id?: string;
          name: string;
          description?: string | null;
          file_path: string;
          file_url: string;
          file_hash?: string | null;
          file_size: number;
          mime_type: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          description?: string | null;
          file_path?: string;
          file_url?: string;
          file_hash?: string | null;
          file_size?: number;
          mime_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      scans: {
        Row: {
          id: string;
          org_id: string;
          asset_id: string;
          status: string;
          platforms: string[];
          match_count: number;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id?: string;
          asset_id: string;
          status?: string;
          platforms?: string[];
          match_count?: number;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          asset_id?: string;
          status?: string;
          platforms?: string[];
          match_count?: number;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scans_asset_id_fkey";
            columns: ["asset_id"];
            referencedRelation: "assets";
            referencedColumns: ["id"];
          }
        ];
      };
      scan_matches: {
        Row: {
          id: string;
          org_id: string;
          scan_id: string;
          asset_id: string;
          source_url: string;
          source_platform: string;
          thumbnail_url: string | null;
          similarity_score: number;
          status: string;
          detected_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id?: string;
          scan_id: string;
          asset_id: string;
          source_url: string;
          source_platform: string;
          thumbnail_url?: string | null;
          similarity_score: number;
          status?: string;
          detected_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          scan_id?: string;
          asset_id?: string;
          source_url?: string;
          source_platform?: string;
          thumbnail_url?: string | null;
          similarity_score?: number;
          status?: string;
          detected_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scan_matches_scan_id_fkey";
            columns: ["scan_id"];
            referencedRelation: "scans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scan_matches_asset_id_fkey";
            columns: ["asset_id"];
            referencedRelation: "assets";
            referencedColumns: ["id"];
          }
        ];
      };
      evidence: {
        Row: {
          id: string;
          org_id: string;
          match_id: string | null;
          asset_id: string;
          evidence_type: string;
          title: string;
          description: string | null;
          file_path: string | null;
          file_url: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id?: string;
          match_id?: string | null;
          asset_id: string;
          evidence_type: string;
          title: string;
          description?: string | null;
          file_path?: string | null;
          file_url?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          match_id?: string | null;
          asset_id?: string;
          evidence_type?: string;
          title?: string;
          description?: string | null;
          file_path?: string | null;
          file_url?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "evidence_asset_id_fkey";
            columns: ["asset_id"];
            referencedRelation: "assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evidence_match_id_fkey";
            columns: ["match_id"];
            referencedRelation: "scan_matches";
            referencedColumns: ["id"];
          }
        ];
      };
      infringements: {
        Row: {
          id: string;
          org_id: string;
          asset_id: string;
          match_id: string | null;
          case_number: string;
          status: string;
          priority: string;
          infringing_url: string;
          infringing_platform: string;
          infringing_seller: string | null;
          infringing_title: string | null;
          screenshot_url: string | null;
          screenshot_path: string | null;
          screenshot_hash: string | null;
          screenshot_taken_at: string | null;
          ai_similarity_score: number | null;
          ai_confidence_score: number | null;
          ai_assessment_report: Json | null;
          ai_conclusion: string | null;
          ai_assessed_at: string | null;
          reported_at: string | null;
          reported_method: string | null;
          reported_reference: string | null;
          report_email_content: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id?: string;
          asset_id: string;
          match_id?: string | null;
          case_number: string;
          status?: string;
          priority?: string;
          infringing_url: string;
          infringing_platform: string;
          infringing_seller?: string | null;
          infringing_title?: string | null;
          screenshot_url?: string | null;
          screenshot_path?: string | null;
          screenshot_hash?: string | null;
          screenshot_taken_at?: string | null;
          ai_similarity_score?: number | null;
          ai_confidence_score?: number | null;
          ai_assessment_report?: Json | null;
          ai_conclusion?: string | null;
          ai_assessed_at?: string | null;
          reported_at?: string | null;
          reported_method?: string | null;
          reported_reference?: string | null;
          report_email_content?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          asset_id?: string;
          match_id?: string | null;
          case_number?: string;
          status?: string;
          priority?: string;
          infringing_url?: string;
          infringing_platform?: string;
          infringing_seller?: string | null;
          infringing_title?: string | null;
          screenshot_url?: string | null;
          screenshot_path?: string | null;
          screenshot_hash?: string | null;
          screenshot_taken_at?: string | null;
          ai_similarity_score?: number | null;
          ai_confidence_score?: number | null;
          ai_assessment_report?: Json | null;
          ai_conclusion?: string | null;
          ai_assessed_at?: string | null;
          reported_at?: string | null;
          reported_method?: string | null;
          reported_reference?: string | null;
          report_email_content?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "infringements_asset_id_fkey";
            columns: ["asset_id"];
            referencedRelation: "assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "infringements_match_id_fkey";
            columns: ["match_id"];
            referencedRelation: "scan_matches";
            referencedColumns: ["id"];
          }
        ];
      };
      system_logs: {
        Row: {
          id: string;
          org_id: string;
          level: string;
          source: string;
          message: string;
          metadata: Json | null;
          stack_trace: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id?: string;
          level: string;
          source: string;
          message: string;
          metadata?: Json | null;
          stack_trace?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          level?: string;
          source?: string;
          message?: string;
          metadata?: Json | null;
          stack_trace?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_match_count: {
        Args: { scan_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// 便利型別別名
export type Asset = Database['public']['Tables']['assets']['Row'];
export type AssetInsert = Database['public']['Tables']['assets']['Insert'];
export type AssetUpdate = Database['public']['Tables']['assets']['Update'];

export type Scan = Database['public']['Tables']['scans']['Row'];
export type ScanInsert = Database['public']['Tables']['scans']['Insert'];
export type ScanUpdate = Database['public']['Tables']['scans']['Update'];

export type ScanMatch = Database['public']['Tables']['scan_matches']['Row'];
export type ScanMatchInsert = Database['public']['Tables']['scan_matches']['Insert'];
export type ScanMatchUpdate = Database['public']['Tables']['scan_matches']['Update'];

export type Evidence = Database['public']['Tables']['evidence']['Row'];
export type EvidenceInsert = Database['public']['Tables']['evidence']['Insert'];
export type EvidenceUpdate = Database['public']['Tables']['evidence']['Update'];

export type Infringement = Database['public']['Tables']['infringements']['Row'];
export type InfringementInsert = Database['public']['Tables']['infringements']['Insert'];
export type InfringementUpdate = Database['public']['Tables']['infringements']['Update'];

export type SystemLog = Database['public']['Tables']['system_logs']['Row'];
export type SystemLogInsert = Database['public']['Tables']['system_logs']['Insert'];

// AI 鑑定報告結構
export interface AIAssessmentReport {
  subject_comparison: {
    original_features: string[];
    infringing_features: string[];
    match_percentage: number;
    analysis: string;
  };
  background_comparison: {
    original_bg: string;
    infringing_bg: string;
    is_different: boolean;
    analysis: string;
  };
  manipulation_detection: {
    watermark_removed: boolean;
    cropped: boolean;
    color_adjusted: boolean;
    analysis: string;
  };
  conclusion: {
    is_infringement: boolean;
    confidence_score: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    legal_recommendation: string;
  };
}
