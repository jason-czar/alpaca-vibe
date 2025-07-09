import React, { useState, useRef, useEffect } from 'react';
import type { Indicator, IndicatorState } from './types';
import { apiPost } from './api';
import { TradingActionProcessor } from './TradingActionProcessor';
import { initializeAlpacaService } from './AlpacaService';
import BacktestPanel from './BacktestPanel';

function ChatPanel({
  indicators,
  indicatorStates,
  setIndicatorStates,
  setIndicators,
  token
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBacktest, setShowBacktest] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize Alpaca service (in demo mode for now)
  useEffect(() => {
    // Initialize with demo/paper trading credentials
    // In production, these would come from environment variables or user settings
    initializeAlpacaService({
      apiKey: process.env.REACT_APP_ALPACA_API_KEY || 'demo_key',
      secretKey: process.env.REACT_APP_ALPACA_SECRET_KEY || 'demo_secret',
      paper: true, // Always use paper trading for demo
    });
  }, []);

  // Create trading action processor instance
  const actionProcessor = new TradingActionProcessor(
    indicators,
    indicatorStates,
    setIndicatorStates,
    setIndicators
  );

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !token) return;
    
    const userMessage = input.trim();
    setMessages(msgs => [
      ...msgs,
      { sender: 'user', text: userMessage }
    ]);
    
    setLoading(true);
    setError(null);
    setInput('');
    
    try {
      // Process the message for actions
      const { response: actionResponse, actions } = await actionProcessor.processMessage(userMessage);
      
      // Create bot response with action results
      let botResponse = actionResponse;
      
      // If no actions were performed, provide a helpful AI response
      if (actions.length === 0 || !actions[0].success) {
        // Add some AI-like responses for common queries
        if (userMessage.toLowerCase().includes('help') || userMessage.toLowerCase().includes('what can you do')) {
          botResponse = `I can help you configure your trading bot! Here's what I can do:

🔧 **Indicator Management:**
• Enable/disable indicators: "Enable RSI" or "Turn off MACD"
• Adjust parameters: "Set RSI period to 20" or "Change SMA to 50"

📊 **Current Status:**
• You have ${indicators.length} available indicators
• ${indicatorStates.filter(s => s.enabled).length} are currently active

📈 **Trading Commands:**
• Buy/Sell stocks: "Buy 10 AAPL" or "Sell 5 TSLA at $300"
• Get quotes: "What's MSFT price?" or "Get GOOGL quote"
• Check positions: "Show my positions" or "Show my account"
• Market status: "Is market open?"

💡 **Try saying:**
• "Enable Bollinger Bands"
• "Set MACD fast EMA to 15"
• "Show me my active indicators"
• "Disable all indicators"
• "Buy 10 shares of Apple"
• "What's Tesla's current price?"
• "Show my account balance"`;
        } else if (userMessage.toLowerCase().includes('status') || userMessage.toLowerCase().includes('active')) {
          const activeIndicators = indicators
            .map((ind, idx) => ({ ...ind, ...indicatorStates[idx] }))
            .filter(ind => ind.enabled);
          
          if (activeIndicators.length === 0) {
            botResponse = "You don't have any active indicators yet. Try enabling some by saying 'Enable RSI' or 'Turn on MACD'.";
          } else {
            botResponse = `📊 **Active Indicators (${activeIndicators.length}):**\n\n` +
              activeIndicators.map(ind => 
                `• ${ind.name} (${ind.param}: ${ind.value})`
              ).join('\n') +
              '\n\nYou can adjust these by saying things like "Set RSI period to 25" or disable them with "Turn off MACD".';
          }
        } else if (userMessage.toLowerCase().includes('backtest') || userMessage.toLowerCase().includes('test strategy')) {
          setShowBacktest(true);
          botResponse = "🔬 **Backtesting Panel Opened!**\n\nI've opened the advanced backtesting panel for you. You can now:\n\n• Configure your backtest parameters\n• Test your current indicator setup\n• Analyze historical performance\n• View detailed metrics and trade history\n\nThe backtest will use your currently active indicators to simulate trading over the past 6 months. Scroll down to see the backtesting interface!";
        } else if (!actions[0]?.success) {
          // Default response for unrecognized commands
          botResponse = actionResponse;
        }
      }
      
      // Add the bot response
      setMessages(msgs => [
        ...msgs,
        { sender: 'bot', text: botResponse }
      ]);
      
      // Optional: Still send to backend for logging/learning (but don't wait for response)
      const config = {
        indicators: indicators.map((ind, idx) => ({
          name: ind.name,
          value: indicatorStates[idx]?.value,
          enabled: indicatorStates[idx]?.enabled
        }))
      };
      
      // Send to backend asynchronously (don't block UI)
      apiPost('/chat', { message: userMessage, config, actions }, token).catch(() => {
        // Silently handle backend errors - the action was already processed locally
      });
    } catch {
      setError('Failed to send chat.');
    } finally {
      setLoading(false);
    }
  };
}
      {/* Backtest Panel */}
      {showBacktest && (
        <BacktestPanel 
          indicators={indicators} 
          indicatorStates={indicatorStates}
        />
      )}