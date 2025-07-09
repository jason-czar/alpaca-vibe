import { ActionProcessor, ActionResult, ParsedCommand } from './ActionProcessor';
import { getAlpacaService } from './AlpacaService';
import type { Indicator, IndicatorState } from './types';

export interface TradingCommand extends ParsedCommand {
  type: 'enable_indicator' | 'disable_indicator' | 'set_parameter' | 'add_indicator' | 'remove_indicator' | 
        'buy_stock' | 'sell_stock' | 'get_quote' | 'get_positions' | 'get_account' | 'cancel_order' | 
        'market_status' | 'close_position' | 'unknown';
  symbol?: string;
  quantity?: number;
  price?: number;
  orderType?: 'market' | 'limit';
}

export class TradingActionProcessor extends ActionProcessor {
  constructor(
    indicators: Indicator[],
    indicatorStates: IndicatorState[],
    setIndicatorStates: (states: IndicatorState[]) => void,
    setIndicators: (indicators: Indicator[]) => void
  ) {
    super(indicators, indicatorStates, setIndicatorStates, setIndicators);
  }

  parseCommand(message: string): TradingCommand {
    const lowerMessage = message.toLowerCase();
    
    // Trading commands
    if (lowerMessage.includes('buy') && !lowerMessage.includes('buying power')) {
      const symbol = this.extractSymbol(message);
      const quantity = this.extractNumber(message);
      const price = this.extractPrice(message);
      const orderType = lowerMessage.includes('limit') ? 'limit' : 'market';
      
      if (symbol) {
        return { type: 'buy_stock', symbol, quantity, price, orderType };
      }
    }

    if (lowerMessage.includes('sell')) {
      const symbol = this.extractSymbol(message);
      const quantity = this.extractNumber(message);
      const price = this.extractPrice(message);
      const orderType = lowerMessage.includes('limit') ? 'limit' : 'market';
      
      if (symbol) {
        return { type: 'sell_stock', symbol, quantity, price, orderType };
      }
    }

    // Market data commands
    if (lowerMessage.includes('quote') || lowerMessage.includes('price')) {
      const symbol = this.extractSymbol(message);
      if (symbol) {
        return { type: 'get_quote', symbol };
      }
    }

    // Account commands
    if (lowerMessage.includes('position') && !lowerMessage.includes('close')) {
      return { type: 'get_positions' };
    }

    if (lowerMessage.includes('account') || lowerMessage.includes('balance') || lowerMessage.includes('buying power')) {
      return { type: 'get_account' };
    }

    // Market status
    if (lowerMessage.includes('market') && (lowerMessage.includes('open') || lowerMessage.includes('status'))) {
      return { type: 'market_status' };
    }

    // Close position
    if (lowerMessage.includes('close') && lowerMessage.includes('position')) {
      const symbol = this.extractSymbol(message);
      const quantity = this.extractNumber(message);
      if (symbol) {
        return { type: 'close_position', symbol, quantity };
      }
    }

    // Cancel orders
    if (lowerMessage.includes('cancel')) {
      return { type: 'cancel_order' };
    }

    // Fall back to parent class for indicator commands
    return super.parseCommand(message) as TradingCommand;
  }

  private extractSymbol(message: string): string | null {
    // Look for stock symbols (2-5 uppercase letters)
    const symbolMatch = message.match(/\b[A-Z]{2,5}\b/);
    if (symbolMatch) {
      return symbolMatch[0];
    }

    // Common stock names to symbols
    const stockMap: { [key: string]: string } = {
      'apple': 'AAPL',
      'microsoft': 'MSFT',
      'google': 'GOOGL',
      'amazon': 'AMZN',
      'tesla': 'TSLA',
      'meta': 'META',
      'nvidia': 'NVDA',
      'netflix': 'NFLX',
      'spotify': 'SPOT',
      'uber': 'UBER',
      'airbnb': 'ABNB'
    };

    const lowerMessage = message.toLowerCase();
    for (const [name, symbol] of Object.entries(stockMap)) {
      if (lowerMessage.includes(name)) {
        return symbol;
      }
    }

    return null;
  }

