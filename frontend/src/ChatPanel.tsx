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
    <section className="chat-panel">
      <div className="chat-header">
        <h1 className="chat-title">AI Assistant</h1>
        <p className="chat-subtitle">Chat with your AI trading assistant to configure and optimize your bot</p>
      </div>
      
      {error && <div className="error-overlay" aria-live="polite">{error}</div>}
      
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-container">
        <input
          type="text"
          placeholder="Ask me anything about your trading bot..."
          value={input}
          onChange={e => setInput(e.target.value)}
          className="chat-input"
          disabled={loading}
          onKeyPress={e => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
        />
        <button 
          onClick={handleSend} 
          className="send-btn" 
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
      
      <div className="action-panels">
        <div className="action-panel backtest">
          <h3 className="action-title backtest">Backtest</h3>
          <button 
            className="action-btn backtest" 
            onClick={handleBacktest} 
            disabled={loading}
          >
            Run Backtest
          </button>
          <div className="action-result">
            {backtestResult || 'No backtest results yet'}
          </div>
        </div>
        
        <div className="action-panel trading">
          <h3 className="action-title trading">Live Trading</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button 
              className="action-btn start" 
              onClick={handleStartTrading} 
              disabled={trading || loading}
            >
              Start
            </button>
            <button 
              className="action-btn stop" 
              onClick={handleStopTrading} 
              disabled={!trading || loading}
            >
              Stop
            </button>
          </div>
          <div className="trade-logs">
            <ul>
              {tradeLogs.length === 0 ? (
                <li className="trade-log-placeholder">No trades yet</li>
              ) : (
                tradeLogs.map((log, i) => <li key={i}>{log}</li>)
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ChatPanel; 