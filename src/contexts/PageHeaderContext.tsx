import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface PageHeaderContent {
  /** Custom JSX to render in the header breadcrumb area */
  element: ReactNode | null;
  /** Custom JSX for secondary navigation (tabs) */
  secondaryNav?: ReactNode | null;
}

interface PageHeaderContextType {
  header: PageHeaderContent;
  setHeaderContent: (element: ReactNode | null, secondaryNav?: ReactNode | null) => void;
}

const PageHeaderContext = createContext<PageHeaderContextType>({
  header: { element: null, secondaryNav: null },
  setHeaderContent: () => {},
});

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeader] = useState<PageHeaderContent>({ element: null, secondaryNav: null });

  const setHeaderContent = useCallback((element: ReactNode | null, secondaryNav?: ReactNode | null) => {
    setHeader({ element, secondaryNav });
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