  private extractPrice(message: string): number | null {
    // Look for price patterns like "$150", "at 150", "price 150"
    const pricePatterns = [
      /\$(\d+(?:\.\d{2})?)/,
      /(?:at|price|limit)\s+(\d+(?:\.\d{2})?)/i,
      /(\d+(?:\.\d{2})?)\s*(?:dollars?|usd)/i
    ];

    for (const pattern of pricePatterns) {
      const match = message.match(pattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }

    return null;
  }

  async executeCommand(command: TradingCommand): Promise<ActionResult> {
    try {
      switch (command.type) {
        case 'buy_stock':
          return await this.buyStock(command.symbol!, command.quantity, command.orderType, command.price);
        
        case 'sell_stock':
          return await this.sellStock(command.symbol!, command.quantity, command.orderType, command.price);
        
        case 'get_quote':
          return await this.getQuote(command.symbol!);
        
        case 'get_positions':
          return await this.getPositions();
        
        case 'get_account':
          return await this.getAccount();
        
        case 'market_status':
          return await this.getMarketStatus();
        
        case 'close_position':
          return await this.closePosition(command.symbol!, command.quantity);
        
        case 'cancel_order':
          return await this.cancelOrders();
        
        default:
          // Fall back to parent class for indicator commands
          return super.executeCommand(command);
      }
    } catch (error) {
      return {
        success: false,
        action: 'Trading Error',
        details: `Trading operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async buyStock(symbol: string, quantity?: number, orderType: 'market' | 'limit' = 'market', price?: number): Promise<ActionResult> {
    const alpaca = getAlpacaService();
    
    if (!quantity) {
      quantity = 1; // Default to 1 share
    }

    if (orderType === 'limit' && !price) {
      return {
        success: false,
        action: 'Buy Stock',
        details: 'Limit orders require a price. Try: "Buy 10 AAPL at $150"'
      };
    }

    const order = await alpaca.placeOrder(symbol, quantity, 'buy', orderType, price);

    return {
      success: true,
      action: 'Buy Stock',
      details: `📈 Placed ${orderType} buy order for ${quantity} shares of ${symbol}${price ? ` at $${price}` : ''}. Order ID: ${order.id}`,
      data: { order }
    };
  }

  private async sellStock(symbol: string, quantity?: number, orderType: 'market' | 'limit' = 'market', price?: number): Promise<ActionResult> {
    const alpaca = getAlpacaService();
    
    if (!quantity) {
      // If no quantity specified, try to sell entire position
      const position = await alpaca.getPosition(symbol);
      if (!position) {
        return {
          success: false,
          action: 'Sell Stock',
          details: `You don't have any position in ${symbol} to sell.`
        };
      }
      quantity = Math.abs(position.qty);
    }

    if (orderType === 'limit' && !price) {
      return {
        success: false,
        action: 'Sell Stock',
        details: 'Limit orders require a price. Try: "Sell 10 AAPL at $150"'
      };
    }

    const order = await alpaca.placeOrder(symbol, quantity, 'sell', orderType, price);

    return {
      success: true,
      action: 'Sell Stock',
      details: `📉 Placed ${orderType} sell order for ${quantity} shares of ${symbol}${price ? ` at $${price}` : ''}. Order ID: ${order.id}`,
      data: { order }
    };
  }

  private async getQuote(symbol: string): Promise<ActionResult> {
    const alpaca = getAlpacaService();
    
    try {
      const quote = await alpaca.getLatestQuote(symbol);
      const trade = await alpaca.getLatestTrade(symbol);
      
      return {
        success: true,
        action: 'Get Quote',
        details: `💰 ${symbol} Current Price: $${trade.price.toFixed(2)}\n` +
                `📊 Quote: $${quote.price.toFixed(2)}\n` +
                `🕐 Last Updated: ${trade.timestamp.toLocaleTimeString()}`,
        data: { quote, trade }
      };
    } catch (error) {
      return {
        success: false,
        action: 'Get Quote',
        details: `Could not get quote for ${symbol}. Please check the symbol is valid.`
      };
    }
  }

  private async getPositions(): Promise<ActionResult> {
    const alpaca = getAlpacaService();
    const positions = await alpaca.getPositions();

    if (positions.length === 0) {
      return {
        success: true,
        action: 'Get Positions',
        details: '📊 You currently have no open positions.',
        data: { positions: [] }
      };
    }

    const positionSummary = positions.map(pos => {
      const pl = pos.unrealized_pl >= 0 ? '+' : '';
      const plPercent = pos.unrealized_plpc >= 0 ? '+' : '';
      return `• ${pos.symbol}: ${pos.qty} shares @ $${(pos.market_value / pos.qty).toFixed(2)} (${pl}$${pos.unrealized_pl.toFixed(2)}, ${plPercent}${(pos.unrealized_plpc * 100).toFixed(2)}%)`;
    }).join('\n');

    const totalValue = positions.reduce((sum, pos) => sum + pos.market_value, 0);
    const totalPL = positions.reduce((sum, pos) => sum + pos.unrealized_pl, 0);

    return {
      success: true,
      action: 'Get Positions',
      details: `📊 **Your Positions (${positions.length}):**\n\n${positionSummary}\n\n💼 Total Value: $${totalValue.toFixed(2)}\n📈 Total P&L: ${totalPL >= 0 ? '+' : ''}$${totalPL.toFixed(2)}`,
      data: { positions }
    };
  }

