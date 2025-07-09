export interface BacktestConfig {
  symbol: string;
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  indicators: {
    name: string;
    enabled: boolean;
    value: number;
    param: string;
  }[];
  strategy: 'simple' | 'momentum' | 'mean_reversion' | 'multi_indicator';
}

export interface BacktestResult {
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitableTrades: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  finalCapital: number;
  trades: Trade[];
  equity: EquityPoint[];
  metrics: PerformanceMetrics;
}

export interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: Date;
  pnl?: number;
  reason: string;
  indicators: { [key: string]: number };
}

export interface EquityPoint {
  timestamp: Date;
  equity: number;
  drawdown: number;
}

export interface PerformanceMetrics {
  volatility: number;
  beta: number;
  alpha: number;
  informationRatio: number;
  calmarRatio: number;
  sortinoRatio: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  averageHoldingPeriod: number;
  largestWin: number;
  largestLoss: number;
}

export interface MarketBar {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class BacktestEngine {
  private config: BacktestConfig;
  private marketData: MarketBar[] = [];
  private trades: Trade[] = [];
  private equity: EquityPoint[] = [];
  private currentCapital: number;
  private position: number = 0; // Current position size
  private indicators: { [key: string]: number[] } = {};

  constructor(config: BacktestConfig) {
    this.config = config;
    this.currentCapital = config.initialCapital;
  }

  async runBacktest(): Promise<BacktestResult> {
    // Step 1: Load market data
    await this.loadMarketData();
    
    // Step 2: Calculate indicators
    this.calculateIndicators();
    
    // Step 3: Execute strategy
    this.executeStrategy();
    
    // Step 4: Calculate performance metrics
    const metrics = this.calculateMetrics();
    
    return {
      totalReturn: this.currentCapital - this.config.initialCapital,
      totalReturnPercent: ((this.currentCapital - this.config.initialCapital) / this.config.initialCapital) * 100,
      annualizedReturn: this.calculateAnnualizedReturn(),
      sharpeRatio: metrics.sharpeRatio,
      maxDrawdown: metrics.maxDrawdown,
      winRate: this.calculateWinRate(),
      totalTrades: this.trades.length / 2, // Buy + Sell = 1 complete trade
      profitableTrades: this.getProfitableTrades().length,
      averageWin: this.calculateAverageWin(),
      averageLoss: this.calculateAverageLoss(),
      profitFactor: this.calculateProfitFactor(),
      finalCapital: this.currentCapital,
      trades: this.trades,
      equity: this.equity,
      metrics
    };
  }

  private async loadMarketData(): Promise<void> {
    // In a real implementation, this would fetch from Alpaca API
    // For demo, we'll generate realistic market data
    this.marketData = this.generateDemoMarketData();
  }

  private generateDemoMarketData(): MarketBar[] {
    const bars: MarketBar[] = [];
    const startPrice = 150;
    let currentPrice = startPrice;
    
    const startTime = this.config.startDate.getTime();
    const endTime = this.config.endDate.getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    
    for (let time = startTime; time <= endTime; time += dayMs) {
      const date = new Date(time);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Generate realistic price movement
      const volatility = 0.02;
      const trend = 0.0001; // Slight upward trend
      const randomChange = (Math.random() - 0.5) * volatility;
      const priceChange = trend + randomChange;
      
      const open = currentPrice;
      const change = open * priceChange;
      const close = open + change;
      const high = Math.max(open, close) + (Math.random() * Math.abs(change));
      const low = Math.min(open, close) - (Math.random() * Math.abs(change));
      const volume = Math.floor(1000000 + Math.random() * 2000000);
      
      bars.push({
        timestamp: date,
        open,
        high,
        low,
        close,
        volume
      });
      
      currentPrice = close;
    }
    
    return bars;
  }

  private calculateIndicators(): void {
    const enabledIndicators = this.config.indicators.filter(ind => ind.enabled);
    
    for (const indicator of enabledIndicators) {
      switch (indicator.name.toLowerCase()) {
        case 'relative strength index (rsi)':
          this.indicators['RSI'] = this.calculateRSI(indicator.value);
          break;
        case 'simple moving average (sma)':
          this.indicators['SMA'] = this.calculateSMA(indicator.value);
          break;
        case 'exponential moving average (ema)':
          this.indicators['EMA'] = this.calculateEMA(indicator.value);
          break;
        case 'moving average convergence divergence (macd)':
          this.indicators['MACD'] = this.calculateMACD(indicator.value);
          break;
        case 'bollinger bands':
          this.indicators['BB_UPPER'] = this.calculateBollingerBands(indicator.value).upper;
          this.indicators['BB_LOWER'] = this.calculateBollingerBands(indicator.value).lower;
          break;
      }
    }
  }

