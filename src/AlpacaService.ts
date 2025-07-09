export interface AlpacaConfig {
  apiKey: string;
  secretKey: string;
  paper: boolean;
  baseUrl?: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
}

export interface Position {
  symbol: string;
  qty: number;
  market_value: number;
  cost_basis: number;
  unrealized_pl: number;
  unrealized_plpc: number;
  side: 'long' | 'short';
}

export interface Order {
  id: string;
  symbol: string;
  qty: number;
  side: 'buy' | 'sell';
  order_type: 'market' | 'limit' | 'stop' | 'stop_limit';
  status: string;
  filled_qty: number;
  filled_avg_price?: number;
  created_at: Date;
  updated_at: Date;
}

export interface AccountInfo {
  buying_power: number;
  cash: number;
  portfolio_value: number;
  equity: number;
  last_equity: number;
  daytrading_buying_power: number;
  regt_buying_power: number;
}

export class AlpacaService {
  private config: AlpacaConfig;
  private baseUrl: string;

  constructor(config: AlpacaConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || (config.paper 
      ? 'https://paper-api.alpaca.markets' 
      : 'https://api.alpaca.markets');
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'APCA-API-KEY-ID': this.config.apiKey,
      'APCA-API-SECRET-KEY': this.config.secretKey,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Alpaca API Error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Alpaca API request failed:', error);
      throw error;
    }
  }

  // Account Information
  async getAccount(): Promise<AccountInfo> {
    return await this.makeRequest('/v2/account');
  }

  // Market Data
  async getLatestQuote(symbol: string): Promise<MarketData> {
    const response = await this.makeRequest(`/v2/stocks/${symbol}/quotes/latest`);
    const quote = response.quote;
    
    return {
      symbol,
      price: (quote.bid_price + quote.ask_price) / 2,
      change: 0, // Would need previous close to calculate
      changePercent: 0,
      volume: quote.bid_size + quote.ask_size,
      timestamp: new Date(quote.timestamp)
    };
  }

  async getLatestTrade(symbol: string): Promise<MarketData> {
    const response = await this.makeRequest(`/v2/stocks/${symbol}/trades/latest`);
    const trade = response.trade;
    
    return {
      symbol,
      price: trade.price,
      change: 0,
      changePercent: 0,
      volume: trade.size,
      timestamp: new Date(trade.timestamp)
    };
  }

  async getBars(symbol: string, timeframe: string = '1Day', limit: number = 100): Promise<any[]> {
    const params = new URLSearchParams({
      symbols: symbol,
      timeframe,
      limit: limit.toString(),
    });

    const response = await this.makeRequest(`/v2/stocks/bars?${params}`);
    return response.bars[symbol] || [];
  }

  // Positions
  async getPositions(): Promise<Position[]> {
    return await this.makeRequest('/v2/positions');
  }

  async getPosition(symbol: string): Promise<Position | null> {
    try {
      return await this.makeRequest(`/v2/positions/${symbol}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null; // No position found
      }
      throw error;
    }
  }

  // Orders
  async getOrders(status: string = 'all', limit: number = 50): Promise<Order[]> {
    const params = new URLSearchParams({
      status,
      limit: limit.toString(),
    });

    return await this.makeRequest(`/v2/orders?${params}`);
  }

  async placeOrder(
    symbol: string,
    qty: number,
    side: 'buy' | 'sell',
    type: 'market' | 'limit' = 'market',
    limit_price?: number,
    time_in_force: string = 'day'
  ): Promise<Order> {
    const orderData: any = {
      symbol,
      qty: qty.toString(),
      side,
      type,
      time_in_force,
    };

    if (type === 'limit' && limit_price) {
      orderData.limit_price = limit_price.toString();
    }

    return await this.makeRequest('/v2/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async cancelOrder(orderId: string): Promise<void> {
    await this.makeRequest(`/v2/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  async cancelAllOrders(): Promise<void> {
    await this.makeRequest('/v2/orders', {
      method: 'DELETE',
    });
  }

  // Market Status
  async getMarketClock(): Promise<any> {
    return await this.makeRequest('/v2/clock');
  }

  async isMarketOpen(): Promise<boolean> {
    const clock = await this.getMarketClock();
    return clock.is_open;
  }

  // Portfolio Management
  async closePosition(symbol: string, qty?: number, percentage?: number): Promise<Order> {
    const params: any = {};
    
    if (qty) {
      params.qty = qty.toString();
    } else if (percentage) {
      params.percentage = percentage.toString();
    }

    const queryString = Object.keys(params).length > 0 
      ? '?' + new URLSearchParams(params).toString() 
      : '';

    return await this.makeRequest(`/v2/positions/${symbol}${queryString}`, {
      method: 'DELETE',
    });
  }

  async closeAllPositions(cancelOrders: boolean = true): Promise<Order[]> {
    const params = new URLSearchParams({
      cancel_orders: cancelOrders.toString(),
    });

    return await this.makeRequest(`/v2/positions?${params}`, {
      method: 'DELETE',
    });
  }

  // Watchlists
  async getWatchlists(): Promise<any[]> {
    return await this.makeRequest('/v2/watchlists');
  }

  async createWatchlist(name: string, symbols: string[]): Promise<any> {
    return await this.makeRequest('/v2/watchlists', {
      method: 'POST',
      body: JSON.stringify({
        name,
        symbols: symbols.map(symbol => ({ symbol })),
      }),
    });
  }

  // Asset Information
  async getAsset(symbol: string): Promise<any> {
    return await this.makeRequest(`/v2/assets/${symbol}`);
  }

  async searchAssets(query: string): Promise<any[]> {
    const params = new URLSearchParams({
      search: query,
      status: 'active',
    });

    return await this.makeRequest(`/v2/assets?${params}`);
  }
}

// Singleton instance for the app
let alpacaService: AlpacaService | null = null;

export const initializeAlpacaService = (config: AlpacaConfig): AlpacaService => {
  alpacaService = new AlpacaService(config);
  return alpacaService;
};

export const getAlpacaService = (): AlpacaService => {
  if (!alpacaService) {
    throw new Error('Alpaca service not initialized. Call initializeAlpacaService first.');
  }
  return alpacaService;
};