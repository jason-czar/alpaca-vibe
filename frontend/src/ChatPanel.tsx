import React, { useState, useRef, useEffect } from 'react';
import type { Indicator, IndicatorState } from './types';
import { apiPost } from './api';

function ChatPanel({
  indicators,
  indicatorStates,
  setIndicatorStates,
  setMessages,
  messages,
  token
}: {
  indicators: Indicator[],
  indicatorStates: IndicatorState[],
  setIndicatorStates: React.Dispatch<React.SetStateAction<IndicatorState[]>>,
  setMessages: React.Dispatch<React.SetStateAction<{ sender: string; text: string }[]>>,
  messages: { sender: string; text: string }[],
  token: string | null
}) {
  const [input, setInput] = useState('');
  const [backtestResult, setBacktestResult] = useState<string | null>(null);
  const [trading, setTrading] = useState(false);
  const [tradeLogs, setTradeLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !token) return;
    setMessages(msgs => [
      ...msgs,
      { sender: 'user', text: input }
    ]);
    setLoading(true);
    setError(null);
    try {
      // Send chat to backend
      const config = {
        indicators: indicators.map((ind, idx) => ({
          name: ind.name,
          param: ind.param,
          value: indicatorStates[idx]?.value,
          enabled: indicatorStates[idx]?.enabled
        }))
      };
      const res = await apiPost('/chat', { message: input, config }, token);
      setMessages(msgs => [
        ...msgs,
        { sender: 'bot', text: res.response || '(No response)' }
      ]);
      // Optionally update config if backend returns it
      if (res.updated_config && res.updated_config.indicators) {
        setIndicatorStates(res.updated_config.indicators.map((ind: any) => ({ enabled: ind.enabled, value: ind.value })));
      }
    } catch {
      setError('Failed to send chat.');
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleBacktest = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    setBacktestResult(null);
    try {
      const config = {
        indicators: indicators.map((ind, idx) => ({
          name: ind.name,
          param: ind.param,
          value: indicatorStates[idx]?.value,
          enabled: indicatorStates[idx]?.enabled
        }))
      };
      const res = await apiPost('/backtest', config, token);
      setBacktestResult(res.result || 'No result');
    } catch {
      setError('Failed to run backtest.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrading = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const config = {
        indicators: indicators.map((ind, idx) => ({
          name: ind.name,
          param: ind.param,
          value: indicatorStates[idx]?.value,
          enabled: indicatorStates[idx]?.enabled
        }))
      };
      const res = await apiPost('/trade/start', config, token);
      setTrading(true);
      setTradeLogs(logs => [...logs, res.status || 'Trading started.']);
    } catch {
      setError('Failed to start trading.');
    } finally {
      setLoading(false);
    }
  };

  const handleStopTrading = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost('/trade/stop', {}, token);
      setTrading(false);
      setTradeLogs(logs => [...logs, res.status || 'Trading stopped.']);
    } catch {
      setError('Failed to stop trading.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="chat-panel" aria-label="Vibe Coding Chat Panel">
      <h2 tabIndex={0}>Vibe Coding Chat</h2>
      {loading && <div className="loading-overlay" aria-live="polite">Loading...</div>}
      {error && <div className="error-overlay" aria-live="polite">{error}</div>}
      <div className="chat-messages" role="log" aria-live="polite" aria-label="Chat Messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.sender}`} role="article" tabIndex={0} aria-label={`${msg.sender === 'user' ? 'User' : 'Bot'} message`}>
            <span>{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input-form" onSubmit={handleSend} aria-label="Chat Input">
        <input
          type="text"
          placeholder="Type your request..."
          value={input}
          onChange={e => setInput(e.target.value)}
          className="chat-input"
          disabled={loading}
          aria-label="Chat input"
          tabIndex={0}
        />
        <button type="submit" className="chat-send-btn" disabled={loading} tabIndex={0}>Send</button>
      </form>
      <div className="backtest-section" aria-label="Backtest Section">
        <button className="backtest-btn" onClick={handleBacktest} disabled={loading} tabIndex={0}>Run Backtest</button>
        <div className="backtest-result" aria-live="polite">{backtestResult}</div>
      </div>
      <div className="trading-section" aria-label="Trading Section">
        <div className="trading-controls">
          <button className="trading-btn start" onClick={handleStartTrading} disabled={trading || loading} tabIndex={0}>Start Trading</button>
          <button className="trading-btn stop" onClick={handleStopTrading} disabled={!trading || loading} tabIndex={0}>Stop Trading</button>
        </div>
        <div className="trade-logs" aria-label="Trade Logs and Performance">
          <strong>Trade Logs & Performance:</strong>
          <ul>
            {tradeLogs.length === 0 ? (
              <li className="trade-log-placeholder">No trades yet. (This is a placeholder.)</li>
            ) : (
              tradeLogs.map((log, i) => <li key={i} tabIndex={0}>{log}</li>)
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default ChatPanel; 