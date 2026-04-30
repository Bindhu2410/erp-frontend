import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CompanyContextType {
    companyId?: number;
    setCompanyId: (id: number) => void;
}

const CompanyContext = createContext<CompanyContextType>({
    companyId: undefined,
    setCompanyId: () => {},
});

export const useCompanyContext = () => useContext(CompanyContext);

interface CompanyProviderProps {
    children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
    const [companyId, setCompanyId] = useState<number | undefined>();

    return (
        <CompanyContext.Provider value={{ companyId, setCompanyId }}>
            {children}
        </CompanyContext.Provider>
    );
};
