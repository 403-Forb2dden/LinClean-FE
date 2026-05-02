import { createContext, useCallback, useContext, useState } from 'react';

export interface Folder {
  id: number;
  name: string;
}

interface FoldersContextValue {
  folders: Folder[];
  addFolder: (name: string) => number;
  renameFolder: (id: number, name: string) => void;
  deleteFolder: (id: number) => void;
}

const MOCK_FOLDERS: Folder[] = [
  { id: 1, name: '맛집 정보' },
  { id: 2, name: '취업' },
  { id: 3, name: '취미' },
];

let nextId = MOCK_FOLDERS.length + 1;

const FoldersContext = createContext<FoldersContextValue | null>(null);

export function FoldersProvider({ children }: { children: React.ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);

  const addFolder = useCallback((name: string): number => {
    // TODO: 백엔드 연동 시 POST /api/v1/categories { name } 호출 후 응답 id로 교체
    const id = nextId++;
    setFolders((prev) => [...prev, { id, name }]);
    return id;
  }, []);

  const renameFolder = useCallback((id: number, name: string) => {
    // TODO: PATCH /api/v1/categories/{id}
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
  }, []);

  const deleteFolder = useCallback((id: number) => {
    // TODO: DELETE /api/v1/categories/{id}
    setFolders((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return (
    <FoldersContext.Provider value={{ folders, addFolder, renameFolder, deleteFolder }}>
      {children}
    </FoldersContext.Provider>
  );
}

export function useFolders(): FoldersContextValue {
  const ctx = useContext(FoldersContext);
  if (!ctx) throw new Error('useFolders must be used within FoldersProvider');
  return ctx;
}
