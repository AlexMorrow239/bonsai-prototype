// Base type without database fields
export interface NewProject {
  name: string;
  description: string;
}

// Full type including database fields
export interface Project extends NewProject {
  _id: string;
  created_at: string;
  updated_at: string;
}

// List item type
export interface ProjectListItem extends Project {
  // Same as Project for now, but could be different in the future
}
