import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Compact polling-based crypto/forex ticker
// Props:
//  - symbols: array of { id, label, pair, source } where source='coingecko' (default) or 'fiat'
//  - interval: polling interval in ms

const COINGECKO = 'https://api.coingecko.com/api/v3/simple/price';
export default function CryptoTicker({ symbols = [], interval = 8000 }) {
  const theme = useTheme();
  const [items, setItems] = useState([]);
  const mounted = useRef(true);
  const pollRef = useRef(null);

  const fetchPrices = useCallback(async () => {
    if (!symbols || symbols.length === 0) return;
    try {
      const cgSymbols = symbols.filter(s => !s.source || s.source === 'coingecko');
      const fiatSymbols = symbols.filter(s => s.source === 'fiat');
      const results = [];

      if (cgSymbols.length) {
        const ids = Array.from(new Set(cgSymbols.map(s => s.id))).join(',');
        const vs = Array.from(new Set(cgSymbols.map(s => s.pair || 'usd'))).join(',');
        const res = await fetch(`${COINGECKO}?ids=${ids}&vs_currencies=${vs}&include_24hr_change=true`);
        const json = await res.json();
        cgSymbols.forEach(s => {
          const price = json[s.id] ? json[s.id][s.pair || 'usd'] : undefined;
          const change = json[s.id] ? json[s.id][`${s.pair || 'usd'}_24h_change`] : undefined;
          results.push({ key: `${s.id}_${s.pair||'usd'}`, label: s.label, price, change });
        });
      }

      for (const s of fiatSymbols) {
        try {
          const r = await fetch(`https://api.exchangerate.host/latest?base=${s.base||'USD'}&symbols=${s.symbol}`);
          const j = await r.json();
          const price = j && j.rates ? j.rates[s.symbol] : undefined;
          results.push({ key: `fiat_${s.base}_${s.symbol}`, label: s.label, price, change: undefined });
        } catch (e) {
          results.push({ key: `fiat_${s.base}_${s.symbol}`, label: s.label, price: undefined, change: undefined });
        }
      }

      if (!mounted.current) return;
      setItems(results.map(r => ({
        ...r,
        priceText: formatPrice(r.price),
        changeText: formatChange(r.change)
      })));
    } catch (e) {
      // silent fail - keep previous items
      console.debug('CryptoTicker fetch error', e);
    }
  }, [symbols]);

  useEffect(() => {
    mounted.current = true;
    fetchPrices();
    pollRef.current = setInterval(() => {
      if (document.hidden) return;
      fetchPrices();
    }, interval);
    return () => { mounted.current = false; if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchPrices, interval]);

  function formatPrice(p) {
    if (p === undefined || p === null) return 'N/A';
    if (typeof p === 'number' && Math.abs(p) >= 1000) return Number(p).toLocaleString(undefined, { maximumFractionDigits: 2 });
    return typeof p === 'number' ? Number(p).toFixed(2) : String(p);
  }
  function formatChange(c) {
    if (c === undefined || c === null) return '';
    const num = Number(c);
    if (Number.isNaN(num)) return '';
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  }

  // compact sizes
  const duration = Math.max(8, Math.min(40, Math.floor((items.length || 4) * 4)));

  return (
    <Box sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, bgcolor: '#181A20', px: { xs: 0.5, sm: 1 }, py: { xs: 0.25, sm: 0.5 }, height: { xs: 28, sm: 34, md: 38 } }}
      onMouseEnter={e => { e.currentTarget.style.animationPlayState = 'paused'; }}
      onMouseLeave={e => { e.currentTarget.style.animationPlayState = 'running'; }}
    >
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, alignItems: 'center', whiteSpace: 'nowrap', animation: `scroll-left ${duration}s linear infinite` }}>
          {items.concat(items).map((it, i) => (
            <Box key={`${it.key}_${i}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: { xs: 1, sm: 1.5 }, flexShrink: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, minWidth: { xs: 50, sm: 70 }, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>{it.label}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#fff', minWidth: { xs: 50, sm: 70 }, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>{it.priceText}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: (it.change || 0) >= 0 ? theme.palette.success.main : theme.palette.error.main, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>{it.changeText}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
      <style>{`@keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
    </Box>
  );
}
