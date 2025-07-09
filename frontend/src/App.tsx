import React, { useState, useRef, useEffect, useCallback, useMemo, lazy } from 'react';
import './App.css';
import { apiLogin, apiSignup, apiGet, apiPost, apiDelete } from './api';
import type { Indicator, IndicatorState } from './types';

// const AuthModal = lazy(() => import('./AuthModal'));
// const UserMenu = lazy(() => import('./UserMenu'));
const BotBuilderPanel = lazy(() => import('./BotBuilderPanel'));
const ChatPanel = lazy(() => import('./ChatPanel'));

const DEFAULT_INDICATORS = [
  { name: 'Relative Strength Index (RSI)', param: 'Period', min: 2, max: 50, default: 14 },
  { name: 'Moving Average Convergence Divergence (MACD)', param: 'Fast EMA', min: 2, max: 20, default: 12 },
  { name: 'Simple Moving Average (SMA)', param: 'Period', min: 2, max: 200, default: 20 },
  { name: 'Exponential Moving Average (EMA)', param: 'Period', min: 2, max: 200, default: 20 },
  { name: 'Bollinger Bands', param: 'Period', min: 2, max: 50, default: 20 },
  { name: 'Stochastic Oscillator', param: 'K Period', min: 2, max: 50, default: 14 },
  { name: 'Average True Range (ATR)', param: 'Period', min: 2, max: 50, default: 14 },
  { name: 'Commodity Channel Index (CCI)', param: 'Period', min: 2, max: 50, default: 20 },
  { name: 'Rate of Change (ROC)', param: 'Period', min: 2, max: 50, default: 12 },
  { name: 'Williams %R', param: 'Period', min: 2, max: 50, default: 14 },
  { name: 'Parabolic SAR', param: 'Step', min: 0.01, max: 0.1, default: 0.02, step: 0.01 },
  { name: 'Ichimoku Cloud', param: 'Conversion Line', min: 2, max: 20, default: 9 },
  { name: 'Volume Weighted Average Price (VWAP)', param: 'Session', min: 1, max: 10, default: 1 },
  { name: 'Pivot Points', param: 'Period', min: 1, max: 30, default: 1 },
  { name: 'Donchian Channel', param: 'Period', min: 2, max: 50, default: 20 },
  { name: 'Keltner Channel', param: 'Period', min: 2, max: 50, default: 20 },
  { name: 'Chande Momentum Oscillator (CMO)', param: 'Period', min: 2, max: 50, default: 14 },
  { name: 'Detrended Price Oscillator (DPO)', param: 'Period', min: 2, max: 50, default: 20 },
  { name: 'Elder Ray Index', param: 'Period', min: 2, max: 50, default: 13 },
  { name: 'Force Index', param: 'Period', min: 2, max: 50, default: 13 },
  { name: 'Gann Fan', param: 'Angle', min: 10, max: 90, default: 45 },
  { name: 'Hull Moving Average (HMA)', param: 'Period', min: 2, max: 200, default: 20 },
  { name: 'Money Flow Index (MFI)', param: 'Period', min: 2, max: 50, default: 14 },
  { name: 'On-Balance Volume (OBV)', param: 'N/A', min: 0, max: 0, default: 0 },
  { name: 'Price Oscillator', param: 'Short Period', min: 2, max: 50, default: 12 },
  { name: 'Price Rate of Change', param: 'Period', min: 2, max: 50, default: 12 },
  { name: 'Standard Deviation', param: 'Period', min: 2, max: 50, default: 20 },
  { name: 'TRIX', param: 'Period', min: 2, max: 50, default: 15 },
  { name: 'Ultimate Oscillator', param: 'Short Period', min: 2, max: 10, default: 7 },
  { name: 'Vortex Indicator', param: 'Period', min: 2, max: 50, default: 14 },
];

// Remove BotConfigSummary component definition from this file

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [indicatorStates, setIndicatorStates] = useState<IndicatorState[]>([]);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am your Vibe Coding assistant. Describe what you want to change about your bot.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch bot config and indicators on login
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    Promise.all([
      apiGet('/bot/config', token),
      apiGet('/indicators', token)
    ]).then(([botConfig, indicatorsList]) => {
      setIndicators(indicatorsList);
      if (botConfig && botConfig.indicators) {
        setIndicatorStates(botConfig.indicators.map((ind: any) => ({ enabled: ind.enabled, value: ind.value })));
      } else {
        setIndicatorStates([]);
      }
    }).catch(() => {
      setError('Failed to load bot config or indicators.');
    }).finally(() => setLoading(false));
  }, [token]);

  // Save bot config to backend when indicatorStates change (and user is logged in)
  useEffect(() => {
    if (!token || indicators.length === 0 || indicatorStates.length === 0) return;
    // Compose config
    const config = {
      indicators: indicators.map((ind, idx) => ({
        name: ind.name,
        param: ind.param,
        value: indicatorStates[idx]?.value,
        enabled: indicatorStates[idx]?.enabled
      }))
    };
    apiPost('/bot/config', config, token).catch(() => {
      setError('Failed to save bot config.');
    });
  }, [indicatorStates, indicators, token]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleLogin = useCallback((username: string, token: string) => {
    setUser(username);
    setToken(token);
  }, []);
  const handleLogout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  // Memoize indicator handlers
  const handleAddIndicator = useCallback(async (indicator: any) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const newInd = await apiPost('/indicators', indicator, token);
      setIndicators(prev => [...prev, newInd]);
      setIndicatorStates(prev => [...prev, { enabled: false, value: newInd.default }]);
    } catch {
      setError('Failed to add indicator.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleRemoveIndicator = useCallback(async (name: string, idx: number) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await apiDelete(`/indicators/${encodeURIComponent(name)}`, token);
      setIndicators(prev => prev.filter((_, i) => i !== idx));
      setIndicatorStates(prev => prev.filter((_, i) => i !== idx));
    } catch {
      setError('Failed to remove indicator.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleToggle = useCallback((idx: number) => {
    setIndicatorStates(states =>
      states.map((s, i) => i === idx ? { ...s, enabled: !s.enabled } : s)
    );
  }, []);
  const handleSlider = useCallback((idx: number, value: number) => {
    setIndicatorStates(states =>
      states.map((s, i) => i === idx ? { ...s, value } : s)
    );
  }, []);

  // Memoize props for panels
  const botBuilderPanelProps = useMemo(() => ({
    indicators,
    indicatorStates,
    setIndicators,
    setIndicatorStates,
    token,
    onAddIndicator: handleAddIndicator,
    onRemoveIndicator: handleRemoveIndicator,
    onToggle: handleToggle,
    onSlider: handleSlider
  }), [indicators, indicatorStates, setIndicators, setIndicatorStates, token, handleAddIndicator, handleRemoveIndicator, handleToggle, handleSlider]);

  const chatPanelProps = useMemo(() => ({
    indicators,
    indicatorStates,
    setIndicatorStates,
    setMessages,
    messages,
    token
  }), [indicators, indicatorStates, setIndicatorStates, setMessages, messages, token]);

  return (
    <div className="main-layout">
      {loading && <div className="loading-overlay">Loading...</div>}
      {error && <div className="error-overlay">{error}</div>}
      <BotBuilderPanel {...botBuilderPanelProps} />
      <ChatPanel {...chatPanelProps} />
    </div>
  );
};

export default App;
