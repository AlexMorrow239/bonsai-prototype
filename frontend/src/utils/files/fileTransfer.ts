// Handle file transfer and directory reading operations
export async function getAllFilesFromDataTransfer(
  dataTransfer: DataTransfer
): Promise<File[]> {
  let files: File[] = [];

  if (dataTransfer.items.length > 0) {
    files = await getAllFilesFromDataTransferItems(dataTransfer.items);
  } else if (dataTransfer.files.length > 0) {
    files = Array.from(dataTransfer.files);
  }

  return files.filter((file) => !file.name.startsWith("."));
}

async function getAllFilesFromDataTransferItems(
  items: DataTransferItemList
): Promise<File[]> {
  const files: File[] = [];

  async function traverseFileTree(entry: FileSystemEntry) {
    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry;
      const file = await new Promise<File>((resolve, reject) => {
        fileEntry.file(resolve, reject);
      });
      files.push(file);
    } else if (entry.isDirectory) {
      const dirEntry = entry as FileSystemDirectoryEntry;
      const dirReader = dirEntry.createReader();
      const entries = await readAllDirectoryEntries(dirReader);
      await Promise.all(entries.map((e) => traverseFileTree(e)));
    }
  }

  await Promise.all(
    Array.from(items).map((item) => {
      const entry = item.webkitGetAsEntry();
      return entry ? traverseFileTree(entry) : Promise.resolve();
    })
  );

  return files;
}

async function readAllDirectoryEntries(
  dirReader: FileSystemDirectoryReader
): Promise<FileSystemEntry[]> {
  const entries: FileSystemEntry[] = [];
  let readEntries = await readDirectoryEntries(dirReader);

  while (readEntries.length > 0) {
    entries.push(...readEntries);
    readEntries = await readDirectoryEntries(dirReader);
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
