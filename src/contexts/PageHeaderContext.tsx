import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface PageHeaderContent {
  /** Custom JSX to render in the header breadcrumb area */
  element: ReactNode | null;
}

interface PageHeaderContextType {
  header: PageHeaderContent;
  setHeaderContent: (element: ReactNode | null) => void;
}

const PageHeaderContext = createContext<PageHeaderContextType>({
  header: { element: null },
  setHeaderContent: () => {},
});

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeader] = useState<PageHeaderContent>({ element: null });

  const setHeaderContent = useCallback((element: ReactNode | null) => {
    setHeader({ element });
  }, []);

  return (
    <PageHeaderContext.Provider value={{ header, setHeaderContent }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader() {
  return useContext(PageHeaderContext);
}
