import { createContext, useContext, useState } from 'react';

export const initialSymbols = [
  'BTCUSDT', 'BTCUSDT.P', 'BINANCE:ETHUSDT.P', 'BINANCE:BNBUSDT.P',
  'BINANCE:XRPUSDT.P', 'BINANCE:ADAUSDT.P', 'BINANCE:SOLUSDT.P',
  'BINANCE:DOGEUSDT.P', 'BINANCE:MATICUSDT.P', 'BINANCE:DOTUSDT.P',
  'BINANCE:AVAXUSDT.P', 'BINANCE:LTCUSDT.P', 'BINANCE:LINKUSDT.P',
  'BINANCE:QARUSDT.P', 'BINANCE:AEDUSDT.P', 'BINANCE:SARUSDT.P',
  'BINANCE:KZTUSDT.P', 'BINANCE:NGNUSDT.P', 'BINANCE:UAHUSDT.P',
  'BINANCE:PKRUSDT.P', 'BINANCE:KESUSDT.P', 'BINANCE:TZSUSDT.P'
];

const SymbolContext = createContext();

export const SymbolProvider = ({ children }: { children: React.ReactNode }) => {
  const [symbol, setSymbol] = useState(initialSymbols[0]);

  return (
    <SymbolContext.Provider value={{ symbol, setSymbol }}>
      {children}
    </SymbolContext.Provider>
  );
};

export const useSymbol = () => {
  const context = useContext(SymbolContext);
  if (context === undefined) {
    throw new Error('useSymbol must be used within a SymbolProvider');
  }
  return context;
};
