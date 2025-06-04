
export interface Database {
  public: {
    Tables: {
      certificates: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          certificate_number: string;
          issued_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          certificate_number: string;
          issued_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          certificate_number?: string;
          issued_date?: string;
          created_at?: string;
        };
      };
      gamification: {
        Row: {
          user_id: string;
          points: number;
          level: number;
          badges: string[];
          achievements: string[];
          streak_days: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          points?: number;
          level?: number;
          badges?: string[];
          achievements?: string[];
          streak_days?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          points?: number;
          level?: number;
          badges?: string[];
          achievements?: string[];
          streak_days?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      checklists: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          tasks: any;
          progress_percentage: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          tasks?: any;
          progress_percentage?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          tasks?: any;
          progress_percentage?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      library_documents: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string;
          file_url: string;
          file_type: string;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category: string;
          file_url: string;
          file_type: string;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          file_url?: string;
          file_type?: string;
          uploaded_by?: string;
          created_at?: string;
        };
      };
    };
  };
}
