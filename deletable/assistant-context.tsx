import { createContext, useContext, type ReactNode } from "react";

export interface QuoteAssistantContextType {
  askQuestion: (question: string, description?: string) => void;
  openAssistant: () => void;
}

const QuoteAssistantContext = createContext<QuoteAssistantContextType | null>(null);

export function useQuoteAssistant() {
  const context = useContext(QuoteAssistantContext);
  if (!context) {
    throw new Error("useQuoteAssistant must be used within QuoteAssistantProvider");
  }
  return context;
}

export function useQuoteAssistantSafe() {
  return useContext(QuoteAssistantContext);
}

interface QuoteAssistantProviderProps {
  children: ReactNode;
  value: QuoteAssistantContextType;
}

export function QuoteAssistantProvider({ children, value }: QuoteAssistantProviderProps) {
  return (
    <QuoteAssistantContext.Provider value={value}>
      {children}
    </QuoteAssistantContext.Provider>
  );
}
