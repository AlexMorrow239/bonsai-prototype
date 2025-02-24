import type { FileSystemEntity } from "@/types/filesystem";

// Helper function to create timestamps within the last month
const getRandomDate = () => {
  const now = new Date();
  const pastDate = new Date(
    now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000
  );
  return pastDate.toISOString();
};

// Root level folders
export const rootFolder: FileSystemEntity = {
  _id: "root",
  name: "Root",
  originalName: "Root",
  mimeType: "folder",
  size: 0,
  parentFolderId: null,
  isFolder: true,
  isTrashed: false,
  path: "/",
  isStarred: false,
  isActive: true,
  createdAt: getRandomDate(),
  updatedAt: getRandomDate(),
};

// Mock file system data
export const mockFileSystem: FileSystemEntity[] = [
  // Documents folder
  {
    _id: "folder-1",
    name: "Documents",
    originalName: "Documents",
    mimeType: "folder",
    size: 0,
    parentFolderId: null,
    isFolder: true,
    isTrashed: false,
    path: "/Documents",
    isStarred: true,
    isActive: true,
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
  },
  // Documents contents
  {
    _id: "file-1",
    name: "Project Proposal.docx",
    originalName: "Project Proposal.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 2500000,
    s3Key: "documents/project-proposal.docx",
    s3Url: "https://example.com/documents/project-proposal.docx",
    parentFolderId: "folder-1",
    isFolder: false,
    isTrashed: false,
    path: "/Documents/Project Proposal.docx",
    isStarred: true,
    isActive: true,
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    customMetadata: {
      author: "Alex Smith",
      version: "1.2",
    },
  },

  // Images folder
  {
    _id: "folder-2",
    name: "Images",
    originalName: "Images",
    mimeType: "folder",
    size: 0,
    parentFolderId: null,
    isFolder: true,
    isTrashed: false,
    path: "/Images",
    isStarred: false,
    isActive: true,
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
  },
  // Vacation subfolder
  {
    _id: "folder-2-1",
    name: "Vacation 2024",
    originalName: "Vacation 2024",
    mimeType: "folder",
    size: 0,
    parentFolderId: "folder-2",
    isFolder: true,
    isTrashed: false,
    path: "/Images/Vacation 2024",
    isStarred: false,
    isActive: true,
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
  },
  // Vacation images
  {
    _id: "file-2",
    name: "Beach Sunset.jpg",
    originalName: "IMG_12345.jpg",
    mimeType: "image/jpeg",
    size: 5000000,
    s3Key: "images/beach-sunset.jpg",
    s3Url: "https://example.com/images/beach-sunset.jpg",
    parentFolderId: "folder-2-1",
    isFolder: false,
    isTrashed: false,
    path: "/Images/Vacation 2024/Beach Sunset.jpg",
    isStarred: true,
    isActive: true,
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    customMetadata: {
      location: "Maui, Hawaii",
      camera: "iPhone 14 Pro",
    },
  },

  // Projects folder
  {
    _id: "folder-3",
    name: "Projects",
    originalName: "Projects",
    mimeType: "folder",
    size: 0,
    parentFolderId: null,
    isFolder: true,
    isTrashed: false,
    path: "/Projects",
    isStarred: false,
    isActive: true,
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
  },
  // Project subfolders
  {
    _id: "folder-3-1",
    name: "Website Redesign",
    originalName: "Website Redesign",
    mimeType: "folder",
    size: 0,
    parentFolderId: "folder-3",
    isFolder: true,
    isTrashed: false,
    path: "/Projects/Website Redesign",
    isStarred: false,
    isActive: true,
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
  },
  // Project files
  {
    _id: "file-3",
    name: "design-mockup.fig",
    originalName: "design-mockup.fig",
    mimeType: "application/figma",
    size: 15000000,
    s3Key: "projects/design-mockup.fig",
    s3Url: "https://example.com/projects/design-mockup.fig",
    parentFolderId: "folder-3-1",
    isFolder: false,
    isTrashed: false,
    path: "/Projects/Website Redesign/design-mockup.fig",
    isStarred: false,
    isActive: true,
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
  },

  // Trashed items
  {
    _id: "file-4",
    name: "old-notes.txt",
    originalName: "old-notes.txt",
    mimeType: "text/plain",
    size: 1024,
    s3Key: "trash/old-notes.txt",
    s3Url: "https://example.com/trash/old-notes.txt",
    parentFolderId: null,
    isFolder: false,
    isTrashed: true,
    trashedDate: new Date(),
    path: "/old-notes.txt",
    isStarred: false,
    isActive: false,
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
  },
  {
    _id: "folder-4",
    name: "Archive 2023",
    originalName: "Archive 2023",
    mimeType: "folder",
    size: 0,
    parentFolderId: null,
    isFolder: true,
    isTrashed: true,
    trashedDate: new Date(),
    path: "/Archive 2023",
    isStarred: false,
    isActive: false,
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
  },

  // Downloads folder with mixed content
  {
    _id: "folder-5",
    name: "Downloads",
    originalName: "Downloads",
    mimeType: "folder",
    size: 0,
    parentFolderId: null,
    isFolder: true,
    isTrashed: false,
    path: "/Downloads",
    isStarred: false,
    isActive: true,
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
  },
  {
    _id: "file-5",
    name: "presentation.pdf",
    originalName: "Q1_Results_2024.pdf",
    mimeType: "application/pdf",
    size: 3500000,
    s3Key: "downloads/presentation.pdf",
    s3Url: "https://example.com/downloads/presentation.pdf",
    parentFolderId: "folder-5",
    isFolder: false,
    isTrashed: false,
    path: "/Downloads/presentation.pdf",
    isStarred: false,
    isActive: true,
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    customMetadata: {
      department: "Sales",
      quarter: "Q1",
      year: "2024",
    },
  },
];

// Helper function to get files by parent folder ID
export const getFilesByParentId = (
  parentFolderId: string | null
): FileSystemEntity[] => {
  return mockFileSystem.filter(
    (item) => item.parentFolderId === parentFolderId && !item.isTrashed
  );
};

// Helper function to get trashed items
export const getTrashedItems = (): FileSystemEntity[] => {
  return mockFileSystem.filter((item) => item.isTrashed);
};

// Helper function to get starred items
export const getStarredItems = (): FileSystemEntity[] => {
  return mockFileSystem.filter((item) => item.isStarred);
};
