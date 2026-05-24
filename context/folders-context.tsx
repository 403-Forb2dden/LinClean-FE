import { useAuth } from '@clerk/expo';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import {
  createCategory,
  deleteCategory,
  fetchCategories,
  renameCategory,
  type CategoryCreateRequest,
  type CategoryResponse,
} from '@/api/categories';

const LOGIN_REQUIRED_MESSAGE =
  '로그인 상태를 확인할 수 없습니다. 다시 로그인한 뒤 시도해주세요.';

export type Folder = CategoryResponse;

interface FoldersContextValue {
  folders: Folder[];
  isLoading: boolean;
  errorMessage: string;
  refreshFolders: () => Promise<void>;
  addFolder: (name: string, linkIds?: number[]) => Promise<Folder>;
  renameFolder: (id: number, name: string) => Promise<void>;
  deleteFolder: (id: number) => Promise<void>;
}

const FoldersContext = createContext<FoldersContextValue | null>(null);

export function FoldersProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const getTokenRef = useRef(getToken);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const refreshFolders = useCallback(async () => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setFolders([]);
      setErrorMessage(LOGIN_REQUIRED_MESSAGE);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetchCategories(() => getTokenRef.current());
      setFolders(sortFolders(response.items));
    } catch (error) {
      setErrorMessage(getFolderErrorMessage(error, '폴더 목록을 불러오지 못했습니다.'));
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setFolders([]);
      setErrorMessage('');
      return;
    }

    void refreshFolders();
  }, [isLoaded, isSignedIn, refreshFolders]);

  const addFolder = useCallback(async (name: string, linkIds: number[] = []) => {
    const request: CategoryCreateRequest = {
      name,
      ...(linkIds.length > 0 ? { linkIds } : {}),
    };

    const folder = await createCategory(() => getTokenRef.current(), request);
    setFolders((prev) => sortFolders([...prev.filter((item) => item.id !== folder.id), folder]));
    setErrorMessage('');
    return folder;
  }, []);

  const renameFolder = useCallback(async (id: number, name: string) => {
    const previousFolders = folders;
    setFolders((prev) =>
      prev.map((folder) => (folder.id === id ? { ...folder, name } : folder)),
    );

    try {
      const response = await renameCategory(() => getTokenRef.current(), id, name);
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === response.id ? { ...folder, name: response.name } : folder,
        ),
      );
      setErrorMessage('');
    } catch (error) {
      setFolders(previousFolders);
      throw error;
    }
  }, [folders]);

  const deleteFolder = useCallback(async (id: number) => {
    const previousFolders = folders;
    setFolders((prev) => prev.filter((folder) => folder.id !== id));

    try {
      await deleteCategory(() => getTokenRef.current(), id);
      setErrorMessage('');
    } catch (error) {
      setFolders(previousFolders);
      throw error;
    }
  }, [folders]);

  return (
    <FoldersContext.Provider
      value={{
        folders,
        isLoading,
        errorMessage,
        refreshFolders,
        addFolder,
        renameFolder,
        deleteFolder,
      }}
    >
      {children}
    </FoldersContext.Provider>
  );
}

export function useFolders(): FoldersContextValue {
  const ctx = useContext(FoldersContext);
  if (!ctx) throw new Error('useFolders must be used within FoldersProvider');
  return ctx;
}

export function getFolderErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error) {
    if (error.message === 'Missing Clerk session token') {
      return LOGIN_REQUIRED_MESSAGE;
    }

    if (error.message) {
      return error.message;
    }
  }

  return fallbackMessage;
}

function sortFolders(folders: Folder[]) {
  return [...folders].sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }

    return a.id - b.id;
  });
}
