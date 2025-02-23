// Handle file transfer and directory reading operations
export async function getAllFilesFromDataTransfer(
  source: DataTransfer | HTMLInputElement
): Promise<File[]> {
  let files: File[] = [];

  // Handle input element
  if (source instanceof HTMLInputElement) {
    files = Array.from(source.files || []);
    return files.filter((file) => !file.name.startsWith("."));
  }

  // Handle drag and drop
  if (source.items?.length > 0) {
    // Use DataTransferItemList API for better directory support
    const entries = await Promise.all(
      Array.from(source.items).map((item) => {
        const entry = item.webkitGetAsEntry();
        return entry ? traverseFileTree(entry) : [];
      })
    );
    files = entries.flat();
  } else if (source.files?.length > 0) {
    files = Array.from(source.files);
  }

  return files.filter((file) => !file.name.startsWith("."));
}

async function traverseFileTree(entry: FileSystemEntry): Promise<File[]> {
  const files: File[] = [];

  if (!entry) {
    return files;
  }

  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntry;
    try {
      const file = await getFileFromEntry(fileEntry);
      // Only add if it's actually a file (not a directory)
      if (file.size > 0 || file.type) {
        files.push(file);
      }
    } catch (error) {
      console.error("Error reading file:", error);
    }
  } else if (entry.isDirectory) {
    const dirEntry = entry as FileSystemDirectoryEntry;
    const entries = await readAllDirectoryEntries(dirEntry.createReader());

    // Recursively process directory contents
    const dirFiles = await Promise.all(entries.map((e) => traverseFileTree(e)));
    files.push(...dirFiles.flat());
  }

  return files;
}

function getFileFromEntry(fileEntry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => {
    fileEntry.file(resolve, reject);
  });
}

async function readAllDirectoryEntries(
  dirReader: FileSystemDirectoryReader
): Promise<FileSystemEntry[]> {
  const entries: FileSystemEntry[] = [];
  let readEntries: FileSystemEntry[];

  try {
    // Keep reading entries until no more are returned
    do {
      readEntries = await readDirectoryEntries(dirReader);
      entries.push(...readEntries);
    } while (readEntries.length > 0);
  } catch (error) {
    console.error("Error reading directory entries:", error);
  }

  return entries;
}

function readDirectoryEntries(
  dirReader: FileSystemDirectoryReader
): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => {
    dirReader.readEntries(resolve, reject);
  });
}
