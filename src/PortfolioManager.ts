export interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  costBasis: number;
  side: 'long' | 'short';
  sector?: string;
  industry?: string;
  weight: number; // Portfolio weight percentage
  dayChange: number;
  dayChangePercent: number;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  totalPL: number;
  totalPLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  cash: number;
  buyingPower: number;
  marginUsed: number;
  diversificationScore: number;
  beta: number;
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
}

export interface RiskMetrics {
  portfolioRisk: number;
  concentrationRisk: number;
  sectorExposure: { [sector: string]: number };
  correlationMatrix: { [symbol: string]: { [symbol: string]: number } };
  valueAtRisk: number; // 1-day VaR at 95% confidence
  expectedShortfall: number;
  betaWeighted: number;
}

export interface PortfolioOptimization {
  currentAllocation: { [symbol: string]: number };
  suggestedAllocation: { [symbol: string]: number };
  rebalanceActions: RebalanceAction[];
  expectedReturn: number;
  expectedRisk: number;
  sharpeImprovement: number;
}

export interface RebalanceAction {
  symbol: string;
  action: 'buy' | 'sell';
  quantity: number;
  currentWeight: number;
  targetWeight: number;
  reason: string;
}

export interface PerformanceAttribution {
  totalReturn: number;
  assetAllocation: number;
  stockSelection: number;
  interaction: number;
  benchmark: string;
  benchmarkReturn: number;
  activeReturn: number;
  trackingError: number;
}

export class PortfolioManager {
  private positions: Position[] = [];
  private historicalPrices: { [symbol: string]: number[] } = {};
  private benchmarkPrices: number[] = [];

  constructor() {
    this.initializeDemoData();
  }

  private initializeDemoData(): void {
    // Initialize with demo positions for demonstration
    this.positions = [
      {
        symbol: 'AAPL',
        quantity: 50,
        averagePrice: 175.00,
        currentPrice: 182.50,
        marketValue: 9125.00,
        unrealizedPL: 375.00,
        unrealizedPLPercent: 4.29,
        costBasis: 8750.00,
        side: 'long',
        sector: 'Technology',
        industry: 'Consumer Electronics',
        weight: 35.2,
        dayChange: 2.50,
        dayChangePercent: 1.39
      },
      {
        symbol: 'MSFT',
        quantity: 30,
        averagePrice: 340.00,
        currentPrice: 355.75,
        marketValue: 10672.50,
        unrealizedPL: 472.50,
        unrealizedPLPercent: 4.63,
        costBasis: 10200.00,
        side: 'long',
        sector: 'Technology',
        industry: 'Software',
        weight: 41.2,
        dayChange: -1.25,
        dayChangePercent: -0.35
      },
      {
        symbol: 'GOOGL',
        quantity: 15,
        averagePrice: 145.00,
        currentPrice: 152.30,
        marketValue: 2284.50,
        unrealizedPL: 109.50,
        unrealizedPLPercent: 5.03,
        costBasis: 2175.00,
        side: 'long',
        sector: 'Technology',
        industry: 'Internet Services',
        weight: 8.8,
        dayChange: 0.80,
        dayChangePercent: 0.53
      },
      {
        symbol: 'TSLA',
        quantity: 25,
        averagePrice: 220.00,
        currentPrice: 195.40,
        marketValue: 4885.00,
        unrealizedPL: -615.00,
        unrealizedPLPercent: -11.18,
        costBasis: 5500.00,
        side: 'long',
        sector: 'Consumer Discretionary',
        industry: 'Electric Vehicles',
        weight: 18.8,
        dayChange: -3.60,
        dayChangePercent: -1.81
      }
    ];

    // Generate historical price data for risk calculations
    this.generateHistoricalData();
  }