  private async getAccount(): Promise<ActionResult> {
    const alpaca = getAlpacaService();
    const account = await alpaca.getAccount();

    return {
      success: true,
      action: 'Get Account',
      details: `💳 **Account Summary:**\n\n` +
              `💰 Portfolio Value: $${account.portfolio_value.toFixed(2)}\n` +
              `💵 Cash: $${account.cash.toFixed(2)}\n` +
              `🛒 Buying Power: $${account.buying_power.toFixed(2)}\n` +
              `📊 Equity: $${account.equity.toFixed(2)}\n` +
              `📈 Day Trading BP: $${account.daytrading_buying_power.toFixed(2)}`,
      data: { account }
    };
  }

  private async getMarketStatus(): Promise<ActionResult> {
    const alpaca = getAlpacaService();
    const clock = await alpaca.getMarketClock();

    const status = clock.is_open ? '🟢 OPEN' : '🔴 CLOSED';
    const nextOpen = new Date(clock.next_open).toLocaleString();
    const nextClose = new Date(clock.next_close).toLocaleString();

    return {
      success: true,
      action: 'Market Status',
      details: `🏛️ **Market Status:** ${status}\n\n` +
              `⏰ Current Time: ${new Date(clock.timestamp).toLocaleString()}\n` +
              `🔓 Next Open: ${nextOpen}\n` +
              `🔒 Next Close: ${nextClose}`,
      data: { clock }
    };
  }

  private async closePosition(symbol: string, quantity?: number): Promise<ActionResult> {
    const alpaca = getAlpacaService();
    
    const position = await alpaca.getPosition(symbol);
    if (!position) {
      return {
        success: false,
        action: 'Close Position',
        details: `You don't have any position in ${symbol} to close.`
      };
    }

    const order = await alpaca.closePosition(symbol, quantity);

    const closedQty = quantity || Math.abs(position.qty);
    return {
      success: true,
      action: 'Close Position',
      details: `🔒 Closed ${closedQty} shares of ${symbol} position. Order ID: ${order.id}`,
      data: { order, position }
    };
  }

  private async cancelOrders(): Promise<ActionResult> {
    const alpaca = getAlpacaService();
    
    const openOrders = await alpaca.getOrders('open');
    if (openOrders.length === 0) {
      return {
        success: true,
        action: 'Cancel Orders',
        details: '📋 No open orders to cancel.',
        data: { cancelledCount: 0 }
      };
    }

    await alpaca.cancelAllOrders();

    return {
      success: true,
      action: 'Cancel Orders',
      details: `❌ Cancelled ${openOrders.length} open order${openOrders.length !== 1 ? 's' : ''}.`,
      data: { cancelledCount: openOrders.length }
    };
  }

  async processMessage(message: string): Promise<{ response: string; actions: ActionResult[] }> {
    const command = this.parseCommand(message);
    const actionResult = await this.executeCommand(command);
    
    let response = '';
    
    if (actionResult.success) {
      response = actionResult.details;
      
      // Add contextual trading information
      if (command.type === 'buy_stock' || command.type === 'sell_stock') {
        response += '\n\n💡 You can check your positions by saying "Show my positions" or get account info with "Show my account".';
      }
    } else {
      response = `❌ ${actionResult.details}`;
      
      // Provide helpful suggestions for trading commands
      if (command.type === 'unknown') {
        response += '\n\n💡 **Try these commands:**\n' +
                   '📈 Trading: "Buy 10 AAPL", "Sell 5 TSLA at $300"\n' +
                   '📊 Data: "Get MSFT quote", "Show my positions"\n' +
                   '⚙️ Indicators: "Enable RSI", "Set MACD to 20"\n' +
                   '🏛️ Market: "Is market open?", "Show my account"';
      }
    }

    return {
      response,
      actions: [actionResult]
    };
  }
}