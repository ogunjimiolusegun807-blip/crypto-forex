import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Simple polling-based ticker using CoinGecko (no API key) and exchangerate.host for fiat pairs.
// - Polls every `interval` ms (default 8000)
// - Accepts `symbols` like [ { id: 'bitcoin', label: 'BTC/USD', pair: 'usd' }, ... ]
// - Pauses when document is hidden or on hover

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3/simple/price';

export default function CryptoTicker({ symbols = [], interval = 8000 }) {
  const theme = useTheme();
  const [items, setItems] = useState([]);
  const pollingRef = useRef(null);
  const mounted = useRef(true);
  const containerRef = useRef(null);

  const fetchPrices = useCallback(async () => {
    try {
      if (!symbols || symbols.length === 0) return;
      // Group by coingecko ids and fiat pairs
      const cgIds = symbols.filter(s => s.source !== 'fiat').map(s => s.id).filter(Boolean);
      const fiatPairs = symbols.filter(s => s.source === 'fiat');
      const results = [];

      if (cgIds.length) {
        const ids = Array.from(new Set(cgIds)).join(',');
        const vs = Array.from(new Set(symbols.map(s => s.pair || 'usd'))).join(',');
        const url = `${COINGECKO_BASE}?ids=${ids}&vs_currencies=${vs}&include_24hr_change=true`;
        const res = await fetch(url);
        const json = await res.json();
        symbols.forEach(s => {
          if (s.source === 'fiat') return; // skip fiat here
          const price = json[s.id] ? json[s.id][s.pair || 'usd'] : undefined;
          const changeKey = `${s.pair || 'usd'}_24h_change`;
          const change = json[s.id] ? json[s.id][`${s.pair || 'usd'}_24h_change`] : undefined;
          results.push({
            key: `${s.id}_${s.pair || 'usd'}`,
            label: s.label,
            price: price !== undefined ? formatNumber(price) : 'N/A',
            change: change !== undefined ? formatChange(change) : '',
            rawChange: change,
          });
        });
      }

      // handle fiat pairs via exchangerate.host or keep as static
      for (const s of fiatPairs) {
        try {
          const r = await fetch(`https://api.exchangerate.host/latest?base=${s.base || 'USD'}&symbols=${s.symbol || 'EUR'}`);
          const j = await r.json();
          const price = j && j.rates ? j.rates[s.symbol] : undefined;
          results.push({
            key: `fiat_${s.base || 'USD'}_${s.symbol}`,
            label: s.label,
            price: price !== undefined ? formatNumber(price) : 'N/A',
            change: '',
            rawChange: undefined,
          });
        } catch (e) {
          results.push({ key: `fiat_${s.base}_${s.symbol}`, label: s.label, price: 'N/A', change: '', rawChange: undefined });
        }
      }

      if (!mounted.current) return;
      setItems(results);
    } catch (e) {
      // ignore errors silently; keep previous items
      console.error('Ticker fetch error', e);
    }
  }, [symbols]);

  useEffect(() => {
    mounted.current = true;
    const start = async () => {
      await fetchPrices();
      if (!mounted.current) return;
      pollingRef.current = setInterval(() => {
        if (document.hidden) return; // don't poll when tab hidden
        fetchPrices();
      }, interval);
    };
    start();
    return () => {
      mounted.current = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchPrices, interval]);

  // formatting helpers
  function formatNumber(num) {
    if (num === null || num === undefined) return 'N/A';
    if (Math.abs(num) >= 1000) return Number(num).toLocaleString(undefined, { maximumFractionDigits: 2 });
    return Number(num).toFixed(2);
  }
  function formatChange(c) {
    if (c === null || c === undefined) return '';
    const fixed = Number(c).toFixed(2);
    const sign = Number(c) >= 0 ? '+' : '';
    return `${sign}${fixed}%`;
  }

  // marquee effect: duplicate items to create continuous scroll
  return (
    <Box
      ref={containerRef}
      onMouseEnter={() => { if (containerRef.current) containerRef.current.style.animationPlayState = 'paused'; }}
      onMouseLeave={() => { if (containerRef.current) containerRef.current.style.animationPlayState = 'running'; }}
      sx={{
        width: '100%',
        overflow: 'hidden',
        bgcolor: '#181A20',
        borderRadius: 2,
        p: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            alignItems: 'center',
            whiteSpace: 'nowrap',
            animation: 'scroll-left 20s linear infinite',
            '& > div': { display: 'inline-flex', alignItems: 'center', gap: 1 }
          }}
        >
          {items.concat(items).map((it, idx) => (
            <Box key={`${it.key}_${idx}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, minWidth: 90 }}>
                {it.label}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 800, color: '#fff', minWidth: 90 }}>
                {it.price}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: it.rawChange >= 0 ? theme.palette.success.main : theme.palette.error.main }}>
                {it.change}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </Box>
  );
}
