import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

export default function LiveTicker() {
  const [prices, setPrices] = useState({
    nasdaq: null,
    eurusd: null,
    btcusd: null,
    ethusd: null,
    gbpusd: null,
    usdjpy: null,
  });

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const btc = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd').then(res => res.json());
        const eth = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd').then(res => res.json());
        setPrices({
          nasdaq: '24,344.8',
          eurusd: '1.18099',
          btcusd: btc.bitcoin.usd,
          ethusd: eth.ethereum.usd,
          gbpusd: '1.2500',
          usdjpy: '149.50',
        });
      } catch (e) {
        setPrices(prv => ({ ...prv, btcusd: '...', ethusd: '...' }));
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const tickerItems = [
    { label: 'Nasdaq 100', value: prices.nasdaq || '24,344.8', color: '#fff' },
    { label: 'EUR/USD', value: prices.eurusd || '1.18099', color: '#fff' },
    { label: 'BTC/USD', value: prices.btcusd || '...', color: '#00B386' },
    { label: 'ETH/USD', value: prices.ethusd || '...', color: '#00B386' },
    { label: 'GBP/USD', value: prices.gbpusd || '1.2500', color: '#fff' },
    { label: 'USD/JPY', value: prices.usdjpy || '149.50', color: '#fff' },
    { label: 'AAPL', value: '$170', color: '#00B386' },
    { label: 'TSLA', value: '$250', color: '#00B386' },
  ];

  const tickerBarStyles = {
    position: 'relative',
    width: '100%',
    maxWidth: { xs: '100vw', sm: 700, md: 900 },
    margin: '0 auto',
    overflow: 'hidden',
    bgcolor: '#181A20',
    px: { xs: 1, sm: 2 },
    py: 1.5,
    borderRadius: 2,
    mb: 3,
    boxShadow: 1,
    height: { xs: 40, sm: 44 },
    display: 'flex',
    alignItems: 'center',
  };
  const tickerTrackStyles = {
    display: 'flex',
    alignItems: 'center',
    animation: 'ticker-scroll-ltr 30s linear infinite',
    minWidth: '100%',
    gap: { xs: 1, sm: 2 },
  };
  const tickerKeyframes = `@keyframes ticker-scroll-ltr { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }`;

  return (
    <>
      <style>{tickerKeyframes}</style>
      <Box sx={tickerBarStyles}>
        <Box sx={tickerTrackStyles}>
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.5, sm: 1.5 },
                minWidth: { xs: 110, sm: 140 },
                flexDirection: 'row',
                textAlign: 'left',
                px: { xs: 0.5, sm: 1 },
                fontSize: { xs: '0.8rem', sm: '1rem' },
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>{item.label}:</Typography>
              <Typography variant="body1" fontWeight={700} sx={{ color: item.color, fontSize: { xs: '0.8rem', sm: '1rem' } }}>{item.value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
}