  private generateHistoricalData(): void {
    const symbols = this.positions.map(p => p.symbol);
    const days = 252; // 1 year of trading days

    for (const symbol of symbols) {
      const prices: number[] = [];
      const position = this.positions.find(p => p.symbol === symbol)!;
      let currentPrice = position.currentPrice;

      // Generate realistic price history
      for (let i = days; i >= 0; i--) {
        const volatility = this.getSymbolVolatility(symbol);
        const drift = 0.0001; // Small positive drift
        const randomChange = (Math.random() - 0.5) * volatility;
        const priceChange = drift + randomChange;
        
        currentPrice = currentPrice * (1 + priceChange);
        prices.unshift(currentPrice);
      }

      this.historicalPrices[symbol] = prices;
    }

    // Generate benchmark (S&P 500) data
    let benchmarkPrice = 4500;
    for (let i = days; i >= 0; i--) {
      const change = (Math.random() - 0.5) * 0.015; // Market volatility
      benchmarkPrice = benchmarkPrice * (1 + change);
      this.benchmarkPrices.unshift(benchmarkPrice);
    }
  }

  private getSymbolVolatility(symbol: string): number {
    const volatilities: { [key: string]: number } = {
      'AAPL': 0.025,
      'MSFT': 0.022,
      'GOOGL': 0.028,
      'TSLA': 0.045,
      'NVDA': 0.040,
      'AMZN': 0.030
    };
    return volatilities[symbol] || 0.025;
  }

  getPositions(): Position[] {
    return [...this.positions];
  }

  getPortfolioMetrics(): PortfolioMetrics {
    const totalValue = this.positions.reduce((sum, pos) => sum + pos.marketValue, 0);
    const totalCost = this.positions.reduce((sum, pos) => sum + pos.costBasis, 0);
    const totalPL = this.positions.reduce((sum, pos) => sum + pos.unrealizedPL, 0);
    const dayChange = this.positions.reduce((sum, pos) => sum + (pos.dayChange * pos.quantity), 0);

    return {
      totalValue,
      totalCost,
      totalPL,
      totalPLPercent: totalCost > 0 ? (totalPL / totalCost) * 100 : 0,
      dayChange,
      dayChangePercent: totalValue > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0,
      cash: 5000, // Demo cash balance
      buyingPower: 15000, // Demo buying power
      marginUsed: 0,
      diversificationScore: this.calculateDiversificationScore(),
      beta: this.calculatePortfolioBeta(),
      sharpeRatio: this.calculateSharpeRatio(),
      volatility: this.calculatePortfolioVolatility(),
      maxDrawdown: this.calculateMaxDrawdown()
    };
  }

  getRiskMetrics(): RiskMetrics {
    const sectorExposure = this.calculateSectorExposure();
    const correlationMatrix = this.calculateCorrelationMatrix();
    
    return {
      portfolioRisk: this.calculatePortfolioVolatility(),
      concentrationRisk: this.calculateConcentrationRisk(),
      sectorExposure,
      correlationMatrix,
      valueAtRisk: this.calculateVaR(),
      expectedShortfall: this.calculateExpectedShortfall(),
      betaWeighted: this.calculatePortfolioBeta()
    };
  }

  private calculateDiversificationScore(): number {
    // Herfindahl-Hirschman Index for concentration
    const weights = this.positions.map(pos => pos.weight / 100);
    const hhi = weights.reduce((sum, weight) => sum + Math.pow(weight, 2), 0);
    
    // Convert to diversification score (0-100, higher is better)
    return Math.max(0, (1 - hhi) * 100);
  }

  private calculatePortfolioBeta(): number {
    let weightedBeta = 0;
    const totalValue = this.positions.reduce((sum, pos) => sum + pos.marketValue, 0);

    for (const position of this.positions) {
      const beta = this.calculateStockBeta(position.symbol);
      const weight = position.marketValue / totalValue;
      weightedBeta += beta * weight;
    }

    return weightedBeta;
  }

