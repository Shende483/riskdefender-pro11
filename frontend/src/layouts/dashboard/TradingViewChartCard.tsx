import { useEffect, useRef, useState, MutableRefObject, RefObject } from 'react';
import { Box, Button, Grid } from '@mui/material';
import { Brightness4 } from '@mui/icons-material';
import { initialSymbols } from './tradingview/SymbolDefine';

let tvScriptLoadingPromise: Promise<void> | undefined;

export default function TradingviewChartAndData() {
  const onLoadScriptRef: MutableRefObject<(() => void) | null> = useRef(null);
  const cardRef: RefObject<HTMLDivElement> = useRef(null);

  const [theme, setTheme] = useState<string>('dark');
  const [currentSymbol, setCurrentSymbol] = useState<string>(initialSymbols[0]); // Default to BTCUSDT
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 850,
    height: 570
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (cardRef.current) {
        setDimensions({
          width: cardRef.current.clientWidth,
          height: cardRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise
      .then(() => {
        if (onLoadScriptRef.current) {
          onLoadScriptRef.current();
        }
      })
      .catch((err) => console.error('TradingView script failed to load:', err));

    return () => {
      onLoadScriptRef.current = null;
    };

    function createWidget() {
      if (document.getElementById('tradingview_e5aee') && (window as any).TradingView) {
        (window as any).TradingView.widget({
          width: dimensions.width,
          height: dimensions.height,
          symbol: `BINANCE:${currentSymbol}.P`,
          interval: 'M',
          timezone: 'Etc/UTC',
          theme,
          style: '1',
          locale: 'en',
          enable_publishing: false,
          withdateranges: true,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          watchlist: initialSymbols.map((sym) => `BINANCE:${sym}.P`),
          details: true,
          hotlist: true,
          calendar: true,
          show_popup_button: true,
          container_id: 'tradingview_e5aee'
        });
      } else {
        console.error('TradingView is not available.');
      }
    }
  }, [theme, currentSymbol, dimensions]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <Box ref={cardRef} sx={{ height: 670, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Grid container className="tradingview-widget-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Button
          variant="text"
          size="small"
          onClick={toggleTheme}
          style={{
            position: 'absolute',
            top: 4,
            right: 180,
            zIndex: 10,
            backgroundColor: 'transparent',
            color: theme === 'dark' ? 'white' : 'black',
            padding: '5px 10px',
            fontSize: '13px',
            boxShadow: 'none',
            outline: 'none',
            border: 'none',
            minWidth: 'auto'
          }}
        >
          <Brightness4 fontSize="small" />
        </Button>

        <Grid item xs={12} md={12} style={{ width: '100%', height: '100%' }}>
          <div id="tradingview_e5aee" style={{ width: '100%', height: '100%', position: 'relative' }} />
        </Grid>
      </Grid>
    </Box>
  );
};
