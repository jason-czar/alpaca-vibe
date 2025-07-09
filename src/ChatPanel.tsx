import React, { useState, useRef, useEffect } from 'react';
import type { Indicator, IndicatorState } from './types';
import { apiPost } from './api';
import { TradingActionProcessor } from './TradingActionProcessor';
import { initializeAlpacaService } from './AlpacaService';
import BacktestPanel from './BacktestPanel';
import PortfolioPanel from './PortfolioPanel';
import CustomIndicatorPanel from './CustomIndicatorPanel';
import StrategyTemplatePanel from './StrategyTemplatePanel';
import AnalyticsDashboard from './AnalyticsDashboard';
import { CustomIndicator } from './IndicatorBuilder';
import type { TradingStrategy } from './StrategyEngine';

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
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showCustomIndicators, setShowCustomIndicators] = useState(false);
  const [showStrategyTemplates, setShowStrategyTemplates] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
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
        } else if (userMessage.toLowerCase().includes('portfolio') || userMessage.toLowerCase().includes('positions') || userMessage.toLowerCase().includes('risk') || userMessage.toLowerCase().includes('allocation')) {
          setShowPortfolio(true);
          botResponse = "📊 **Portfolio Management Panel Opened!**\n\nI've opened the comprehensive portfolio management interface for you. You can now:\n\n• **Overview**: View all positions with real-time P&L\n• **Risk Analysis**: Assess portfolio risk and correlations\n• **Optimization**: Get rebalancing recommendations\n• **Attribution**: Analyze performance vs benchmark\n\n🔍 **Key Features:**\n• Real-time position tracking\n• Advanced risk metrics (VaR, correlation matrix)\n• Sector exposure analysis\n• Portfolio optimization suggestions\n• Performance attribution analysis\n\nScroll down to explore your portfolio analytics!";
        } else if (userMessage.toLowerCase().includes('custom indicator') || userMessage.toLowerCase().includes('create indicator') || userMessage.toLowerCase().includes('indicator builder')) {
          setShowCustomIndicators(true);
          botResponse = "🔧 **Custom Indicator Builder Opened!**\n\nI've opened the advanced indicator creation interface for you. You can now:\n\n• **Create**: Build custom indicators with mathematical formulas\n• **Library**: Manage your personal indicator collection\n• **Templates**: Start with pre-built indicator templates\n\n🛠️ **Features:**\n• Visual formula editor with syntax validation\n• Parameter configuration system\n• Built-in functions (SMA, EMA, RSI, MACD, etc.)\n• Performance impact analysis\n• Import/export capabilities\n• Template library with common patterns\n\n💡 **Examples:**\n• RSI Divergence Detector\n• Adaptive Volatility Index\n• Volume-Weighted Momentum\n• Custom Moving Average Crossovers\n\nScroll down to start building your custom indicators!";
        } else if (userMessage.toLowerCase().includes('strategy template') || userMessage.toLowerCase().includes('bot template') || userMessage.toLowerCase().includes('trading strategy') || userMessage.toLowerCase().includes('pre-built bot') || userMessage.toLowerCase().includes('bot preset')) {
          setShowStrategyTemplates(true);
          botResponse = "🚀 **Strategy Templates & Bot Presets Opened!**\n\nI've opened the comprehensive strategy and bot template library for you. You can now:\n\n🤖 **Bot Templates:**\n• **Beginner Bots**: Conservative strategies perfect for learning\n• **Intermediate Bots**: Balanced risk/reward with trend following\n• **Advanced Bots**: High-frequency and scalping strategies\n• **Professional Bots**: Institutional-grade multi-strategy systems\n\n📊 **Strategy Library:**\n• **RSI Mean Reversion**: Buy oversold, sell overbought\n• **Moving Average Crossover**: Classic trend following\n• **Bollinger Band Breakout**: Volatility-based trading\n• **Custom Strategies**: Build your own from scratch\n\n✨ **Key Features:**\n• Pre-configured indicators and parameters\n• Risk management settings included\n• Educational tutorials for each strategy\n• Performance expectations and capital requirements\n• Difficulty levels from beginner to expert\n\n💡 **Perfect for:**\n• New traders wanting proven strategies\n• Experienced traders seeking new ideas\n• Anyone wanting to save setup time\n• Learning different trading approaches\n\nScroll down to explore the templates and find your perfect trading bot!";
        } else if (userMessage.toLowerCase().includes('analytics') || userMessage.toLowerCase().includes('dashboard') || userMessage.toLowerCase().includes('performance analysis') || userMessage.toLowerCase().includes('advanced analytics') || userMessage.toLowerCase().includes('risk analysis')) {
          setShowAnalytics(true);
          botResponse = "📊 **Advanced Analytics Dashboard Opened!**\n\nI've launched the comprehensive analytics dashboard with institutional-grade performance analysis. You now have access to:\n\n📈 **Performance Analytics:**\n• Cumulative return charts vs benchmark\n• Rolling performance metrics\n• Period-by-period return analysis\n• Risk-adjusted performance ratios\n• Monthly and annual performance breakdowns\n\n⚠️ **Risk Analysis:**\n• Value at Risk (VaR) calculations\n• Drawdown analysis and underwater curves\n• Volatility decomposition and clustering\n• Beta analysis and correlation matrices\n• Downside risk metrics (Sortino, Pain Index)\n\n🎯 **Attribution Analysis:**\n• Sector and asset contribution analysis\n• Factor attribution (Market, Size, Value, Momentum)\n• Timing vs Selection performance breakdown\n• Interaction effects and currency impact\n\n⚡ **Efficiency Metrics:**\n• Sharpe, Sortino, Calmar ratios\n• Information ratio and tracking error\n• Up/Down capture ratios\n• Advanced efficiency measures\n\n🔧 **Custom Dashboard:**\n• Drag-and-drop widget builder\n• Personalized analytics views\n• Dashboard templates for different use cases\n• Real-time data refresh capabilities\n\n✨ **Professional Features:**\n• Benchmark comparison tools\n• Multiple timeframe analysis\n• Export capabilities for reports\n• Advanced charting and visualizations\n\nThis is the same level of analytics used by institutional investors and hedge funds. Perfect for serious traders who want deep insights into their performance!";
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
  const handleCustomIndicatorCreated = (indicator: CustomIndicator) => {
    // Convert custom indicator to standard indicator format
    const standardIndicator = {
      name: indicator.name,
      param: indicator.parameters.length > 0 ? indicator.parameters[0].name : 'Value',
      min: indicator.parameters.length > 0 ? indicator.parameters[0].min || 0 : 0,
      max: indicator.parameters.length > 0 ? indicator.parameters[0].max || 100 : 100,
      default: indicator.parameters.length > 0 ? indicator.parameters[0].defaultValue : 50,
      step: indicator.parameters.length > 0 ? indicator.parameters[0].step || 1 : 1,
      custom: true,
      customId: indicator.id
    };

    // Add to indicators list
    setIndicators(prev => [...prev, standardIndicator]);
    setIndicatorStates(prev => [...prev, { enabled: false, value: standardIndicator.default }]);

    // Close the custom indicator panel
    setShowCustomIndicators(false);

    // Add success message
    setMessages(msgs => [
      ...msgs,
      { 
        sender: 'bot', 
        text: `✅ **Custom Indicator Created Successfully!**\n\n"${indicator.name}" has been added to your indicator library. You can now:\n\n• Enable it in the Bot Builder panel\n• Configure its parameters\n• Use it in backtesting\n• Include it in your trading strategies\n\nThe indicator is ready to use with ${indicator.parameters.length} configurable parameter${indicator.parameters.length !== 1 ? 's' : ''}!` 
      }
    ]);
  };
  };

  const handleTemplateApplied = (indicators: Indicator[], indicatorStates: IndicatorState[], strategy: TradingStrategy) => {
    // Apply the template to the current bot configuration
    setIndicators(indicators);
    setIndicatorStates(indicatorStates);

    // Close the template panel
    setShowStrategyTemplates(false);

    // Add success message
    setMessages(msgs => [
      ...msgs,
      { 
        sender: 'bot', 
        text: `✅ **${strategy.name} Applied Successfully!**\n\n🎯 **Strategy Details:**\n• **Type**: ${strategy.category.replace('_', ' ')}\n• **Indicators**: ${indicators.length} configured\n• **Risk Level**: ${strategy.validation.riskScore}/10\n• **Complexity**: ${strategy.validation.complexity}\n\n🔧 **What's Configured:**\n• All required indicators are enabled\n• Parameters set to optimal defaults\n• Risk management rules applied\n• Entry and exit conditions defined\n\n🚀 **Next Steps:**\n• Review the Bot Builder panel for your new configuration\n• Adjust parameters if needed\n• Run a backtest to see historical performance\n• Enable paper trading to test live\n\nYour bot is ready to trade with this proven strategy!` 
      }
    ]);
  };
}
      {/* Backtest Panel */}
      {showBacktest && (
        <BacktestPanel 
          indicators={indicators} 
          indicatorStates={indicatorStates}
        />
      )}
      
      {/* Portfolio Panel */}
      {showPortfolio && <PortfolioPanel />}
      
      {/* Custom Indicator Panel */}
      {showCustomIndicators && (
        <CustomIndicatorPanel 
          onIndicatorCreated={handleCustomIndicatorCreated}
          onClose={() => setShowCustomIndicators(false)}
        />
      )}
      
      {/* Strategy Template Panel */}
      {showStrategyTemplates && (
        <StrategyTemplatePanel 
          onTemplateApplied={handleTemplateApplied}
          onClose={() => setShowStrategyTemplates(false)}
        />
      )}
      
      {/* Analytics Dashboard */}
      {showAnalytics && (
        <AnalyticsDashboard 
          onClose={() => setShowAnalytics(false)}
        />
      )}