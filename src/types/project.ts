export interface Project {
  project_id: number;
  name: string;
  description: string;
  created_at: string;
  last_accessed: string;
}

// Project list item (simplified version for lists/previews)
export interface ProjectListItem {
  project_id: number;
  name: string;
  description: string;
  created_at: string;
  is_active: boolean;
}