  private calculateStockBeta(symbol: string): number {
    const stockPrices = this.historicalPrices[symbol];
    if (!stockPrices || stockPrices.length < 2) return 1.0;

    // Calculate returns
    const stockReturns = this.calculateReturns(stockPrices);
    const marketReturns = this.calculateReturns(this.benchmarkPrices);

    // Calculate beta using covariance and variance
    const covariance = this.calculateCovariance(stockReturns, marketReturns);
    const marketVariance = this.calculateVariance(marketReturns);

    return marketVariance > 0 ? covariance / marketVariance : 1.0;
  }

  private calculateReturns(prices: number[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    return returns;
  }

  private calculateCovariance(returns1: number[], returns2: number[]): number {
    if (returns1.length !== returns2.length) return 0;

    const mean1 = returns1.reduce((sum, r) => sum + r, 0) / returns1.length;
    const mean2 = returns2.reduce((sum, r) => sum + r, 0) / returns2.length;

    let covariance = 0;
    for (let i = 0; i < returns1.length; i++) {
      covariance += (returns1[i] - mean1) * (returns2[i] - mean2);
    }

    return covariance / (returns1.length - 1);
  }

  private calculateVariance(returns: number[]): number {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    return variance;
  }

  private calculateSharpeRatio(): number {
    const portfolioReturns = this.calculatePortfolioReturns();
    const avgReturn = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
    const volatility = Math.sqrt(this.calculateVariance(portfolioReturns));
    const riskFreeRate = 0.02 / 252; // 2% annual risk-free rate, daily

    return volatility > 0 ? (avgReturn - riskFreeRate) / volatility : 0;
  }

  private calculatePortfolioReturns(): number[] {
    const returns: number[] = [];
    const totalValue = this.positions.reduce((sum, pos) => sum + pos.marketValue, 0);

    // Calculate weighted portfolio returns
    for (let i = 1; i < 252; i++) { // Use last year of data
      let portfolioReturn = 0;
      
      for (const position of this.positions) {
        const stockPrices = this.historicalPrices[position.symbol];
        if (stockPrices && stockPrices.length > i) {
          const stockReturn = (stockPrices[i] - stockPrices[i - 1]) / stockPrices[i - 1];
          const weight = position.marketValue / totalValue;
          portfolioReturn += stockReturn * weight;
        }
      }
      
      returns.push(portfolioReturn);
    }

    return returns;
  }

  private calculatePortfolioVolatility(): number {
    const returns = this.calculatePortfolioReturns();
    const variance = this.calculateVariance(returns);
    return Math.sqrt(variance) * Math.sqrt(252); // Annualized
  }

  private calculateMaxDrawdown(): number {
    const returns = this.calculatePortfolioReturns();
    let peak = 1;
    let maxDrawdown = 0;
    let currentValue = 1;

    for (const returnValue of returns) {
      currentValue *= (1 + returnValue);
      if (currentValue > peak) {
        peak = currentValue;
      }
      const drawdown = (peak - currentValue) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    return maxDrawdown * 100; // Return as percentage
  }

  private calculateSectorExposure(): { [sector: string]: number } {
    const sectorExposure: { [sector: string]: number } = {};
    const totalValue = this.positions.reduce((sum, pos) => sum + pos.marketValue, 0);

    for (const position of this.positions) {
      const sector = position.sector || 'Unknown';
      const weight = (position.marketValue / totalValue) * 100;
      sectorExposure[sector] = (sectorExposure[sector] || 0) + weight;
    }

    return sectorExposure;
  }

  private calculateCorrelationMatrix(): { [symbol: string]: { [symbol: string]: number } } {
    const matrix: { [symbol: string]: { [symbol: string]: number } } = {};
    const symbols = this.positions.map(p => p.symbol);

    for (const symbol1 of symbols) {
      matrix[symbol1] = {};
      for (const symbol2 of symbols) {
        if (symbol1 === symbol2) {
          matrix[symbol1][symbol2] = 1.0;
        } else {
          matrix[symbol1][symbol2] = this.calculateCorrelation(symbol1, symbol2);
        }
      }
    }

    return matrix;
  }

  private calculateCorrelation(symbol1: string, symbol2: string): number {
    const returns1 = this.calculateReturns(this.historicalPrices[symbol1] || []);
    const returns2 = this.calculateReturns(this.historicalPrices[symbol2] || []);

    if (returns1.length === 0 || returns2.length === 0) return 0;

    const covariance = this.calculateCovariance(returns1, returns2);
    const stdDev1 = Math.sqrt(this.calculateVariance(returns1));
    const stdDev2 = Math.sqrt(this.calculateVariance(returns2));

    return (stdDev1 > 0 && stdDev2 > 0) ? covariance / (stdDev1 * stdDev2) : 0;
  }

  private calculateConcentrationRisk(): number {
    // Calculate the percentage of portfolio in top 3 positions
    const sortedPositions = [...this.positions].sort((a, b) => b.weight - a.weight);
    const top3Weight = sortedPositions.slice(0, 3).reduce((sum, pos) => sum + pos.weight, 0);
    return top3Weight;
  }

  private calculateVaR(): number {
    const returns = this.calculatePortfolioReturns();
    const sortedReturns = returns.sort((a, b) => a - b);
    const varIndex = Math.floor(returns.length * 0.05); // 5th percentile
    const totalValue = this.positions.reduce((sum, pos) => sum + pos.marketValue, 0);
    
    return Math.abs(sortedReturns[varIndex] * totalValue);
  }

  private calculateExpectedShortfall(): number {
    const returns = this.calculatePortfolioReturns();
    const sortedReturns = returns.sort((a, b) => a - b);
    const varIndex = Math.floor(returns.length * 0.05);
    const tailReturns = sortedReturns.slice(0, varIndex);
    const avgTailReturn = tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length;
    const totalValue = this.positions.reduce((sum, pos) => sum + pos.marketValue, 0);
    
    return Math.abs(avgTailReturn * totalValue);
  }

  generateOptimizationSuggestions(): PortfolioOptimization {
    const currentAllocation: { [symbol: string]: number } = {};
    const totalValue = this.positions.reduce((sum, pos) => sum + pos.marketValue, 0);

    // Current allocation
    for (const position of this.positions) {
      currentAllocation[position.symbol] = (position.marketValue / totalValue) * 100;
    }

    // Simple optimization: reduce concentration risk
    const suggestedAllocation: { [symbol: string]: number } = {};
    const rebalanceActions: RebalanceAction[] = [];

    // Target maximum position size of 25%
    const maxWeight = 25;
    let totalAdjustment = 0;

    for (const position of this.positions) {
      const currentWeight = currentAllocation[position.symbol];
      let targetWeight = currentWeight;

      if (currentWeight > maxWeight) {
        targetWeight = maxWeight;
        totalAdjustment += currentWeight - maxWeight;
        
        rebalanceActions.push({
          symbol: position.symbol,
          action: 'sell',
          quantity: Math.floor(position.quantity * (currentWeight - maxWeight) / currentWeight),
          currentWeight,
          targetWeight,
          reason: 'Reduce concentration risk'
        });
      }

      suggestedAllocation[position.symbol] = targetWeight;
    }

    // Redistribute excess weight to underweight positions
    const underweightPositions = this.positions.filter(p => currentAllocation[p.symbol] < maxWeight);
    if (underweightPositions.length > 0 && totalAdjustment > 0) {
      const redistributionPerPosition = totalAdjustment / underweightPositions.length;
      
      for (const position of underweightPositions) {
        const currentWeight = currentAllocation[position.symbol];
        const targetWeight = Math.min(maxWeight, currentWeight + redistributionPerPosition);
        suggestedAllocation[position.symbol] = targetWeight;

        if (targetWeight > currentWeight) {
          rebalanceActions.push({
            symbol: position.symbol,
            action: 'buy',
            quantity: Math.floor(position.quantity * (targetWeight - currentWeight) / currentWeight),
            currentWeight,
            targetWeight,
            reason: 'Improve diversification'
          });
        }
      }
    }

    return {
      currentAllocation,
      suggestedAllocation,
      rebalanceActions,
      expectedReturn: 0.08, // Simplified
      expectedRisk: 0.15, // Simplified
      sharpeImprovement: 0.1 // Simplified
    };
  }

  calculatePerformanceAttribution(): PerformanceAttribution {
    const portfolioReturn = this.getPortfolioMetrics().totalPLPercent;
    const benchmarkReturn = 8.5; // Simplified S&P 500 return

    return {
      totalReturn: portfolioReturn,
      assetAllocation: 2.1, // Simplified
      stockSelection: portfolioReturn - benchmarkReturn - 2.1,
      interaction: 0.3, // Simplified
      benchmark: 'S&P 500',
      benchmarkReturn,
      activeReturn: portfolioReturn - benchmarkReturn,
      trackingError: 4.2 // Simplified
    };
  }

  addPosition(symbol: string, quantity: number, price: number): void {
    const existingPosition = this.positions.find(p => p.symbol === symbol);
    
    if (existingPosition) {
      // Update existing position
      const totalCost = existingPosition.costBasis + (quantity * price);
      const totalQuantity = existingPosition.quantity + quantity;
      existingPosition.averagePrice = totalCost / totalQuantity;
      existingPosition.quantity = totalQuantity;
      existingPosition.costBasis = totalCost;
      existingPosition.marketValue = totalQuantity * existingPosition.currentPrice;
      existingPosition.unrealizedPL = existingPosition.marketValue - existingPosition.costBasis;
      existingPosition.unrealizedPLPercent = (existingPosition.unrealizedPL / existingPosition.costBasis) * 100;
    } else {
      // Add new position
      this.positions.push({
        symbol,
        quantity,
        averagePrice: price,
        currentPrice: price, // Would be updated with real market data
        marketValue: quantity * price,
        unrealizedPL: 0,
        unrealizedPLPercent: 0,
        costBasis: quantity * price,
        side: 'long',
        sector: 'Unknown',
        industry: 'Unknown',
        weight: 0, // Will be calculated
        dayChange: 0,
        dayChangePercent: 0
      });
    }

    this.updatePortfolioWeights();
  }

  removePosition(symbol: string, quantity?: number): boolean {
    const positionIndex = this.positions.findIndex(p => p.symbol === symbol);
    if (positionIndex === -1) return false;

    const position = this.positions[positionIndex];
    
    if (!quantity || quantity >= position.quantity) {
      // Remove entire position
      this.positions.splice(positionIndex, 1);
    } else {
      // Reduce position
      position.quantity -= quantity;
      position.marketValue = position.quantity * position.currentPrice;
      position.costBasis = position.quantity * position.averagePrice;
      position.unrealizedPL = position.marketValue - position.costBasis;
      position.unrealizedPLPercent = (position.unrealizedPL / position.costBasis) * 100;
    }

    this.updatePortfolioWeights();
    return true;
  }

  private updatePortfolioWeights(): void {
    const totalValue = this.positions.reduce((sum, pos) => sum + pos.marketValue, 0);
    
    for (const position of this.positions) {
      position.weight = totalValue > 0 ? (position.marketValue / totalValue) * 100 : 0;
    }
  }

  updatePrices(priceUpdates: { [symbol: string]: number }): void {
    for (const position of this.positions) {
      if (priceUpdates[position.symbol]) {
        const oldPrice = position.currentPrice;
        position.currentPrice = priceUpdates[position.symbol];
        position.marketValue = position.quantity * position.currentPrice;
        position.unrealizedPL = position.marketValue - position.costBasis;
        position.unrealizedPLPercent = (position.unrealizedPL / position.costBasis) * 100;
        position.dayChange = position.currentPrice - oldPrice;
        position.dayChangePercent = (position.dayChange / oldPrice) * 100;
      }
    }

    this.updatePortfolioWeights();
  }
}

// Singleton instance
let portfolioManager: PortfolioManager | null = null;

export const getPortfolioManager = (): PortfolioManager => {
  if (!portfolioManager) {
    portfolioManager = new PortfolioManager();
  }
  return portfolioManager;
};