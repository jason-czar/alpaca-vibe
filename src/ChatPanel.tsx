import React, { useState, useRef, useEffect } from 'react';
import type { Indicator, IndicatorState } from './types';
import { apiPost } from './api';
import { ActionProcessor } from './ActionProcessor';

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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Create action processor instance
  const actionProcessor = new ActionProcessor(
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
      const { response: actionResponse, actions } = actionProcessor.processMessage(userMessage);
      
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

💡 **Try saying:**
• "Enable Bollinger Bands"
• "Set MACD fast EMA to 15"
• "Show me my active indicators"
• "Disable all indicators"`;
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