  private calculateRSI(period: number): number[] {
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < this.marketData.length; i++) {
      const change = this.marketData[i].close - this.marketData[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
      
      if (i >= period) {
        const avgGain = gains.slice(-period).reduce((a, b) => a + b) / period;
        const avgLoss = losses.slice(-period).reduce((a, b) => a + b) / period;
        const rs = avgGain / (avgLoss || 0.001);
        rsi.push(100 - (100 / (1 + rs)));
      } else {
        rsi.push(50); // Neutral RSI for initial values
      }
    }
    
    return [50, ...rsi]; // Add initial value
  }

  private calculateSMA(period: number): number[] {
    const sma: number[] = [];
    
    for (let i = 0; i < this.marketData.length; i++) {
      if (i < period - 1) {
        sma.push(this.marketData[i].close);
      } else {
        const sum = this.marketData.slice(i - period + 1, i + 1)
          .reduce((acc, bar) => acc + bar.close, 0);
        sma.push(sum / period);
      }
    }
    
    return sma;
  }

  private calculateEMA(period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    ema.push(this.marketData[0].close); // First EMA is the first price
    
    for (let i = 1; i < this.marketData.length; i++) {
      const currentEMA = (this.marketData[i].close * multiplier) + (ema[i - 1] * (1 - multiplier));
      ema.push(currentEMA);
    }
    
    return ema;
  }

  private calculateMACD(fastPeriod: number): number[] {
    const slowPeriod = Math.floor(fastPeriod * 2.17); // Typical ratio
    const signalPeriod = Math.floor(fastPeriod * 0.75);
    
    const fastEMA = this.calculateEMA(fastPeriod);
    const slowEMA = this.calculateEMA(slowPeriod);
    const macdLine: number[] = [];
    
    for (let i = 0; i < fastEMA.length; i++) {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
    
    return macdLine;
  }

  private calculateBollingerBands(period: number): { upper: number[], lower: number[] } {
    const sma = this.calculateSMA(period);
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = 0; i < this.marketData.length; i++) {
      if (i < period - 1) {
        upper.push(this.marketData[i].close);
        lower.push(this.marketData[i].close);
      } else {
        const prices = this.marketData.slice(i - period + 1, i + 1).map(bar => bar.close);
        const mean = sma[i];
        const variance = prices.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        
        upper.push(mean + (2 * stdDev));
        lower.push(mean - (2 * stdDev));
      }
    }
    
    return { upper, lower };
  }

  private executeStrategy(): void {
    for (let i = 1; i < this.marketData.length; i++) {
      const bar = this.marketData[i];
      const signals = this.generateSignals(i);
      
      // Execute trades based on signals
      if (signals.buy && this.position <= 0) {
        this.executeBuy(bar, signals.reason, signals.indicators);
      } else if (signals.sell && this.position > 0) {
        this.executeSell(bar, signals.reason, signals.indicators);
      }
      
      // Update equity curve
      const equity = this.currentCapital + (this.position * bar.close);
      const maxEquity = Math.max(...this.equity.map(e => e.equity), equity);
      const drawdown = maxEquity > 0 ? ((maxEquity - equity) / maxEquity) * 100 : 0;
      
      this.equity.push({
        timestamp: bar.timestamp,
        equity,
        drawdown
      });
    }
  }

