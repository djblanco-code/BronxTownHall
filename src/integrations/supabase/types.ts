export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      ad_inquiries: {
        Row: {
          admin_notes: string | null;
          budget_range: string | null;
          contact_email: string;
          contact_name: string;
          created_at: string;
          id: string;
          interest: string;
          message: string | null;
          org_name: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          admin_notes?: string | null;
          budget_range?: string | null;
          contact_email: string;
          contact_name: string;
          created_at?: string;
          id?: string;
          interest?: string;
          message?: string | null;
          org_name: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          admin_notes?: string | null;
          budget_range?: string | null;
          contact_email?: string;
          contact_name?: string;
          created_at?: string;
          id?: string;
          interest?: string;
          message?: string | null;
          org_name?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      alert_subscriptions: {
        Row: {
          categories: string[];
          channel: string;
          confirmed: boolean;
          created_at: string;
          email: string | null;
          id: string;
          language: string;
          phone: string | null;
          unsubscribed_at: string | null;
          updated_at: string;
          zip_code: string | null;
        };
        Insert: {
          categories?: string[];
          channel?: string;
          confirmed?: boolean;
          created_at?: string;
          email?: string | null;
          id?: string;
          language?: string;
          phone?: string | null;
          unsubscribed_at?: string | null;
          updated_at?: string;
          zip_code?: string | null;
        };
        Update: {
          categories?: string[];
          channel?: string;
          confirmed?: boolean;
          created_at?: string;
          email?: string | null;
          id?: string;
          language?: string;
          phone?: string | null;
          unsubscribed_at?: string | null;
          updated_at?: string;
          zip_code?: string | null;
        };
        Relationships: [];
      };
      analytics_events: {
        Row: {
          category: string | null;
          event_type: string;
          id: string;
          metadata: Json | null;
          occurred_at: string;
          resource_id: string | null;
          visitor_id: string | null;
        };
        Insert: {
          category?: string | null;
          event_type: string;
          id?: string;
          metadata?: Json | null;
          occurred_at?: string;
          resource_id?: string | null;
          visitor_id?: string | null;
        };
        Update: {
          category?: string | null;
          event_type?: string;
          id?: string;
          metadata?: Json | null;
          occurred_at?: string;
          resource_id?: string | null;
          visitor_id?: string | null;
        };
        Relationships: [];
      };
      analytics_sessions: {
        Row: {
          device: string | null;
          id: string;
          is_first_visit: boolean;
          language: string | null;
          occurred_at: string;
          path: string | null;
          visitor_id: string;
          zip_code: string | null;
        };
        Insert: {
          device?: string | null;
          id?: string;
          is_first_visit?: boolean;
          language?: string | null;
          occurred_at?: string;
          path?: string | null;
          visitor_id: string;
          zip_code?: string | null;
        };
        Update: {
          device?: string | null;
          id?: string;
          is_first_visit?: boolean;
          language?: string | null;
          occurred_at?: string;
          path?: string | null;
          visitor_id?: string;
          zip_code?: string | null;
        };
        Relationships: [];
      };
      ask_questions: {
        Row: {
          category: string | null;
          created_at: string;
          id: string;
          lang: string | null;
          match_count: number;
          outcome: string;
          question: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          id?: string;
          lang?: string | null;
          match_count?: number;
          outcome: string;
          question: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          id?: string;
          lang?: string | null;
          match_count?: number;
          outcome?: string;
          question?: string;
        };
        Relationships: [];
      };
      bronx_resource_categories: {
        Row: {
          active: boolean;
          created_at: string;
          domain: string;
          id: string;
          label: string;
          sort_order: number;
          subcategories: string[];
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          domain: string;
          id: string;
          label: string;
          sort_order?: number;
          subcategories?: string[];
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          domain?: string;
          id?: string;
          label?: string;
          sort_order?: number;
          subcategories?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      bronx_resource_imports: {
        Row: {
          created_at: string;
          filename: string | null;
          format: string;
          id: string;
          imported_by: string | null;
          notes: string | null;
          rows_created: number;
          rows_merged: number;
          rows_received: number;
          rows_skipped_invalid: number;
          rows_skipped_non_bronx: number;
          rows_updated: number;
          source: string;
        };
        Insert: {
          created_at?: string;
          filename?: string | null;
          format: string;
          id?: string;
          imported_by?: string | null;
          notes?: string | null;
          rows_created?: number;
          rows_merged?: number;
          rows_received?: number;
          rows_skipped_invalid?: number;
          rows_skipped_non_bronx?: number;
          rows_updated?: number;
          source: string;
        };
        Update: {
          created_at?: string;
          filename?: string | null;
          format?: string;
          id?: string;
          imported_by?: string | null;
          notes?: string | null;
          rows_created?: number;
          rows_merged?: number;
          rows_received?: number;
          rows_skipped_invalid?: number;
          rows_skipped_non_bronx?: number;
          rows_updated?: number;
          source?: string;
        };
        Relationships: [];
      };
      bronx_resource_sources: {
        Row: {
          created_at: string;
          fields_contributed: string[];
          id: string;
          payload: Json;
          resource_id: string;
          source: string;
          source_label: string;
          source_last_seen: string;
          source_priority: number;
          source_record_id: string | null;
          source_url: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          fields_contributed?: string[];
          id?: string;
          payload?: Json;
          resource_id: string;
          source: string;
          source_label: string;
          source_last_seen?: string;
          source_priority?: number;
          source_record_id?: string | null;
          source_url?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          fields_contributed?: string[];
          id?: string;
          payload?: Json;
          resource_id?: string;
          source?: string;
          source_label?: string;
          source_last_seen?: string;
          source_priority?: number;
          source_record_id?: string | null;
          source_url?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bronx_resource_sources_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "bronx_resources";
            referencedColumns: ["id"];
          },
        ];
      };
      bronx_resources: {
        Row: {
          active: boolean;
          address: string | null;
          application_url: string | null;
          availability_status: string | null;
          borough: string;
          created_at: string;
          dedupe_key: string | null;
          description: string | null;
          eligibility: string | null;
          email: string | null;
          event_date: string | null;
          event_end_date: string | null;
          event_time: string | null;
          hours: string | null;
          how_to_apply: string | null;
          id: string;
          insurance_accepted: string | null;
          languages: string[];
          last_verified: string | null;
          latitude: number | null;
          listing_type: string;
          longitude: number | null;
          merged_into: string | null;
          needs_review: boolean;
          neighborhood: string | null;
          organization_name: string;
          phone: string | null;
          resource_category: string;
          resource_name: string | null;
          resource_subcategory: string | null;
          review_note: string | null;
          source: string | null;
          source_record_id: string | null;
          source_url: string | null;
          updated_at: string;
          verification_method: string | null;
          verification_note: string | null;
          verification_status: string;
          verified_by: string | null;
          website: string | null;
          zip_code: string | null;
        };
        Insert: {
          active?: boolean;
          address?: string | null;
          application_url?: string | null;
          availability_status?: string | null;
          borough?: string;
          created_at?: string;
          dedupe_key?: string | null;
          description?: string | null;
          eligibility?: string | null;
          email?: string | null;
          event_date?: string | null;
          event_end_date?: string | null;
          event_time?: string | null;
          hours?: string | null;
          how_to_apply?: string | null;
          id?: string;
          insurance_accepted?: string | null;
          languages?: string[];
          last_verified?: string | null;
          latitude?: number | null;
          listing_type?: string;
          longitude?: number | null;
          merged_into?: string | null;
          needs_review?: boolean;
          neighborhood?: string | null;
          organization_name: string;
          phone?: string | null;
          resource_category: string;
          resource_name?: string | null;
          resource_subcategory?: string | null;
          review_note?: string | null;
          source?: string | null;
          source_record_id?: string | null;
          source_url?: string | null;
          updated_at?: string;
          verification_method?: string | null;
          verification_note?: string | null;
          verification_status?: string;
          verified_by?: string | null;
          website?: string | null;
          zip_code?: string | null;
        };
        Update: {
          active?: boolean;
          address?: string | null;
          application_url?: string | null;
          availability_status?: string | null;
          borough?: string;
          created_at?: string;
          dedupe_key?: string | null;
          description?: string | null;
          eligibility?: string | null;
          email?: string | null;
          event_date?: string | null;
          event_end_date?: string | null;
          event_time?: string | null;
          hours?: string | null;
          how_to_apply?: string | null;
          id?: string;
          insurance_accepted?: string | null;
          languages?: string[];
          last_verified?: string | null;
          latitude?: number | null;
          listing_type?: string;
          longitude?: number | null;
          merged_into?: string | null;
          needs_review?: boolean;
          neighborhood?: string | null;
          organization_name?: string;
          phone?: string | null;
          resource_category?: string;
          resource_name?: string | null;
          resource_subcategory?: string | null;
          review_note?: string | null;
          source?: string | null;
          source_record_id?: string | null;
          source_url?: string | null;
          updated_at?: string;
          verification_method?: string | null;
          verification_note?: string | null;
          verification_status?: string;
          verified_by?: string | null;
          website?: string | null;
          zip_code?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bronx_resources_merged_into_fkey";
            columns: ["merged_into"];
            isOneToOne: false;
            referencedRelation: "bronx_resources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bronx_resources_resource_category_fkey";
            columns: ["resource_category"];
            isOneToOne: false;
            referencedRelation: "bronx_resource_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      business_events: {
        Row: {
          business_id: string;
          created_at: string;
          description: string | null;
          event_date: string | null;
          event_time: string | null;
          id: string;
          location: string | null;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          business_id: string;
          created_at?: string;
          description?: string | null;
          event_date?: string | null;
          event_time?: string | null;
          id: string;
          location?: string | null;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          description?: string | null;
          event_date?: string | null;
          event_time?: string | null;
          id?: string;
          location?: string | null;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "business_events_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      business_hiring_posts: {
        Row: {
          application_method: string;
          bronx_preferred: boolean;
          created_at: string;
          description: string;
          employer_name: string;
          fair_chance_employer: boolean;
          id: string;
          org_id: string;
          role_title: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          application_method: string;
          bronx_preferred?: boolean;
          created_at?: string;
          description: string;
          employer_name: string;
          fair_chance_employer?: boolean;
          id?: string;
          org_id: string;
          role_title: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          application_method?: string;
          bronx_preferred?: boolean;
          created_at?: string;
          description?: string;
          employer_name?: string;
          fair_chance_employer?: boolean;
          id?: string;
          org_id?: string;
          role_title?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "business_hiring_posts_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org_accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      businesses: {
        Row: {
          address: string | null;
          category: string | null;
          created_at: string;
          data: Json;
          description: string | null;
          hours: Json;
          id: string;
          latitude: number | null;
          longitude: number | null;
          name: string;
          phone: string | null;
          status: string;
          subcategory: string | null;
          tier: string;
          updated_at: string;
          verified: boolean;
          verified_date: string | null;
          website: string | null;
        };
        Insert: {
          address?: string | null;
          category?: string | null;
          created_at?: string;
          data?: Json;
          description?: string | null;
          hours?: Json;
          id: string;
          latitude?: number | null;
          longitude?: number | null;
          name: string;
          phone?: string | null;
          status?: string;
          subcategory?: string | null;
          tier?: string;
          updated_at?: string;
          verified?: boolean;
          verified_date?: string | null;
          website?: string | null;
        };
        Update: {
          address?: string | null;
          category?: string | null;
          created_at?: string;
          data?: Json;
          description?: string | null;
          hours?: Json;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          name?: string;
          phone?: string | null;
          status?: string;
          subcategory?: string | null;
          tier?: string;
          updated_at?: string;
          verified?: boolean;
          verified_date?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      community_alert_submissions: {
        Row: {
          address: string | null;
          admin_notes: string | null;
          alert_type: string;
          created_at: string;
          description: string | null;
          id: string;
          latitude: number | null;
          longitude: number | null;
          photo_url: string | null;
          severity: string;
          status: string;
          submitter_email: string | null;
          submitter_name: string | null;
          title: string;
          updated_at: string;
          user_id: string | null;
          zip_code: string | null;
        };
        Insert: {
          address?: string | null;
          admin_notes?: string | null;
          alert_type: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          photo_url?: string | null;
          severity?: string;
          status?: string;
          submitter_email?: string | null;
          submitter_name?: string | null;
          title: string;
          updated_at?: string;
          user_id?: string | null;
          zip_code?: string | null;
        };
        Update: {
          address?: string | null;
          admin_notes?: string | null;
          alert_type?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          photo_url?: string | null;
          severity?: string;
          status?: string;
          submitter_email?: string | null;
          submitter_name?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string | null;
          zip_code?: string | null;
        };
        Relationships: [];
      };
      conduct_flags: {
        Row: {
          admin_notes: string | null;
          category: string | null;
          concern: string;
          created_at: string;
          details: string;
          happened_on: string | null;
          id: string;
          money_involved: string | null;
          reporter_email: string | null;
          reporter_name: string | null;
          reporter_phone: string | null;
          resource_id: string;
          resource_name: string | null;
          resource_type: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: string;
          updated_at: string;
          willing_to_talk: boolean;
        };
        Insert: {
          admin_notes?: string | null;
          category?: string | null;
          concern: string;
          created_at?: string;
          details: string;
          happened_on?: string | null;
          id?: string;
          money_involved?: string | null;
          reporter_email?: string | null;
          reporter_name?: string | null;
          reporter_phone?: string | null;
          resource_id: string;
          resource_name?: string | null;
          resource_type?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          updated_at?: string;
          willing_to_talk?: boolean;
        };
        Update: {
          admin_notes?: string | null;
          category?: string | null;
          concern?: string;
          created_at?: string;
          details?: string;
          happened_on?: string | null;
          id?: string;
          money_involved?: string | null;
          reporter_email?: string | null;
          reporter_name?: string | null;
          reporter_phone?: string | null;
          resource_id?: string;
          resource_name?: string | null;
          resource_type?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          updated_at?: string;
          willing_to_talk?: boolean;
        };
        Relationships: [];
      };
      creator_contacts: {
        Row: {
          contact_email: string;
          created_at: string;
          creator_id: string;
          note: string | null;
        };
        Insert: {
          contact_email: string;
          created_at?: string;
          creator_id: string;
          note?: string | null;
        };
        Update: {
          contact_email?: string;
          created_at?: string;
          creator_id?: string;
          note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "creator_contacts_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: true;
            referencedRelation: "creators";
            referencedColumns: ["id"];
          },
        ];
      };
      creator_events: {
        Row: {
          action: string | null;
          creator_id: string;
          id: string;
          kind: string;
          occurred_at: string;
          target_id: string | null;
        };
        Insert: {
          action?: string | null;
          creator_id: string;
          id?: string;
          kind: string;
          occurred_at?: string;
          target_id?: string | null;
        };
        Update: {
          action?: string | null;
          creator_id?: string;
          id?: string;
          kind?: string;
          occurred_at?: string;
          target_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "creator_events_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "creators";
            referencedColumns: ["id"];
          },
        ];
      };
      creator_picks: {
        Row: {
          created_at: string;
          creator_id: string;
          id: string;
          note: string | null;
          position: number;
          target_category: string | null;
          target_id: string;
          target_name: string;
          target_type: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          creator_id: string;
          id?: string;
          note?: string | null;
          position?: number;
          target_category?: string | null;
          target_id: string;
          target_name: string;
          target_type: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          creator_id?: string;
          id?: string;
          note?: string | null;
          position?: number;
          target_category?: string | null;
          target_id?: string;
          target_name?: string;
          target_type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "creator_picks_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "creators";
            referencedColumns: ["id"];
          },
        ];
      };
      creators: {
        Row: {
          active: boolean;
          bio: string | null;
          created_at: string;
          display_name: string;
          follower_count: number | null;
          handle: string;
          id: string;
          photo_url: string | null;
          socials: Json;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          active?: boolean;
          bio?: string | null;
          created_at?: string;
          display_name: string;
          follower_count?: number | null;
          handle: string;
          id?: string;
          photo_url?: string | null;
          socials?: Json;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          active?: boolean;
          bio?: string | null;
          created_at?: string;
          display_name?: string;
          follower_count?: number | null;
          handle?: string;
          id?: string;
          photo_url?: string | null;
          socials?: Json;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      entrepreneur_leads: {
        Row: {
          contacted: boolean;
          created_at: string;
          email: string;
          help_needed: string[];
          id: string;
          idea_summary: string;
          name: string;
          notes: string | null;
          stage: string;
          updated_at: string;
        };
        Insert: {
          contacted?: boolean;
          created_at?: string;
          email: string;
          help_needed?: string[];
          id?: string;
          idea_summary: string;
          name: string;
          notes?: string | null;
          stage: string;
          updated_at?: string;
        };
        Update: {
          contacted?: boolean;
          created_at?: string;
          email?: string;
          help_needed?: string[];
          id?: string;
          idea_summary?: string;
          name?: string;
          notes?: string | null;
          stage?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      event_sources: {
        Row: {
          active: boolean;
          created_at: string;
          id: string;
          last_checked_at: string | null;
          last_message: string | null;
          last_status: string | null;
          name: string;
          url: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          id?: string;
          last_checked_at?: string | null;
          last_message?: string | null;
          last_status?: string | null;
          name: string;
          url: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          id?: string;
          last_checked_at?: string | null;
          last_message?: string | null;
          last_status?: string | null;
          name?: string;
          url?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          address: string | null;
          approval_status: string;
          category: string | null;
          community_board: number | null;
          contact: string | null;
          cost: string | null;
          created_at: string;
          description: string | null;
          event_date: string;
          event_time: string | null;
          event_type: string;
          id: string;
          image_url: string | null;
          is_community_submitted: boolean;
          is_free: boolean;
          is_verified: boolean;
          last_verified: string | null;
          location: string | null;
          neighborhood: string | null;
          organization_id: string | null;
          saves: number;
          shares: number;
          source: string | null;
          source_url: string | null;
          submitted_by: string | null;
          submitted_email: string | null;
          submitted_user_id: string | null;
          title: string;
          updated_at: string;
          verification_status: string;
          views: number;
          website: string | null;
        };
        Insert: {
          address?: string | null;
          approval_status?: string;
          category?: string | null;
          community_board?: number | null;
          contact?: string | null;
          cost?: string | null;
          created_at?: string;
          description?: string | null;
          event_date: string;
          event_time?: string | null;
          event_type?: string;
          id?: string;
          image_url?: string | null;
          is_community_submitted?: boolean;
          is_free?: boolean;
          is_verified?: boolean;
          last_verified?: string | null;
          location?: string | null;
          neighborhood?: string | null;
          organization_id?: string | null;
          saves?: number;
          shares?: number;
          source?: string | null;
          source_url?: string | null;
          submitted_by?: string | null;
          submitted_email?: string | null;
          submitted_user_id?: string | null;
          title: string;
          updated_at?: string;
          verification_status?: string;
          views?: number;
          website?: string | null;
        };
        Update: {
          address?: string | null;
          approval_status?: string;
          category?: string | null;
          community_board?: number | null;
          contact?: string | null;
          cost?: string | null;
          created_at?: string;
          description?: string | null;
          event_date?: string;
          event_time?: string | null;
          event_type?: string;
          id?: string;
          image_url?: string | null;
          is_community_submitted?: boolean;
          is_free?: boolean;
          is_verified?: boolean;
          last_verified?: string | null;
          location?: string | null;
          neighborhood?: string | null;
          organization_id?: string | null;
          saves?: number;
          shares?: number;
          source?: string | null;
          source_url?: string | null;
          submitted_by?: string | null;
          submitted_email?: string | null;
          submitted_user_id?: string | null;
          title?: string;
          updated_at?: string;
          verification_status?: string;
          views?: number;
          website?: string | null;
        };
        Relationships: [];
      };
      geocoded_locations: {
        Row: {
          address: string;
          address_key: string;
          created_at: string;
          formatted_address: string | null;
          latitude: number;
          longitude: number;
          nearest_bus_distance_m: number | null;
          nearest_bus_routes: string[];
          nearest_subway_distance_m: number | null;
          nearest_subway_lines: string[];
          nearest_subway_station: string | null;
          transit_payload: Json | null;
          updated_at: string;
        };
        Insert: {
          address: string;
          address_key: string;
          created_at?: string;
          formatted_address?: string | null;
          latitude: number;
          longitude: number;
          nearest_bus_distance_m?: number | null;
          nearest_bus_routes?: string[];
          nearest_subway_distance_m?: number | null;
          nearest_subway_lines?: string[];
          nearest_subway_station?: string | null;
          transit_payload?: Json | null;
          updated_at?: string;
        };
        Update: {
          address?: string;
          address_key?: string;
          created_at?: string;
          formatted_address?: string | null;
          latitude?: number;
          longitude?: number;
          nearest_bus_distance_m?: number | null;
          nearest_bus_routes?: string[];
          nearest_subway_distance_m?: number | null;
          nearest_subway_lines?: string[];
          nearest_subway_station?: string | null;
          transit_payload?: Json | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      internal_settings: {
        Row: {
          key: string;
          value: string;
        };
        Insert: {
          key: string;
          value: string;
        };
        Update: {
          key?: string;
          value?: string;
        };
        Relationships: [];
      };
      legal_consultation_requests: {
        Row: {
          admin_notes: string | null;
          business_name: string;
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
          id: string;
          org_id: string;
          preferred_contact: string;
          status: string;
          topic: string;
          topic_details: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          admin_notes?: string | null;
          business_name: string;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          id?: string;
          org_id: string;
          preferred_contact: string;
          status?: string;
          topic: string;
          topic_details?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          admin_notes?: string | null;
          business_name?: string;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          id?: string;
          org_id?: string;
          preferred_contact?: string;
          status?: string;
          topic?: string;
          topic_details?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "legal_consultation_requests_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org_accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      list_items: {
        Row: {
          created_at: string;
          id: string;
          list_id: string;
          note: string | null;
          position: number;
          resource_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          list_id: string;
          note?: string | null;
          position?: number;
          resource_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          list_id?: string;
          note?: string | null;
          position?: number;
          resource_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "list_items_list_id_fkey";
            columns: ["list_id"];
            isOneToOne: false;
            referencedRelation: "lists";
            referencedColumns: ["id"];
          },
        ];
      };
      listing_claims: {
        Row: {
          admin_notes: string | null;
          claimant_email: string;
          claimant_name: string;
          claimant_role: string | null;
          corrections: string | null;
          created_at: string;
          id: string;
          phone: string | null;
          resource_id: string;
          resource_name: string | null;
          status: string;
          updated_at: string;
          website: string | null;
        };
        Insert: {
          admin_notes?: string | null;
          claimant_email: string;
          claimant_name: string;
          claimant_role?: string | null;
          corrections?: string | null;
          created_at?: string;
          id?: string;
          phone?: string | null;
          resource_id: string;
          resource_name?: string | null;
          status?: string;
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          admin_notes?: string | null;
          claimant_email?: string;
          claimant_name?: string;
          claimant_role?: string | null;
          corrections?: string | null;
          created_at?: string;
          id?: string;
          phone?: string | null;
          resource_id?: string;
          resource_name?: string | null;
          status?: string;
          updated_at?: string;
          website?: string | null;
        };
        Relationships: [];
      };
      lists: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_public: boolean;
          name: string;
          share_slug: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_public?: boolean;
          name: string;
          share_slug?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_public?: boolean;
          name?: string;
          share_slug?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      newsletter_subscriptions: {
        Row: {
          confirmed: boolean;
          created_at: string;
          email: string;
          frequency: string;
          id: string;
          interests: string[];
          language: string;
          unsubscribed_at: string | null;
          updated_at: string;
          user_id: string | null;
          zip_code: string | null;
        };
        Insert: {
          confirmed?: boolean;
          created_at?: string;
          email: string;
          frequency?: string;
          id?: string;
          interests?: string[];
          language?: string;
          unsubscribed_at?: string | null;
          updated_at?: string;
          user_id?: string | null;
          zip_code?: string | null;
        };
        Update: {
          confirmed?: boolean;
          created_at?: string;
          email?: string;
          frequency?: string;
          id?: string;
          interests?: string[];
          language?: string;
          unsubscribed_at?: string | null;
          updated_at?: string;
          user_id?: string | null;
          zip_code?: string | null;
        };
        Relationships: [];
      };
      official_updates: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          org_id: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          org_id: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          org_id?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "official_updates_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org_accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      org_account_contacts: {
        Row: {
          contact_email: string;
          contact_name: string;
          contact_phone: string | null;
          contact_role: string | null;
          created_at: string;
          org_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          contact_email: string;
          contact_name: string;
          contact_phone?: string | null;
          contact_role?: string | null;
          created_at?: string;
          org_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          contact_email?: string;
          contact_name?: string;
          contact_phone?: string | null;
          contact_role?: string | null;
          created_at?: string;
          org_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "org_account_contacts_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: true;
            referencedRelation: "org_accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      org_accounts: {
        Row: {
          accessibility: string[];
          account_type: string;
          address: string | null;
          admin_notes: string | null;
          business_industry: string | null;
          category: string | null;
          created_at: string;
          dietary_tags: string[];
          district: string | null;
          ein: string | null;
          has_google_listing: boolean | null;
          has_physical_location: boolean;
          hours: Json;
          hours_mode: string;
          id: string;
          languages: string[];
          languages_other: string | null;
          mission: string | null;
          neighborhood: string | null;
          nonprofit_status: string | null;
          office_name: string | null;
          org_name: string;
          ownership_other: string | null;
          ownership_tags: string[];
          photo_url: string | null;
          population_served: string | null;
          premium: boolean;
          priority_review: boolean;
          public_phone: string | null;
          published: boolean;
          requirements: string | null;
          role_title: string | null;
          services: string | null;
          socials: Json;
          status: string;
          tier_interest: string | null;
          updated_at: string;
          user_id: string;
          verified_at: string | null;
          verified_by: string | null;
          verified_fields: Json;
          website: string | null;
          zip_code: string | null;
        };
        Insert: {
          accessibility?: string[];
          account_type: string;
          address?: string | null;
          admin_notes?: string | null;
          business_industry?: string | null;
          category?: string | null;
          created_at?: string;
          dietary_tags?: string[];
          district?: string | null;
          ein?: string | null;
          has_google_listing?: boolean | null;
          has_physical_location?: boolean;
          hours?: Json;
          hours_mode?: string;
          id?: string;
          languages?: string[];
          languages_other?: string | null;
          mission?: string | null;
          neighborhood?: string | null;
          nonprofit_status?: string | null;
          office_name?: string | null;
          org_name: string;
          ownership_other?: string | null;
          ownership_tags?: string[];
          photo_url?: string | null;
          population_served?: string | null;
          premium?: boolean;
          priority_review?: boolean;
          public_phone?: string | null;
          published?: boolean;
          requirements?: string | null;
          role_title?: string | null;
          services?: string | null;
          socials?: Json;
          status?: string;
          tier_interest?: string | null;
          updated_at?: string;
          user_id: string;
          verified_at?: string | null;
          verified_by?: string | null;
          verified_fields?: Json;
          website?: string | null;
          zip_code?: string | null;
        };
        Update: {
          accessibility?: string[];
          account_type?: string;
          address?: string | null;
          admin_notes?: string | null;
          business_industry?: string | null;
          category?: string | null;
          created_at?: string;
          dietary_tags?: string[];
          district?: string | null;
          ein?: string | null;
          has_google_listing?: boolean | null;
          has_physical_location?: boolean;
          hours?: Json;
          hours_mode?: string;
          id?: string;
          languages?: string[];
          languages_other?: string | null;
          mission?: string | null;
          neighborhood?: string | null;
          nonprofit_status?: string | null;
          office_name?: string | null;
          org_name?: string;
          ownership_other?: string | null;
          ownership_tags?: string[];
          photo_url?: string | null;
          population_served?: string | null;
          premium?: boolean;
          priority_review?: boolean;
          public_phone?: string | null;
          published?: boolean;
          requirements?: string | null;
          role_title?: string | null;
          services?: string | null;
          socials?: Json;
          status?: string;
          tier_interest?: string | null;
          updated_at?: string;
          user_id?: string;
          verified_at?: string | null;
          verified_by?: string | null;
          verified_fields?: Json;
          website?: string | null;
          zip_code?: string | null;
        };
        Relationships: [];
      };
      policy_alerts: {
        Row: {
          category: string;
          created_at: string;
          created_by: string | null;
          deadline_date: string | null;
          detail: string | null;
          expires_at: string | null;
          headline: string;
          id: string;
          kind: string;
          published: boolean;
          published_at: string | null;
          source_label: string | null;
          source_url: string | null;
          updated_at: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          created_by?: string | null;
          deadline_date?: string | null;
          detail?: string | null;
          expires_at?: string | null;
          headline: string;
          id?: string;
          kind?: string;
          published?: boolean;
          published_at?: string | null;
          source_label?: string | null;
          source_url?: string | null;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          created_by?: string | null;
          deadline_date?: string | null;
          detail?: string | null;
          expires_at?: string | null;
          headline?: string;
          id?: string;
          kind?: string;
          published?: boolean;
          published_at?: string | null;
          source_label?: string | null;
          source_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      pro_profiles: {
        Row: {
          bio: string | null;
          created_at: string;
          org_name: string;
          org_type: string | null;
          role_title: string | null;
          updated_at: string;
          user_id: string;
          verified: boolean;
        };
        Insert: {
          bio?: string | null;
          created_at?: string;
          org_name: string;
          org_type?: string | null;
          role_title?: string | null;
          updated_at?: string;
          user_id: string;
          verified?: boolean;
        };
        Update: {
          bio?: string | null;
          created_at?: string;
          org_name?: string;
          org_type?: string | null;
          role_title?: string | null;
          updated_at?: string;
          user_id?: string;
          verified?: boolean;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rate_limit_hits: {
        Row: {
          bucket: string;
          hits: number;
          key: string;
          window_start: string;
        };
        Insert: {
          bucket: string;
          hits?: number;
          key: string;
          window_start: string;
        };
        Update: {
          bucket?: string;
          hits?: number;
          key?: string;
          window_start?: string;
        };
        Relationships: [];
      };
      referrals: {
        Row: {
          client_label: string | null;
          id: string;
          note: string | null;
          pro_user_id: string;
          referred_at: string;
          resource_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          client_label?: string | null;
          id?: string;
          note?: string | null;
          pro_user_id: string;
          referred_at?: string;
          resource_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          client_label?: string | null;
          id?: string;
          note?: string | null;
          pro_user_id?: string;
          referred_at?: string;
          resource_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      resource_notes: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          resource_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          resource_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          resource_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      resource_packs: {
        Row: {
          created_at: string;
          note: string | null;
          resource_ids: string[];
          slug: string;
          views: number;
        };
        Insert: {
          created_at?: string;
          note?: string | null;
          resource_ids: string[];
          slug: string;
          views?: number;
        };
        Update: {
          created_at?: string;
          note?: string | null;
          resource_ids?: string[];
          slug?: string;
          views?: number;
        };
        Relationships: [];
      };
      resource_reports: {
        Row: {
          created_at: string;
          details: string | null;
          id: string;
          reason: string;
          reporter_email: string | null;
          resolution_note: string | null;
          resolved_at: string | null;
          resource_id: string;
          resource_name: string | null;
          resource_type: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          details?: string | null;
          id?: string;
          reason: string;
          reporter_email?: string | null;
          resolution_note?: string | null;
          resolved_at?: string | null;
          resource_id: string;
          resource_name?: string | null;
          resource_type: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          details?: string | null;
          id?: string;
          reason?: string;
          reporter_email?: string | null;
          resolution_note?: string | null;
          resolved_at?: string | null;
          resource_id?: string;
          resource_name?: string | null;
          resource_type?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      resource_requests: {
        Row: {
          category: string | null;
          created_at: string;
          id: string;
          need: string;
          neighborhood: string | null;
          note: string | null;
          status: string;
          user_id: string | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          id?: string;
          need: string;
          neighborhood?: string | null;
          note?: string | null;
          status?: string;
          user_id?: string | null;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          id?: string;
          need?: string;
          neighborhood?: string | null;
          note?: string | null;
          status?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      resource_verifications: {
        Row: {
          address: string | null;
          address_ok: boolean | null;
          category: string | null;
          checked_at: string;
          created_at: string;
          formatted_address: string | null;
          google_place_id: string | null;
          last_verified_date: string | null;
          phone: string | null;
          phone_ok: boolean | null;
          places_ok: boolean | null;
          resource_id: string;
          resource_name: string | null;
          updated_at: string;
          verification_issues: string[];
          verified: boolean;
        };
        Insert: {
          address?: string | null;
          address_ok?: boolean | null;
          category?: string | null;
          checked_at?: string;
          created_at?: string;
          formatted_address?: string | null;
          google_place_id?: string | null;
          last_verified_date?: string | null;
          phone?: string | null;
          phone_ok?: boolean | null;
          places_ok?: boolean | null;
          resource_id: string;
          resource_name?: string | null;
          updated_at?: string;
          verification_issues?: string[];
          verified?: boolean;
        };
        Update: {
          address?: string | null;
          address_ok?: boolean | null;
          category?: string | null;
          checked_at?: string;
          created_at?: string;
          formatted_address?: string | null;
          google_place_id?: string | null;
          last_verified_date?: string | null;
          phone?: string | null;
          phone_ok?: boolean | null;
          places_ok?: boolean | null;
          resource_id?: string;
          resource_name?: string | null;
          updated_at?: string;
          verification_issues?: string[];
          verified?: boolean;
        };
        Relationships: [];
      };
      resources: {
        Row: {
          accessibility: string[];
          address: string;
          application_url: string | null;
          availability_status: string | null;
          category: string;
          community_board: number | null;
          created_at: string;
          description: string;
          description_i18n: Json;
          dietary: string[];
          distance: number;
          free: boolean;
          heritage: string[];
          hours: string;
          hours_i18n: Json;
          how_to_apply: string | null;
          id: string;
          insurance_accepted: string | null;
          is_active: boolean;
          keywords: string[];
          languages: string[];
          last_verified: string | null;
          minor_eligibility: string | null;
          name: string;
          name_i18n: Json;
          neighborhood: string | null;
          open_now: boolean;
          organization_id: string | null;
          ownership: string[];
          phone: string;
          requirements_i18n: Json | null;
          source: string | null;
          source_url: string | null;
          subcategory: string | null;
          submitted_by: string | null;
          translated_langs: string[];
          updated_at: string;
          verification_status: string;
          verify_every_days: number;
          website: string | null;
        };
        Insert: {
          accessibility?: string[];
          address?: string;
          application_url?: string | null;
          availability_status?: string | null;
          category: string;
          community_board?: number | null;
          created_at?: string;
          description?: string;
          description_i18n?: Json;
          dietary?: string[];
          distance?: number;
          free?: boolean;
          heritage?: string[];
          hours?: string;
          hours_i18n?: Json;
          how_to_apply?: string | null;
          id: string;
          insurance_accepted?: string | null;
          is_active?: boolean;
          keywords?: string[];
          languages?: string[];
          last_verified?: string | null;
          minor_eligibility?: string | null;
          name: string;
          name_i18n?: Json;
          neighborhood?: string | null;
          open_now?: boolean;
          organization_id?: string | null;
          ownership?: string[];
          phone?: string;
          requirements_i18n?: Json | null;
          source?: string | null;
          source_url?: string | null;
          subcategory?: string | null;
          submitted_by?: string | null;
          translated_langs?: string[];
          updated_at?: string;
          verification_status?: string;
          verify_every_days?: number;
          website?: string | null;
        };
        Update: {
          accessibility?: string[];
          address?: string;
          application_url?: string | null;
          availability_status?: string | null;
          category?: string;
          community_board?: number | null;
          created_at?: string;
          description?: string;
          description_i18n?: Json;
          dietary?: string[];
          distance?: number;
          free?: boolean;
          heritage?: string[];
          hours?: string;
          hours_i18n?: Json;
          how_to_apply?: string | null;
          id?: string;
          insurance_accepted?: string | null;
          is_active?: boolean;
          keywords?: string[];
          languages?: string[];
          last_verified?: string | null;
          minor_eligibility?: string | null;
          name?: string;
          name_i18n?: Json;
          neighborhood?: string | null;
          open_now?: boolean;
          organization_id?: string | null;
          ownership?: string[];
          phone?: string;
          requirements_i18n?: Json | null;
          source?: string | null;
          source_url?: string | null;
          subcategory?: string | null;
          submitted_by?: string | null;
          translated_langs?: string[];
          updated_at?: string;
          verification_status?: string;
          verify_every_days?: number;
          website?: string | null;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          rating: number;
          resource_id: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          rating: number;
          resource_id: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          rating?: number;
          resource_id?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      saved_resources: {
        Row: {
          created_at: string;
          id: string;
          note: string | null;
          resource_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          note?: string | null;
          resource_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          note?: string | null;
          resource_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      scraped_events: {
        Row: {
          created_at: string;
          dedupe_key: string;
          description: string | null;
          duplicate_note: string | null;
          event_date: string;
          event_time: string | null;
          event_url: string | null;
          id: string;
          location: string | null;
          possible_duplicate: boolean;
          published_resource_id: string | null;
          reviewed_at: string | null;
          source_id: string | null;
          status: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          dedupe_key: string;
          description?: string | null;
          duplicate_note?: string | null;
          event_date: string;
          event_time?: string | null;
          event_url?: string | null;
          id?: string;
          location?: string | null;
          possible_duplicate?: boolean;
          published_resource_id?: string | null;
          reviewed_at?: string | null;
          source_id?: string | null;
          status?: string;
          title: string;
        };
        Update: {
          created_at?: string;
          dedupe_key?: string;
          description?: string | null;
          duplicate_note?: string | null;
          event_date?: string;
          event_time?: string | null;
          event_url?: string | null;
          id?: string;
          location?: string | null;
          possible_duplicate?: boolean;
          published_resource_id?: string | null;
          reviewed_at?: string | null;
          source_id?: string | null;
          status?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scraped_events_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "event_sources";
            referencedColumns: ["id"];
          },
        ];
      };
      sponsored_placements: {
        Row: {
          active: boolean;
          body: string | null;
          category: string | null;
          created_at: string;
          cta_label: string | null;
          cta_url: string | null;
          ends_at: string | null;
          headline: string;
          id: string;
          placement: string;
          priority: number;
          sponsor_name: string;
          starts_at: string | null;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          body?: string | null;
          category?: string | null;
          created_at?: string;
          cta_label?: string | null;
          cta_url?: string | null;
          ends_at?: string | null;
          headline: string;
          id?: string;
          placement: string;
          priority?: number;
          sponsor_name: string;
          starts_at?: string | null;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          body?: string | null;
          category?: string | null;
          created_at?: string;
          cta_label?: string | null;
          cta_url?: string | null;
          ends_at?: string | null;
          headline?: string;
          id?: string;
          placement?: string;
          priority?: number;
          sponsor_name?: string;
          starts_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      traffic_alerts: {
        Row: {
          address: string | null;
          alert_type: string;
          created_at: string;
          description: string | null;
          ends_at: string | null;
          id: string;
          is_resolved: boolean;
          latitude: number | null;
          longitude: number | null;
          severity: string;
          source: string;
          starts_at: string;
          title: string;
          updated_at: string;
          zip_codes: string[];
        };
        Insert: {
          address?: string | null;
          alert_type: string;
          created_at?: string;
          description?: string | null;
          ends_at?: string | null;
          id?: string;
          is_resolved?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          severity?: string;
          source?: string;
          starts_at?: string;
          title: string;
          updated_at?: string;
          zip_codes?: string[];
        };
        Update: {
          address?: string | null;
          alert_type?: string;
          created_at?: string;
          description?: string | null;
          ends_at?: string | null;
          id?: string;
          is_resolved?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          severity?: string;
          source?: string;
          starts_at?: string;
          title?: string;
          updated_at?: string;
          zip_codes?: string[];
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      verification_job_state: {
        Row: {
          id: string;
          last_error: string | null;
          last_run_at: string | null;
          lease_until: string | null;
          processed_last_run: number;
          status: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          last_error?: string | null;
          last_run_at?: string | null;
          lease_until?: string | null;
          processed_last_run?: number;
          status?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          last_error?: string | null;
          last_run_at?: string | null;
          lease_until?: string | null;
          processed_last_run?: number;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      verification_policies: {
        Row: {
          category: string;
          note: string | null;
          updated_at: string;
          verify_every_days: number;
        };
        Insert: {
          category: string;
          note?: string | null;
          updated_at?: string;
          verify_every_days?: number;
        };
        Update: {
          category?: string;
          note?: string | null;
          updated_at?: string;
          verify_every_days?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      admin_event_submissions: {
        Args: never;
        Returns: {
          approval_status: string;
          created_at: string;
          id: string;
          submitted_by: string;
          submitted_email: string;
          submitted_user_id: string;
          title: string;
        }[];
      };
      all_org_accounts_admin: {
        Args: never;
        Returns: {
          accessibility: string[];
          account_type: string;
          address: string | null;
          admin_notes: string | null;
          business_industry: string | null;
          category: string | null;
          created_at: string;
          dietary_tags: string[];
          district: string | null;
          ein: string | null;
          has_google_listing: boolean | null;
          has_physical_location: boolean;
          hours: Json;
          hours_mode: string;
          id: string;
          languages: string[];
          languages_other: string | null;
          mission: string | null;
          neighborhood: string | null;
          nonprofit_status: string | null;
          office_name: string | null;
          org_name: string;
          ownership_other: string | null;
          ownership_tags: string[];
          photo_url: string | null;
          population_served: string | null;
          premium: boolean;
          priority_review: boolean;
          public_phone: string | null;
          published: boolean;
          requirements: string | null;
          role_title: string | null;
          services: string | null;
          socials: Json;
          status: string;
          tier_interest: string | null;
          updated_at: string;
          user_id: string;
          verified_at: string | null;
          verified_by: string | null;
          verified_fields: Json;
          website: string | null;
          zip_code: string | null;
        }[];
        SetofOptions: {
          from: "*";
          to: "org_accounts";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      category_performance: {
        Args: { _days?: number };
        Returns: {
          category: string;
          clicks: number;
          conversion_rate: number;
          views: number;
        }[];
      };
      event_submission_stats: { Args: { _weeks?: number }; Returns: Json };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      hit_rate_limit: {
        Args: {
          _bucket: string;
          _key: string;
          _limit: number;
          _window_seconds: number;
        };
        Returns: boolean;
      };
      my_org_accounts: {
        Args: never;
        Returns: {
          accessibility: string[];
          account_type: string;
          address: string | null;
          admin_notes: string | null;
          business_industry: string | null;
          category: string | null;
          created_at: string;
          dietary_tags: string[];
          district: string | null;
          ein: string | null;
          has_google_listing: boolean | null;
          has_physical_location: boolean;
          hours: Json;
          hours_mode: string;
          id: string;
          languages: string[];
          languages_other: string | null;
          mission: string | null;
          neighborhood: string | null;
          nonprofit_status: string | null;
          office_name: string | null;
          org_name: string;
          ownership_other: string | null;
          ownership_tags: string[];
          photo_url: string | null;
          population_served: string | null;
          premium: boolean;
          priority_review: boolean;
          public_phone: string | null;
          published: boolean;
          requirements: string | null;
          role_title: string | null;
          services: string | null;
          socials: Json;
          status: string;
          tier_interest: string | null;
          updated_at: string;
          user_id: string;
          verified_at: string | null;
          verified_by: string | null;
          verified_fields: Json;
          website: string | null;
          zip_code: string | null;
        }[];
        SetofOptions: {
          from: "*";
          to: "org_accounts";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      search_analytics: { Args: { _days?: number }; Returns: Json };
      top_resources: { Args: { _limit?: number }; Returns: Json };
      top_shared_resources: {
        Args: { _limit?: number };
        Returns: {
          category: string;
          other_shares: number;
          resource_id: string;
          sms_shares: number;
          total_shares: number;
          whatsapp_shares: number;
        }[];
      };
    };
    Enums: {
      app_role: "admin" | "moderator" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const;
