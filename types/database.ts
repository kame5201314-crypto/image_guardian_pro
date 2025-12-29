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