  private generateSignals(index: number): { buy: boolean, sell: boolean, reason: string, indicators: { [key: string]: number } } {
    const currentIndicators: { [key: string]: number } = {};
    
    // Get current indicator values
    for (const [name, values] of Object.entries(this.indicators)) {
      currentIndicators[name] = values[index] || 0;
    }
    
    let buy = false;
    let sell = false;
    let reason = '';
    
    // Simple multi-indicator strategy
    const rsi = currentIndicators['RSI'];
    const sma = currentIndicators['SMA'];
    const ema = currentIndicators['EMA'];
    const macd = currentIndicators['MACD'];
    const currentPrice = this.marketData[index].close;
    
    // Buy signals
    if (rsi && rsi < 30 && currentPrice > sma) {
      buy = true;
      reason = 'RSI oversold + price above SMA';
    } else if (ema && sma && ema > sma && currentPrice > ema) {
      buy = true;
      reason = 'EMA above SMA + price above EMA';
    } else if (macd && macd > 0 && rsi && rsi > 50) {
      buy = true;
      reason = 'MACD positive + RSI above 50';
    }
    
    // Sell signals
    if (rsi && rsi > 70) {
      sell = true;
      reason = 'RSI overbought';
    } else if (ema && sma && ema < sma) {
      sell = true;
      reason = 'EMA below SMA';
    } else if (macd && macd < 0 && rsi && rsi < 50) {
      sell = true;
      reason = 'MACD negative + RSI below 50';
    }
    
    return { buy, sell, reason, indicators: currentIndicators };
  }

  private executeBuy(bar: MarketBar, reason: string, indicators: { [key: string]: number }): void {
    const quantity = Math.floor(this.currentCapital * 0.95 / bar.close); // Use 95% of capital
    const cost = quantity * bar.close;
    
    if (cost <= this.currentCapital && quantity > 0) {
      this.currentCapital -= cost;
      this.position = quantity;
      
      this.trades.push({
        id: `buy_${Date.now()}`,
        symbol: this.config.symbol,
        side: 'buy',
        quantity,
        price: bar.close,
        timestamp: bar.timestamp,
        reason,
        indicators
      });
    }
  }

  private executeSell(bar: MarketBar, reason: string, indicators: { [key: string]: number }): void {
    if (this.position > 0) {
      const proceeds = this.position * bar.close;
      const buyTrade = [...this.trades].reverse().find(t => t.side === 'buy');
      const pnl = buyTrade ? proceeds - (buyTrade.quantity * buyTrade.price) : 0;
      
      this.currentCapital += proceeds;
      
      this.trades.push({
        id: `sell_${Date.now()}`,
        symbol: this.config.symbol,
        side: 'sell',
        quantity: this.position,
        price: bar.close,
        timestamp: bar.timestamp,
        pnl,
        reason,
        indicators
      });
      
      this.position = 0;
    }
  }

  private calculateMetrics(): PerformanceMetrics {
    const returns = this.calculateReturns();
    const maxDrawdown = Math.max(...this.equity.map(e => e.drawdown));
    
    return {
      volatility: this.calculateVolatility(returns),
      beta: 1.0, // Simplified
      alpha: 0.0, // Simplified
      informationRatio: 0.0, // Simplified
      calmarRatio: this.calculateCalmarRatio(maxDrawdown),
      sortinoRatio: this.calculateSortinoRatio(returns),
      maxConsecutiveWins: this.calculateMaxConsecutiveWins(),
      maxConsecutiveLosses: this.calculateMaxConsecutiveLosses(),
      averageHoldingPeriod: this.calculateAverageHoldingPeriod(),
      largestWin: this.calculateLargestWin(),
      largestLoss: this.calculateLargestLoss(),
      sharpeRatio: this.calculateSharpeRatio(returns),
      maxDrawdown
    };
  }

  private calculateReturns(): number[] {
    const returns: number[] = [];
    for (let i = 1; i < this.equity.length; i++) {
      const returnPct = (this.equity[i].equity - this.equity[i - 1].equity) / this.equity[i - 1].equity;
      returns.push(returnPct);
    }
    return returns;
  }

  private calculateSharpeRatio(returns: number[]): number {
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const riskFreeRate = 0.02 / 252; // 2% annual risk-free rate, daily
    
    return stdDev > 0 ? (avgReturn - riskFreeRate) / stdDev : 0;
  }

  private calculateVolatility(returns: number[]): number {
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    return Math.sqrt(variance) * Math.sqrt(252); // Annualized
  }

  private calculateCalmarRatio(maxDrawdown: number): number {
    const annualizedReturn = this.calculateAnnualizedReturn();
    return maxDrawdown > 0 ? annualizedReturn / maxDrawdown : 0;
  }

