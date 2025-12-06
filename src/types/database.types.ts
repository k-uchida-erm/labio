export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      activities: {
        Row: {
          actual_hours: number | null;
          completed_at: string | null;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          due_date: string | null;
          estimated_hours: number | null;
          id: string;
          lab_id: string;
          position: number;
          project_id: string;
          sequence_number: number;
          started_at: string | null;
          status: Database['public']['Enums']['activity_status'];
          title: string;
          type: Database['public']['Enums']['activity_type'];
          updated_at: string;
        };
        Insert: {
          actual_hours?: number | null;
          completed_at?: string | null;
          created_at?: string;
          created_by: string;
          deleted_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          estimated_hours?: number | null;
          id?: string;
          lab_id: string;
          position?: number;
          project_id: string;
          sequence_number: number;
          started_at?: string | null;
          status?: Database['public']['Enums']['activity_status'];
          title: string;
          type?: Database['public']['Enums']['activity_type'];
          updated_at?: string;
        };
        Update: {
          actual_hours?: number | null;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          estimated_hours?: number | null;
          id?: string;
          lab_id?: string;
          position?: number;
          project_id?: string;
          sequence_number?: number;
          started_at?: string | null;
          status?: Database['public']['Enums']['activity_status'];
          title?: string;
          type?: Database['public']['Enums']['activity_type'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'activities_lab_id_fkey';
            columns: ['lab_id'];
            isOneToOne: false;
            referencedRelation: 'labs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activities_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      activity_tags: {
        Row: {
          activity_id: string;
          created_at: string;
          id: string;
          tag_id: string;
        };
        Insert: {
          activity_id: string;
          created_at?: string;
          id?: string;
          tag_id: string;
        };
        Update: {
          activity_id?: string;
          created_at?: string;
          id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_tags_activity_id_fkey';
            columns: ['activity_id'];
            isOneToOne: false;
            referencedRelation: 'activities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activity_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
        ];
      };
      ai_summaries: {
        Row: {
          activity_ids: string[];
          completion_tokens: number | null;
          content: string;
          created_at: string;
          created_by: string;
          date_from: string | null;
          date_to: string | null;
          id: string;
          lab_id: string;
          marp_content: string | null;
          model: string;
          project_id: string | null;
          prompt_tokens: number | null;
          slide_url: string | null;
          tag_ids: string[] | null;
          title: string;
        };
        Insert: {
          activity_ids: string[];
          completion_tokens?: number | null;
          content: string;
          created_at?: string;
          created_by: string;
          date_from?: string | null;
          date_to?: string | null;
          id?: string;
          lab_id: string;
          marp_content?: string | null;
          model: string;
          project_id?: string | null;
          prompt_tokens?: number | null;
          slide_url?: string | null;
          tag_ids?: string[] | null;
          title: string;
        };
        Update: {
          activity_ids?: string[];
          completion_tokens?: number | null;
          content?: string;
          created_at?: string;
          created_by?: string;
          date_from?: string | null;
          date_to?: string | null;
          id?: string;
          lab_id?: string;
          marp_content?: string | null;
          model?: string;
          project_id?: string | null;
          prompt_tokens?: number | null;
          slide_url?: string | null;
          tag_ids?: string[] | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_summaries_lab_id_fkey';
            columns: ['lab_id'];
            isOneToOne: false;
            referencedRelation: 'labs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ai_summaries_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      attachments: {
        Row: {
          activity_id: string | null;
          comment_id: string | null;
          created_at: string;
          file_name: string;
          file_size: number;
          id: string;
          mime_type: string;
          storage_path: string;
          uploaded_by: string;
        };
        Insert: {
          activity_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
          file_name: string;
          file_size: number;
          id?: string;
          mime_type: string;
          storage_path: string;
          uploaded_by: string;
        };
        Update: {
          activity_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
          file_name?: string;
          file_size?: number;
          id?: string;
          mime_type?: string;
          storage_path?: string;
          uploaded_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'attachments_activity_id_fkey';
            columns: ['activity_id'];
            isOneToOne: false;
            referencedRelation: 'activities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'attachments_comment_id_fkey';
            columns: ['comment_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
        ];
      };
      comments: {
        Row: {
          activity_id: string;
          content: string;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          id: string;
          parent_id: string | null;
          updated_at: string;
        };
        Insert: {
          activity_id: string;
          content: string;
          created_at?: string;
          created_by: string;
          deleted_at?: string | null;
          id?: string;
          parent_id?: string | null;
          updated_at?: string;
        };
        Update: {
          activity_id?: string;
          content?: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          id?: string;
          parent_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_activity_id_fkey';
            columns: ['activity_id'];
            isOneToOne: false;
            referencedRelation: 'activities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
        ];
      };
      lab_invitations: {
        Row: {
          accepted_at: string | null;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string;
          is_owner: boolean;
          lab_id: string;
          status: Database['public']['Enums']['invitation_status'];
          token: string;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string;
          email: string;
          expires_at: string;
          id?: string;
          invited_by: string;
          is_owner?: boolean;
          lab_id: string;
          status?: Database['public']['Enums']['invitation_status'];
          token: string;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string;
          is_owner?: boolean;
          lab_id?: string;
          status?: Database['public']['Enums']['invitation_status'];
          token?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lab_invitations_lab_id_fkey';
            columns: ['lab_id'];
            isOneToOne: false;
            referencedRelation: 'labs';
            referencedColumns: ['id'];
          },
        ];
      };
      lab_members: {
        Row: {
          id: string;
          is_owner: boolean;
          joined_at: string;
          lab_id: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          is_owner?: boolean;
          joined_at?: string;
          lab_id: string;
          user_id: string;
        };
        Update: {
          id?: string;
          is_owner?: boolean;
          joined_at?: string;
          lab_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lab_members_lab_id_fkey';
            columns: ['lab_id'];
            isOneToOne: false;
            referencedRelation: 'labs';
            referencedColumns: ['id'];
          },
        ];
      };
      labs: {
        Row: {
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          id: string;
          is_personal: boolean;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          is_personal?: boolean;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          is_personal?: boolean;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          email: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          email: string;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          email?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          assignee_id: string | null;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          end_date: string | null;
          id: string;
          is_archived: boolean;
          key: string;
          lab_id: string;
          start_date: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          assignee_id?: string | null;
          created_at?: string;
          created_by: string;
          deleted_at?: string | null;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          is_archived?: boolean;
          key: string;
          lab_id: string;
          start_date?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          assignee_id?: string | null;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          is_archived?: boolean;
          key?: string;
          lab_id?: string;
          start_date?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'projects_lab_id_fkey';
            columns: ['lab_id'];
            isOneToOne: false;
            referencedRelation: 'labs';
            referencedColumns: ['id'];
          },
        ];
      };
      tags: {
        Row: {
          color: string;
          created_at: string;
          created_by: string;
          id: string;
          lab_id: string;
          name: string;
        };
        Insert: {
          color?: string;
          created_at?: string;
          created_by: string;
          id?: string;
          lab_id: string;
          name: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          lab_id?: string;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tags_lab_id_fkey';
            columns: ['lab_id'];
            isOneToOne: false;
            referencedRelation: 'labs';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_invitation_token: { Args: never; Returns: string };
      generate_slug: { Args: { name: string }; Returns: string };
      get_lab_statistics: { Args: { target_lab_id: string }; Returns: Json };
      is_lab_admin: { Args: { target_lab_id: string }; Returns: boolean };
      is_lab_member: { Args: { target_lab_id: string }; Returns: boolean };
      is_lab_owner: { Args: { target_lab_id: string }; Returns: boolean };
      is_project_assignee: {
        Args: { target_project_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      activity_status: 'todo' | 'in_progress' | 'in_review' | 'done';
      activity_type: 'task' | 'experiment' | 'question' | 'review' | 'meeting' | 'note';
      invitation_status: 'pending' | 'accepted' | 'declined' | 'expired';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      activity_status: ['todo', 'in_progress', 'in_review', 'done'],
      activity_type: ['task', 'experiment', 'question', 'review', 'meeting', 'note'],
      invitation_status: ['pending', 'accepted', 'declined', 'expired'],
    },
  },
} as const;
