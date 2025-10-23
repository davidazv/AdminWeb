export interface HelpRequest {
  id: number;
  user_id: number;
  user_name?: string;
  title: string;
  description: string;
  priority: "urgent" | "normal" | "low";
  status: "pending" | "in_progress" | "resolved" | "closed";
  admin_response?: string;
  assigned_admin_id?: number;
  assigned_admin_name?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateHelpRequest {
  title: string;
  description: string;
  priority: "urgent" | "normal" | "low";
}

export interface RespondHelpRequest {
  admin_response: string;
  status: "pending" | "in_progress" | "resolved" | "closed";
}