  private calculateSortinoRatio(returns: number[]): number {
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const downside = returns.filter(r => r < 0);
    const downsideVariance = downside.reduce((acc, ret) => acc + Math.pow(ret, 2), 0) / downside.length;
    const downsideStdDev = Math.sqrt(downsideVariance);
    const riskFreeRate = 0.02 / 252;
    
    return downsideStdDev > 0 ? (avgReturn - riskFreeRate) / downsideStdDev : 0;
  }

  private calculateAnnualizedReturn(): number {
    const totalDays = (this.config.endDate.getTime() - this.config.startDate.getTime()) / (24 * 60 * 60 * 1000);
    const totalReturn = (this.currentCapital - this.config.initialCapital) / this.config.initialCapital;
    return Math.pow(1 + totalReturn, 365 / totalDays) - 1;
  }

  private calculateWinRate(): number {
    const completeTrades = this.getCompleteTrades();
    const winners = completeTrades.filter(trade => trade.pnl > 0);
    return completeTrades.length > 0 ? (winners.length / completeTrades.length) * 100 : 0;
  }

  private getCompleteTrades(): Trade[] {
    return this.trades.filter(trade => trade.side === 'sell' && trade.pnl !== undefined);
  }

  private getProfitableTrades(): Trade[] {
    return this.getCompleteTrades().filter(trade => trade.pnl! > 0);
  }

  private calculateAverageWin(): number {
    const winners = this.getProfitableTrades();
    return winners.length > 0 ? winners.reduce((sum, trade) => sum + trade.pnl!, 0) / winners.length : 0;
  }

  private calculateAverageL oss(): number {
    const losers = this.getCompleteTrades().filter(trade => trade.pnl! < 0);
    return losers.length > 0 ? losers.reduce((sum, trade) => sum + Math.abs(trade.pnl!), 0) / losers.length : 0;
  }

  private calculateProfitFactor(): number {
    const grossProfit = this.getProfitableTrades().reduce((sum, trade) => sum + trade.pnl!, 0);
    const grossLoss = this.getCompleteTrades()
      .filter(trade => trade.pnl! < 0)
      .reduce((sum, trade) => sum + Math.abs(trade.pnl!), 0);
    
    return grossLoss > 0 ? grossProfit / grossLoss : 0;
  }

  private calculateMaxConsecutiveWins(): number {
    const completeTrades = this.getCompleteTrades();
    let maxWins = 0;
    let currentWins = 0;
    
    for (const trade of completeTrades) {
      if (trade.pnl! > 0) {
        currentWins++;
        maxWins = Math.max(maxWins, currentWins);
      } else {
        currentWins = 0;
      }
    }
    
    return maxWins;
  }

  private calculateMaxConsecutiveLosses(): number {
    const completeTrades = this.getCompleteTrades();
    let maxLosses = 0;
    let currentLosses = 0;
    
    for (const trade of completeTrades) {
      if (trade.pnl! < 0) {
        currentLosses++;
        maxLosses = Math.max(maxLosses, currentLosses);
      } else {
        currentLosses = 0;
      }
    }
    
    return maxLosses;
  }

  private calculateAverageHoldingPeriod(): number {
    const buyTrades = this.trades.filter(t => t.side === 'buy');
    const sellTrades = this.trades.filter(t => t.side === 'sell');
    
    if (buyTrades.length === 0 || sellTrades.length === 0) return 0;
    
    let totalHoldingTime = 0;
    let tradeCount = 0;
    
    for (let i = 0; i < Math.min(buyTrades.length, sellTrades.length); i++) {
      const holdingTime = sellTrades[i].timestamp.getTime() - buyTrades[i].timestamp.getTime();
      totalHoldingTime += holdingTime;
      tradeCount++;
    }
    
    return tradeCount > 0 ? totalHoldingTime / tradeCount / (24 * 60 * 60 * 1000) : 0; // Days
  }

  private calculateLargestWin(): number {
    const winners = this.getProfitableTrades();
    return winners.length > 0 ? Math.max(...winners.map(trade => trade.pnl!)) : 0;
  }

  private calculateLargestLoss(): number {
    const losers = this.getCompleteTrades().filter(trade => trade.pnl! < 0);
    return losers.length > 0 ? Math.min(...losers.map(trade => trade.pnl!)) : 0;
  }
}