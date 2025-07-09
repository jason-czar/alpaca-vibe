export interface AnalyticsMetrics {
  performance: PerformanceMetrics;
  risk: RiskAnalytics;
  attribution: AttributionAnalysis;
  benchmark: BenchmarkComparison;
  drawdown: DrawdownAnalysis;
  volatility: VolatilityMetrics;
  correlation: CorrelationAnalysis;
  efficiency: EfficiencyMetrics;
}

export interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  monthlyReturns: MonthlyReturn[];
  cumulativeReturns: CumulativeReturn[];
  rollingReturns: RollingReturn[];
  periodReturns: PeriodReturn[];
  bestMonth: MonthlyReturn;
  worstMonth: MonthlyReturn;
  positiveMonths: number;
  negativeMonths: number;
  averageMonthlyReturn: number;
  monthlyVolatility: number;
}

export interface RiskAnalytics {
  valueAtRisk: VaRAnalysis;
  expectedShortfall: number;
  maxDrawdown: DrawdownMetrics;
  volatility: VolatilityBreakdown;
  beta: BetaAnalysis;
  downside: DownsideRisk;
  concentration: ConcentrationRisk;
  liquidity: LiquidityRisk;
}

export interface AttributionAnalysis {
  sectors: SectorAttribution[];
  assets: AssetAttribution[];
  factors: FactorAttribution[];
  timing: TimingAttribution;
  selection: SelectionAttribution;
  interaction: InteractionEffect;
  currency: CurrencyAttribution;
}

export interface BenchmarkComparison {
  benchmark: string;
  alpha: number;
  beta: number;
  trackingError: number;
  informationRatio: number;
  upCapture: number;
  downCapture: number;
  correlation: number;
  activeReturn: number;
  outperformancePeriods: number;
  underperformancePeriods: number;
}

export interface DrawdownAnalysis {
  current: number;
  maximum: number;
  average: number;
  periods: DrawdownPeriod[];
  recovery: RecoveryAnalysis;
  underwater: UnderwaterCurve[];
  duration: DrawdownDuration;
}

export interface VolatilityMetrics {
  realized: number;
  implied: number;
  historical: HistoricalVolatility[];
  regime: VolatilityRegime[];
  clustering: VolatilityClustering;
  forecast: VolatilityForecast[];
  decomposition: VolatilityDecomposition;
}

export interface CorrelationAnalysis {
  matrix: CorrelationMatrix;
  rolling: RollingCorrelation[];
  breakdown: CorrelationBreakdown;
  stability: CorrelationStability;
  regime: CorrelationRegime[];
}

export interface EfficiencyMetrics {
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  sterlingRatio: number;
  burkeRatio: number;
  martinRatio: number;
  treynorRatio: number;
  jensenAlpha: number;
  modiglianiRatio: number;
  informationRatio: number;
}

// Supporting interfaces
export interface MonthlyReturn {
  date: Date;
  return: number;
  benchmark: number;
  outperformance: number;
}

export interface CumulativeReturn {
  date: Date;
  portfolio: number;
  benchmark: number;
}

export interface RollingReturn {
  date: Date;
  period: string;
  return: number;
  volatility: number;
  sharpe: number;
}

export interface PeriodReturn {
  period: string;
  return: number;
  benchmark: number;
  outperformance: number;
}

export interface VaRAnalysis {
  daily: VaRMetric;
  weekly: VaRMetric;
  monthly: VaRMetric;
  conditional: ConditionalVaR;
  historical: HistoricalVaR[];
}

export interface VaRMetric {
  confidence95: number;
  confidence99: number;
  parametric: number;
  historical: number;
  monteCarlo: number;
}

export interface ConditionalVaR {
  confidence95: number;
  confidence99: number;
  expectedShortfall: number;
}

export interface DrawdownMetrics {
  current: number;
  maximum: number;
  average: number;
  duration: number;
  recovery: number;
}

export interface VolatilityBreakdown {
  total: number;
  systematic: number;
  idiosyncratic: number;
  upside: number;
  downside: number;
}

export interface BetaAnalysis {
  overall: number;
  upBeta: number;
  downBeta: number;
  rolling: RollingBeta[];
  stability: BetaStability;
}

export interface DownsideRisk {
  downsideDeviation: number;
  downsideVariance: number;
  downsideFrequency: number;
  painIndex: number;
  ulcerIndex: number;
}

export interface ConcentrationRisk {
  herfindahlIndex: number;
  topHoldings: number;
  sectorConcentration: SectorConcentration[];
  diversificationRatio: number;
}

export interface LiquidityRisk {
  averageDailyVolume: number;
  bidAskSpread: number;
  marketImpact: number;
  liquidityScore: number;
}

export interface SectorAttribution {
  sector: string;
  allocation: number;
  selection: number;
  interaction: number;
  total: number;
}

export interface AssetAttribution {
  symbol: string;
  contribution: number;
  weight: number;
  return: number;
  attribution: number;
}

export interface FactorAttribution {
  factor: string;
  exposure: number;
  return: number;
  contribution: number;
}

export interface TimingAttribution {
  total: number;
  market: number;
  sector: number;
  security: number;
}

export interface SelectionAttribution {
  total: number;
  sector: SectorSelection[];
  security: SecuritySelection[];
}

export interface InteractionEffect {
  total: number;
  positive: number;
  negative: number;
  significance: number;
}

export interface CurrencyAttribution {
  total: number;
  hedged: number;
  unhedged: number;
  impact: number;
}

export interface DrawdownPeriod {
  start: Date;
  end: Date;
  trough: Date;
  peak: number;
  trough_value: number;
  drawdown: number;
  duration: number;
  recovery: number;
}

export interface RecoveryAnalysis {
  averageRecovery: number;
  medianRecovery: number;
  longestRecovery: number;
  currentRecovery: number;
  recoveryRatio: number;
}

export interface UnderwaterCurve {
  date: Date;
  drawdown: number;
  duration: number;
}

export interface DrawdownDuration {
  average: number;
  median: number;
  maximum: number;
  current: number;
}

export interface HistoricalVolatility {
  date: Date;
  volatility: number;
  period: string;
}

export interface VolatilityRegime {
  start: Date;
  end: Date;
  regime: 'low' | 'medium' | 'high';
  volatility: number;
  duration: number;
}

export interface VolatilityClustering {
  garchParameters: GARCHParams;
  persistence: number;
  clustering: number;
  meanReversion: number;
}

export interface GARCHParams {
  omega: number;
  alpha: number;
  beta: number;
  logLikelihood: number;
}

export interface VolatilityForecast {
  date: Date;
  forecast: number;
  confidence: ConfidenceInterval;
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
  confidence: number;
}

export interface VolatilityDecomposition {
  jump: number;
  diffusion: number;
  leverage: number;
  meanReversion: number;
}

export interface CorrelationMatrix {
  assets: string[];
  matrix: number[][];
  eigenvalues: number[];
  diversificationRatio: number;
}

export interface RollingCorrelation {
  date: Date;
  correlation: number;
  period: string;
}

export interface CorrelationBreakdown {
  average: number;
  minimum: number;
  maximum: number;
  stability: number;
  regimes: CorrelationRegime[];
}

export interface CorrelationStability {
  coefficient: number;
  pValue: number;
  breakpoints: Date[];
  regimes: number;
}

export interface CorrelationRegime {
  start: Date;
  end: Date;
  correlation: number;
  volatility: number;
  regime: 'crisis' | 'normal' | 'bull';
}

export interface SectorConcentration {
  sector: string;
  weight: number;
  risk: number;
}

export interface RollingBeta {
  date: Date;
  beta: number;
  rSquared: number;
  period: string;
}

export interface BetaStability {
  coefficient: number;
  pValue: number;
  stable: boolean;
}

export interface SectorSelection {
  sector: string;
  selection: number;
  significance: number;
}

export interface SecuritySelection {
  symbol: string;
  selection: number;
  tStat: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  fill?: boolean;
  tension?: number;
  pointRadius?: number;
}

export interface HeatmapData {
  x: string;
  y: string;
  value: number;
  color?: string;
}

export interface AnalyticsConfig {
  benchmarkSymbol: string;
  riskFreeRate: number;
  confidenceLevels: number[];
  rollingPeriods: number[];
  lookbackPeriod: number;
  rebalanceFrequency: 'daily' | 'weekly' | 'monthly';
}

export class AnalyticsEngine {
  private config: AnalyticsConfig;
  private priceData: { [symbol: string]: PricePoint[] } = {};
  private benchmarkData: PricePoint[] = [];
  private portfolioReturns: ReturnPoint[] = [];
  private benchmarkReturns: ReturnPoint[] = [];

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.initializeDemoData();
  }

  private initializeDemoData(): void {
    // Generate realistic demo data for analytics
    this.generateDemoPortfolioData();
    this.generateDemoBenchmarkData();
    this.calculateReturns();
  }

  private generateDemoPortfolioData(): void {
    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'];
    const days = 252 * 3; // 3 years of data
    
    for (const symbol of symbols) {
      const prices: PricePoint[] = [];
      let currentPrice = 100 + Math.random() * 400; // Random starting price
      
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - i));
        
        // Generate realistic price movement
        const volatility = this.getSymbolVolatility(symbol);
        const drift = 0.0003; // Small positive drift
        const randomChange = this.generateGaussianRandom() * volatility;
        const priceChange = drift + randomChange;
        
        currentPrice = currentPrice * (1 + priceChange);
        
        prices.push({
          date,
          price: currentPrice,
          volume: Math.floor(1000000 + Math.random() * 5000000)
        });
      }
      
      this.priceData[symbol] = prices;
    }
  }

  private generateDemoBenchmarkData(): void {
    const days = 252 * 3;
    let currentPrice = 4500; // S&P 500 starting level
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      const volatility = 0.016; // Market volatility
      const drift = 0.0002;
      const randomChange = this.generateGaussianRandom() * volatility;
      const priceChange = drift + randomChange;
      
      currentPrice = currentPrice * (1 + priceChange);
      
      this.benchmarkData.push({
        date,
        price: currentPrice,
        volume: Math.floor(3000000000 + Math.random() * 1000000000)
      });
    }
  }

  private calculateReturns(): void {
    // Calculate portfolio returns (weighted average)
    const weights = { AAPL: 0.3, MSFT: 0.25, GOOGL: 0.2, TSLA: 0.15, NVDA: 0.1 };
    
    for (let i = 1; i < this.benchmarkData.length; i++) {
      const date = this.benchmarkData[i].date;
      let portfolioReturn = 0;
      
      for (const [symbol, weight] of Object.entries(weights)) {
        const prices = this.priceData[symbol];
        if (prices && prices[i] && prices[i-1]) {
          const stockReturn = (prices[i].price - prices[i-1].price) / prices[i-1].price;
          portfolioReturn += stockReturn * weight;
        }
      }
      
      const benchmarkReturn = (this.benchmarkData[i].price - this.benchmarkData[i-1].price) / this.benchmarkData[i-1].price;
      
      this.portfolioReturns.push({ date, return: portfolioReturn });
      this.benchmarkReturns.push({ date, return: benchmarkReturn });
    }
  }

  private getSymbolVolatility(symbol: string): number {
    const volatilities: { [key: string]: number } = {
      'AAPL': 0.025,
      'MSFT': 0.022,
      'GOOGL': 0.028,
      'TSLA': 0.045,
      'NVDA': 0.040
    };
    return volatilities[symbol] || 0.025;
  }

  private generateGaussianRandom(): number {
    // Box-Muller transformation for Gaussian random numbers
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  // Main analytics calculation method
  calculateAnalytics(): AnalyticsMetrics {
    return {
      performance: this.calculatePerformanceMetrics(),
      risk: this.calculateRiskAnalytics(),
      attribution: this.calculateAttributionAnalysis(),
      benchmark: this.calculateBenchmarkComparison(),
      drawdown: this.calculateDrawdownAnalysis(),
      volatility: this.calculateVolatilityMetrics(),
      correlation: this.calculateCorrelationAnalysis(),
      efficiency: this.calculateEfficiencyMetrics()
    };
  }

  private calculatePerformanceMetrics(): PerformanceMetrics {
    const monthlyReturns = this.calculateMonthlyReturns();
    const cumulativeReturns = this.calculateCumulativeReturns();
    const rollingReturns = this.calculateRollingReturns();
    
    const totalReturn = cumulativeReturns[cumulativeReturns.length - 1]?.portfolio || 0;
    const annualizedReturn = Math.pow(1 + totalReturn, 252 / this.portfolioReturns.length) - 1;
    
    const sortedMonthly = [...monthlyReturns].sort((a, b) => a.return - b.return);
    const bestMonth = sortedMonthly[sortedMonthly.length - 1];
    const worstMonth = sortedMonthly[0];
    
    const positiveMonths = monthlyReturns.filter(m => m.return > 0).length;
    const negativeMonths = monthlyReturns.length - positiveMonths;
    
    const averageMonthlyReturn = monthlyReturns.reduce((sum, m) => sum + m.return, 0) / monthlyReturns.length;
    const monthlyVolatility = this.calculateStandardDeviation(monthlyReturns.map(m => m.return));

    return {
      totalReturn: totalReturn * 100,
      annualizedReturn: annualizedReturn * 100,
      monthlyReturns,
      cumulativeReturns,
      rollingReturns,
      periodReturns: this.calculatePeriodReturns(),
      bestMonth,
      worstMonth,
      positiveMonths,
      negativeMonths,
      averageMonthlyReturn: averageMonthlyReturn * 100,
      monthlyVolatility: monthlyVolatility * 100
    };
  }

  private calculateRiskAnalytics(): RiskAnalytics {
    const returns = this.portfolioReturns.map(r => r.return);
    
    return {
      valueAtRisk: this.calculateVaR(returns),
      expectedShortfall: this.calculateExpectedShortfall(returns, 0.05),
      maxDrawdown: this.calculateMaxDrawdown(),
      volatility: this.calculateVolatilityBreakdown(),
      beta: this.calculateBetaAnalysis(),
      downside: this.calculateDownsideRisk(returns),
      concentration: this.calculateConcentrationRisk(),
      liquidity: this.calculateLiquidityRisk()
    };
  }

  private calculateAttributionAnalysis(): AttributionAnalysis {
    return {
      sectors: this.calculateSectorAttribution(),
      assets: this.calculateAssetAttribution(),
      factors: this.calculateFactorAttribution(),
      timing: this.calculateTimingAttribution(),
      selection: this.calculateSelectionAttribution(),
      interaction: this.calculateInteractionEffect(),
      currency: this.calculateCurrencyAttribution()
    };
  }

  private calculateBenchmarkComparison(): BenchmarkComparison {
    const portfolioReturns = this.portfolioReturns.map(r => r.return);
    const benchmarkReturns = this.benchmarkReturns.map(r => r.return);
    
    const beta = this.calculateBeta(portfolioReturns, benchmarkReturns);
    const alpha = this.calculateAlpha(portfolioReturns, benchmarkReturns, beta);
    const trackingError = this.calculateTrackingError(portfolioReturns, benchmarkReturns);
    const correlation = this.calculateCorrelation(portfolioReturns, benchmarkReturns);
    
    const activeReturns = portfolioReturns.map((r, i) => r - benchmarkReturns[i]);
    const activeReturn = activeReturns.reduce((sum, r) => sum + r, 0) / activeReturns.length;
    const informationRatio = activeReturn / trackingError;
    
    const upCapture = this.calculateUpCapture(portfolioReturns, benchmarkReturns);
    const downCapture = this.calculateDownCapture(portfolioReturns, benchmarkReturns);
    
    const outperformancePeriods = activeReturns.filter(r => r > 0).length;
    const underperformancePeriods = activeReturns.length - outperformancePeriods;

    return {
      benchmark: this.config.benchmarkSymbol,
      alpha: alpha * 100,
      beta,
      trackingError: trackingError * 100,
      informationRatio,
      upCapture: upCapture * 100,
      downCapture: downCapture * 100,
      correlation,
      activeReturn: activeReturn * 100,
      outperformancePeriods,
      underperformancePeriods
    };
  }

  private calculateDrawdownAnalysis(): DrawdownAnalysis {
    const cumulativeReturns = this.calculateCumulativeReturns();
    const drawdowns: number[] = [];
    const periods: DrawdownPeriod[] = [];
    const underwater: UnderwaterCurve[] = [];
    
    let peak = 1;
    let peakDate = cumulativeReturns[0]?.date || new Date();
    let inDrawdown = false;
    let drawdownStart = peakDate;
    
    for (const point of cumulativeReturns) {
      const value = 1 + point.portfolio;
      
      if (value > peak) {
        // New peak
        if (inDrawdown) {
          // End of drawdown period
          periods.push({
            start: drawdownStart,
            end: point.date,
            trough: point.date,
            peak,
            trough_value: value,
            drawdown: (peak - value) / peak * 100,
            duration: this.daysBetween(drawdownStart, point.date),
            recovery: 0
          });
          inDrawdown = false;
        }
        peak = value;
        peakDate = point.date;
      }
      
      const drawdown = (peak - value) / peak;
      drawdowns.push(drawdown);
      
      if (drawdown > 0 && !inDrawdown) {
        inDrawdown = true;
        drawdownStart = point.date;
      }
      
      underwater.push({
        date: point.date,
        drawdown: drawdown * 100,
        duration: inDrawdown ? this.daysBetween(drawdownStart, point.date) : 0
      });
    }
    
    const maxDrawdown = Math.max(...drawdowns) * 100;
    const averageDrawdown = drawdowns.reduce((sum, d) => sum + d, 0) / drawdowns.length * 100;
    const currentDrawdown = drawdowns[drawdowns.length - 1] * 100;
    
    return {
      current: currentDrawdown,
      maximum: maxDrawdown,
      average: averageDrawdown,
      periods,
      recovery: this.calculateRecoveryAnalysis(periods),
      underwater,
      duration: this.calculateDrawdownDuration(periods)
    };
  }

  private calculateVolatilityMetrics(): VolatilityMetrics {
    const returns = this.portfolioReturns.map(r => r.return);
    const realized = this.calculateStandardDeviation(returns) * Math.sqrt(252) * 100;
    
    return {
      realized,
      implied: realized * 1.2, // Simplified
      historical: this.calculateHistoricalVolatility(),
      regime: this.calculateVolatilityRegimes(),
      clustering: this.calculateVolatilityClustering(returns),
      forecast: this.calculateVolatilityForecast(),
      decomposition: this.calculateVolatilityDecomposition()
    };
  }

  private calculateCorrelationAnalysis(): CorrelationAnalysis {
    const symbols = Object.keys(this.priceData);
    const matrix: number[][] = [];
    
    // Calculate correlation matrix
    for (let i = 0; i < symbols.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < symbols.length; j++) {
        if (i === j) {
          matrix[i][j] = 1.0;
        } else {
          const returns1 = this.calculateAssetReturns(symbols[i]);
          const returns2 = this.calculateAssetReturns(symbols[j]);
          matrix[i][j] = this.calculateCorrelation(returns1, returns2);
        }
      }
    }
    
    const correlations = matrix.flat().filter(c => c !== 1.0);
    const average = correlations.reduce((sum, c) => sum + c, 0) / correlations.length;
    const minimum = Math.min(...correlations);
    const maximum = Math.max(...correlations);
    
    return {
      matrix: {
        assets: symbols,
        matrix,
        eigenvalues: this.calculateEigenvalues(matrix),
        diversificationRatio: this.calculateDiversificationRatio(matrix)
      },
      rolling: this.calculateRollingCorrelation(),
      breakdown: {
        average,
        minimum,
        maximum,
        stability: this.calculateCorrelationStability(),
        regimes: this.calculateCorrelationRegimes()
      },
      stability: {
        coefficient: 0.85,
        pValue: 0.02,
        breakpoints: [],
        regimes: 2
      },
      regime: this.calculateCorrelationRegimes()
    };
  }

  private calculateEfficiencyMetrics(): EfficiencyMetrics {
    const returns = this.portfolioReturns.map(r => r.return);
    const benchmarkReturns = this.benchmarkReturns.map(r => r.return);
    const riskFreeRate = this.config.riskFreeRate / 252; // Daily risk-free rate
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const volatility = this.calculateStandardDeviation(returns);
    const downsideDeviation = this.calculateDownsideDeviation(returns, riskFreeRate);
    
    const beta = this.calculateBeta(returns, benchmarkReturns);
    const alpha = this.calculateAlpha(returns, benchmarkReturns, beta);
    const trackingError = this.calculateTrackingError(returns, benchmarkReturns);
    
    const maxDrawdown = this.calculateMaxDrawdown().maximum / 100;
    
    return {
      sharpeRatio: (avgReturn - riskFreeRate) / volatility,
      sortinoRatio: (avgReturn - riskFreeRate) / downsideDeviation,
      calmarRatio: (avgReturn * 252) / maxDrawdown,
      sterlingRatio: (avgReturn * 252) / (maxDrawdown * 1.1),
      burkeRatio: (avgReturn - riskFreeRate) / Math.sqrt(this.calculateBurkeRatio(returns)),
      martinRatio: (avgReturn - riskFreeRate) / this.calculateUlcerIndex(returns),
      treynorRatio: (avgReturn - riskFreeRate) / beta,
      jensenAlpha: alpha,
      modiglianiRatio: (avgReturn - riskFreeRate) * (this.calculateStandardDeviation(benchmarkReturns) / volatility),
      informationRatio: alpha / trackingError
    };
  }

  // Helper calculation methods
  private calculateMonthlyReturns(): MonthlyReturn[] {
    const monthlyData: { [key: string]: { portfolio: number[], benchmark: number[] } } = {};
    
    for (let i = 0; i < this.portfolioReturns.length; i++) {
      const date = this.portfolioReturns[i].date;
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { portfolio: [], benchmark: [] };
      }
      
      monthlyData[monthKey].portfolio.push(this.portfolioReturns[i].return);
      monthlyData[monthKey].benchmark.push(this.benchmarkReturns[i].return);
    }
    
    return Object.entries(monthlyData).map(([monthKey, data]) => {
      const [year, month] = monthKey.split('-').map(Number);
      const date = new Date(year, month, 1);
      
      const portfolioReturn = data.portfolio.reduce((prod, r) => prod * (1 + r), 1) - 1;
      const benchmarkReturn = data.benchmark.reduce((prod, r) => prod * (1 + r), 1) - 1;
      
      return {
        date,
        return: portfolioReturn,
        benchmark: benchmarkReturn,
        outperformance: portfolioReturn - benchmarkReturn
      };
    });
  }

  private calculateCumulativeReturns(): CumulativeReturn[] {
    const cumulative: CumulativeReturn[] = [];
    let portfolioCum = 0;
    let benchmarkCum = 0;
    
    for (let i = 0; i < this.portfolioReturns.length; i++) {
      portfolioCum = (1 + portfolioCum) * (1 + this.portfolioReturns[i].return) - 1;
      benchmarkCum = (1 + benchmarkCum) * (1 + this.benchmarkReturns[i].return) - 1;
      
      cumulative.push({
        date: this.portfolioReturns[i].date,
        portfolio: portfolioCum,
        benchmark: benchmarkCum
      });
    }
    
    return cumulative;
  }

  private calculateRollingReturns(): RollingReturn[] {
    const periods = [30, 90, 252]; // 1 month, 3 months, 1 year
    const rolling: RollingReturn[] = [];
    
    for (const period of periods) {
      for (let i = period; i < this.portfolioReturns.length; i++) {
        const returns = this.portfolioReturns.slice(i - period, i).map(r => r.return);
        const totalReturn = returns.reduce((prod, r) => prod * (1 + r), 1) - 1;
        const volatility = this.calculateStandardDeviation(returns) * Math.sqrt(252);
        const sharpe = (totalReturn - this.config.riskFreeRate) / volatility;
        
        rolling.push({
          date: this.portfolioReturns[i].date,
          period: `${period}d`,
          return: totalReturn,
          volatility,
          sharpe
        });
      }
    }
    
    return rolling;
  }

  private calculatePeriodReturns(): PeriodReturn[] {
    const periods = ['1D', '1W', '1M', '3M', '6M', '1Y', '2Y', '3Y'];
    const results: PeriodReturn[] = [];
    const now = new Date();
    
    for (const period of periods) {
      const days = this.periodToDays(period);
      if (days <= this.portfolioReturns.length) {
        const startIndex = this.portfolioReturns.length - days;
        const returns = this.portfolioReturns.slice(startIndex).map(r => r.return);
        const benchmarkRets = this.benchmarkReturns.slice(startIndex).map(r => r.return);
        
        const portfolioReturn = returns.reduce((prod, r) => prod * (1 + r), 1) - 1;
        const benchmarkReturn = benchmarkRets.reduce((prod, r) => prod * (1 + r), 1) - 1;
        
        results.push({
          period,
          return: portfolioReturn * 100,
          benchmark: benchmarkReturn * 100,
          outperformance: (portfolioReturn - benchmarkReturn) * 100
        });
      }
    }
    
    return results;
  }

  private calculateVaR(returns: number[]): VaRAnalysis {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const n = sortedReturns.length;
    
    const var95 = sortedReturns[Math.floor(n * 0.05)];
    const var99 = sortedReturns[Math.floor(n * 0.01)];
    
    return {
      daily: {
        confidence95: Math.abs(var95) * 100,
        confidence99: Math.abs(var99) * 100,
        parametric: this.calculateParametricVaR(returns, 0.05) * 100,
        historical: Math.abs(var95) * 100,
        monteCarlo: this.calculateMonteCarloVaR(returns, 0.05) * 100
      },
      weekly: {
        confidence95: Math.abs(var95) * Math.sqrt(5) * 100,
        confidence99: Math.abs(var99) * Math.sqrt(5) * 100,
        parametric: this.calculateParametricVaR(returns, 0.05) * Math.sqrt(5) * 100,
        historical: Math.abs(var95) * Math.sqrt(5) * 100,
        monteCarlo: this.calculateMonteCarloVaR(returns, 0.05) * Math.sqrt(5) * 100
      },
      monthly: {
        confidence95: Math.abs(var95) * Math.sqrt(21) * 100,
        confidence99: Math.abs(var99) * Math.sqrt(21) * 100,
        parametric: this.calculateParametricVaR(returns, 0.05) * Math.sqrt(21) * 100,
        historical: Math.abs(var95) * Math.sqrt(21) * 100,
        monteCarlo: this.calculateMonteCarloVaR(returns, 0.05) * Math.sqrt(21) * 100
      },
      conditional: {
        confidence95: this.calculateExpectedShortfall(returns, 0.05) * 100,
        confidence99: this.calculateExpectedShortfall(returns, 0.01) * 100,
        expectedShortfall: this.calculateExpectedShortfall(returns, 0.05) * 100
      },
      historical: returns.map((r, i) => ({
        date: this.portfolioReturns[i].date,
        var95: Math.abs(var95) * 100,
        var99: Math.abs(var99) * 100
      }))
    };
  }

  // Additional helper methods for complex calculations
  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    const meanX = x.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    
    for (let i = 0; i < n; i++) {
      const deltaX = x[i] - meanX;
      const deltaY = y[i] - meanY;
      numerator += deltaX * deltaY;
      denomX += deltaX * deltaX;
      denomY += deltaY * deltaY;
    }
    
    return numerator / Math.sqrt(denomX * denomY);
  }

  private calculateBeta(portfolioReturns: number[], benchmarkReturns: number[]): number {
    const covariance = this.calculateCovariance(portfolioReturns, benchmarkReturns);
    const benchmarkVariance = this.calculateVariance(benchmarkReturns);
    return covariance / benchmarkVariance;
  }

  private calculateAlpha(portfolioReturns: number[], benchmarkReturns: number[], beta: number): number {
    const portfolioMean = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
    const benchmarkMean = benchmarkReturns.reduce((sum, r) => sum + r, 0) / benchmarkReturns.length;
    const riskFreeRate = this.config.riskFreeRate / 252;
    
    return portfolioMean - riskFreeRate - beta * (benchmarkMean - riskFreeRate);
  }

  private calculateCovariance(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    const meanX = x.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    
    return x.slice(0, n).reduce((sum, val, i) => sum + (val - meanX) * (y[i] - meanY), 0) / n;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  private calculateTrackingError(portfolioReturns: number[], benchmarkReturns: number[]): number {
    const activeReturns = portfolioReturns.map((r, i) => r - benchmarkReturns[i]);
    return this.calculateStandardDeviation(activeReturns);
  }

  private calculateExpectedShortfall(returns: number[], confidence: number): number {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const cutoff = Math.floor(returns.length * confidence);
    const tailReturns = sortedReturns.slice(0, cutoff);
    return Math.abs(tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length);
  }

  private calculateUpCapture(portfolioReturns: number[], benchmarkReturns: number[]): number {
    const upPeriods = benchmarkReturns.map((r, i) => ({ portfolio: portfolioReturns[i], benchmark: r }))
      .filter(p => p.benchmark > 0);
    
    if (upPeriods.length === 0) return 0;
    
    const portfolioUpReturn = upPeriods.reduce((sum, p) => sum + p.portfolio, 0) / upPeriods.length;
    const benchmarkUpReturn = upPeriods.reduce((sum, p) => sum + p.benchmark, 0) / upPeriods.length;
    
    return portfolioUpReturn / benchmarkUpReturn;
  }

  private calculateDownCapture(portfolioReturns: number[], benchmarkReturns: number[]): number {
    const downPeriods = benchmarkReturns.map((r, i) => ({ portfolio: portfolioReturns[i], benchmark: r }))
      .filter(p => p.benchmark < 0);
    
    if (downPeriods.length === 0) return 0;
    
    const portfolioDownReturn = downPeriods.reduce((sum, p) => sum + p.portfolio, 0) / downPeriods.length;
    const benchmarkDownReturn = downPeriods.reduce((sum, p) => sum + p.benchmark, 0) / downPeriods.length;
    
    return portfolioDownReturn / benchmarkDownReturn;
  }

  // Placeholder methods for complex calculations (would be fully implemented in production)
  private calculateMaxDrawdown(): DrawdownMetrics {
    const cumReturns = this.calculateCumulativeReturns();
    let maxDrawdown = 0;
    let peak = 1;
    let currentDrawdown = 0;
    
    for (const point of cumReturns) {
      const value = 1 + point.portfolio;
      if (value > peak) {
        peak = value;
      }
      const drawdown = (peak - value) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
      currentDrawdown = drawdown;
    }
    
    return {
      current: currentDrawdown * 100,
      maximum: maxDrawdown * 100,
      average: maxDrawdown * 0.6 * 100, // Simplified
      duration: 45, // Simplified
      recovery: 30 // Simplified
    };
  }

  private calculateVolatilityBreakdown(): VolatilityBreakdown {
    const returns = this.portfolioReturns.map(r => r.return);
    const totalVol = this.calculateStandardDeviation(returns) * Math.sqrt(252) * 100;
    
    return {
      total: totalVol,
      systematic: totalVol * 0.7,
      idiosyncratic: totalVol * 0.3,
      upside: totalVol * 0.9,
      downside: totalVol * 1.1
    };
  }

  private calculateBetaAnalysis(): BetaAnalysis {
    const portfolioReturns = this.portfolioReturns.map(r => r.return);
    const benchmarkReturns = this.benchmarkReturns.map(r => r.return);
    
    const overallBeta = this.calculateBeta(portfolioReturns, benchmarkReturns);
    
    // Calculate up and down beta
    const upPeriods = benchmarkReturns.map((r, i) => ({ portfolio: portfolioReturns[i], benchmark: r }))
      .filter(p => p.benchmark > 0);
    const downPeriods = benchmarkReturns.map((r, i) => ({ portfolio: portfolioReturns[i], benchmark: r }))
      .filter(p => p.benchmark < 0);
    
    const upBeta = upPeriods.length > 0 ? 
      this.calculateBeta(upPeriods.map(p => p.portfolio), upPeriods.map(p => p.benchmark)) : 0;
    const downBeta = downPeriods.length > 0 ? 
      this.calculateBeta(downPeriods.map(p => p.portfolio), downPeriods.map(p => p.benchmark)) : 0;
    
    return {
      overall: overallBeta,
      upBeta,
      downBeta,
      rolling: this.calculateRollingBeta(),
      stability: {
        coefficient: 0.85,
        pValue: 0.02,
        stable: true
      }
    };
  }

  private calculateDownsideRisk(returns: number[]): DownsideRisk {
    const target = this.config.riskFreeRate / 252;
    const downsideReturns = returns.filter(r => r < target);
    const downsideDeviation = this.calculateDownsideDeviation(returns, target);
    
    return {
      downsideDeviation: downsideDeviation * Math.sqrt(252) * 100,
      downsideVariance: Math.pow(downsideDeviation, 2) * 252 * 10000,
      downsideFrequency: (downsideReturns.length / returns.length) * 100,
      painIndex: this.calculatePainIndex(returns),
      ulcerIndex: this.calculateUlcerIndex(returns)
    };
  }

  private calculateConcentrationRisk(): ConcentrationRisk {
    const weights = [0.3, 0.25, 0.2, 0.15, 0.1]; // Portfolio weights
    const hhi = weights.reduce((sum, w) => sum + w * w, 0);
    const topHoldings = weights.slice(0, 3).reduce((sum, w) => sum + w, 0) * 100;
    
    return {
      herfindahlIndex: hhi,
      topHoldings,
      sectorConcentration: [
        { sector: 'Technology', weight: 75, risk: 8.5 },
        { sector: 'Consumer Discretionary', weight: 15, risk: 6.2 },
        { sector: 'Communication', weight: 10, risk: 7.1 }
      ],
      diversificationRatio: 0.65
    };
  }

  private calculateLiquidityRisk(): LiquidityRisk {
    return {
      averageDailyVolume: 2500000,
      bidAskSpread: 0.02,
      marketImpact: 0.15,
      liquidityScore: 8.5
    };
  }

  // Simplified implementations for complex methods
  private calculateSectorAttribution(): SectorAttribution[] {
    return [
      { sector: 'Technology', allocation: 2.1, selection: 1.8, interaction: 0.3, total: 4.2 },
      { sector: 'Consumer Discretionary', allocation: -0.5, selection: 0.8, interaction: -0.1, total: 0.2 },
      { sector: 'Communication', allocation: 0.3, selection: -0.2, interaction: 0.0, total: 0.1 }
    ];
  }

  private calculateAssetAttribution(): AssetAttribution[] {
    return [
      { symbol: 'AAPL', contribution: 1.8, weight: 30, return: 15.2, attribution: 4.56 },
      { symbol: 'MSFT', contribution: 1.5, weight: 25, return: 12.8, attribution: 3.20 },
      { symbol: 'GOOGL', contribution: 0.9, weight: 20, return: 8.5, attribution: 1.70 },
      { symbol: 'TSLA', contribution: -0.3, weight: 15, return: -2.1, attribution: -0.32 },
      { symbol: 'NVDA', contribution: 2.1, weight: 10, return: 28.5, attribution: 2.85 }
    ];
  }

  private calculateFactorAttribution(): FactorAttribution[] {
    return [
      { factor: 'Market', exposure: 0.95, return: 8.2, contribution: 7.79 },
      { factor: 'Size', exposure: -0.15, return: -2.1, contribution: 0.32 },
      { factor: 'Value', exposure: -0.25, return: 3.5, contribution: -0.88 },
      { factor: 'Momentum', exposure: 0.35, return: 12.1, contribution: 4.24 },
      { factor: 'Quality', exposure: 0.45, return: 6.8, contribution: 3.06 }
    ];
  }

  private calculateTimingAttribution(): TimingAttribution {
    return {
      total: 0.8,
      market: 0.3,
      sector: 0.4,
      security: 0.1
    };
  }

  private calculateSelectionAttribution(): SelectionAttribution {
    return {
      total: 2.1,
      sector: [
        { sector: 'Technology', selection: 1.8, significance: 0.02 },
        { sector: 'Consumer Discretionary', selection: 0.3, significance: 0.15 }
      ],
      security: [
        { symbol: 'AAPL', selection: 0.8, tStat: 2.1 },
        { symbol: 'NVDA', selection: 1.2, tStat: 1.8 }
      ]
    };
  }

  private calculateInteractionEffect(): InteractionEffect {
    return {
      total: 0.3,
      positive: 0.5,
      negative: -0.2,
      significance: 0.08
    };
  }

  private calculateCurrencyAttribution(): CurrencyAttribution {
    return {
      total: 0.0,
      hedged: 0.0,
      unhedged: 0.0,
      impact: 0.0
    };
  }

  private calculateRecoveryAnalysis(periods: DrawdownPeriod[]): RecoveryAnalysis {
    const recoveries = periods.map(p => p.recovery).filter(r => r > 0);
    
    return {
      averageRecovery: recoveries.reduce((sum, r) => sum + r, 0) / recoveries.length || 0,
      medianRecovery: this.calculateMedian(recoveries),
      longestRecovery: Math.max(...recoveries, 0),
      currentRecovery: 0,
      recoveryRatio: 0.75
    };
  }

  private calculateDrawdownDuration(periods: DrawdownPeriod[]): DrawdownDuration {
    const durations = periods.map(p => p.duration);
    
    return {
      average: durations.reduce((sum, d) => sum + d, 0) / durations.length || 0,
      median: this.calculateMedian(durations),
      maximum: Math.max(...durations, 0),
      current: 0
    };
  }

  private calculateHistoricalVolatility(): HistoricalVolatility[] {
    const periods = [30, 90, 252];
    const results: HistoricalVolatility[] = [];
    
    for (const period of periods) {
      for (let i = period; i < this.portfolioReturns.length; i += 10) {
        const returns = this.portfolioReturns.slice(i - period, i).map(r => r.return);
        const volatility = this.calculateStandardDeviation(returns) * Math.sqrt(252) * 100;
        
        results.push({
          date: this.portfolioReturns[i].date,
          volatility,
          period: `${period}d`
        });
      }
    }
    
    return results;
  }

  private calculateVolatilityRegimes(): VolatilityRegime[] {
    // Simplified regime detection
    return [
      {
        start: new Date(2023, 0, 1),
        end: new Date(2023, 5, 30),
        regime: 'low',
        volatility: 12.5,
        duration: 150
      },
      {
        start: new Date(2023, 6, 1),
        end: new Date(2023, 9, 30),
        regime: 'high',
        volatility: 28.3,
        duration: 120
      },
      {
        start: new Date(2023, 10, 1),
        end: new Date(),
        regime: 'medium',
        volatility: 18.7,
        duration: 90
      }
    ];
  }

  private calculateVolatilityClustering(returns: number[]): VolatilityClustering {
    // Simplified GARCH estimation
    return {
      garchParameters: {
        omega: 0.000001,
        alpha: 0.08,
        beta: 0.91,
        logLikelihood: 1250.5
      },
      persistence: 0.99,
      clustering: 0.75,
      meanReversion: 0.25
    };
  }

  private calculateVolatilityForecast(): VolatilityForecast[] {
    const forecasts: VolatilityForecast[] = [];
    const currentVol = 18.5;
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const forecast = currentVol * (1 + (Math.random() - 0.5) * 0.1);
      
      forecasts.push({
        date,
        forecast,
        confidence: {
          lower: forecast * 0.8,
          upper: forecast * 1.2,
          confidence: 95
        }
      });
    }
    
    return forecasts;
  }

  private calculateVolatilityDecomposition(): VolatilityDecomposition {
    return {
      jump: 0.15,
      diffusion: 0.75,
      leverage: 0.08,
      meanReversion: 0.02
    };
  }

  private calculateRollingCorrelation(): RollingCorrelation[] {
    const results: RollingCorrelation[] = [];
    const window = 60;
    
    for (let i = window; i < this.portfolioReturns.length; i += 5) {
      const portfolioReturns = this.portfolioReturns.slice(i - window, i).map(r => r.return);
      const benchmarkReturns = this.benchmarkReturns.slice(i - window, i).map(r => r.return);
      const correlation = this.calculateCorrelation(portfolioReturns, benchmarkReturns);
      
      results.push({
        date: this.portfolioReturns[i].date,
        correlation,
        period: `${window}d`
      });
    }
    
    return results;
  }

  private calculateCorrelationRegimes(): CorrelationRegime[] {
    return [
      {
        start: new Date(2023, 0, 1),
        end: new Date(2023, 7, 31),
        correlation: 0.65,
        volatility: 15.2,
        regime: 'normal'
      },
      {
        start: new Date(2023, 8, 1),
        end: new Date(2023, 10, 31),
        correlation: 0.85,
        volatility: 28.5,
        regime: 'crisis'
      },
      {
        start: new Date(2023, 11, 1),
        end: new Date(),
        correlation: 0.72,
        volatility: 18.3,
        regime: 'bull'
      }
    ];
  }

  // Additional helper methods
  private calculateAssetReturns(symbol: string): number[] {
    const prices = this.priceData[symbol];
    if (!prices || prices.length < 2) return [];
    
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i].price - prices[i-1].price) / prices[i-1].price);
    }
    
    return returns;
  }

  private calculateEigenvalues(matrix: number[][]): number[] {
    // Simplified eigenvalue calculation (would use proper linear algebra library)
    return [2.1, 1.8, 0.9, 0.2, 0.0];
  }

  private calculateDiversificationRatio(matrix: number[][]): number {
    // Simplified diversification ratio calculation
    return 0.65;
  }

  private calculateCorrelationStability(): number {
    // Simplified stability measure
    return 0.75;
  }

  private calculateRollingBeta(): RollingBeta[] {
    const results: RollingBeta[] = [];
    const window = 60;
    
    for (let i = window; i < this.portfolioReturns.length; i += 10) {
      const portfolioReturns = this.portfolioReturns.slice(i - window, i).map(r => r.return);
      const benchmarkReturns = this.benchmarkReturns.slice(i - window, i).map(r => r.return);
      
      const beta = this.calculateBeta(portfolioReturns, benchmarkReturns);
      const correlation = this.calculateCorrelation(portfolioReturns, benchmarkReturns);
      const rSquared = correlation * correlation;
      
      results.push({
        date: this.portfolioReturns[i].date,
        beta,
        rSquared,
        period: `${window}d`
      });
    }
    
    return results;
  }

  private calculateDownsideDeviation(returns: number[], target: number): number {
    const downsideReturns = returns.filter(r => r < target).map(r => r - target);
    if (downsideReturns.length === 0) return 0;
    
    const variance = downsideReturns.reduce((sum, r) => sum + r * r, 0) / downsideReturns.length;
    return Math.sqrt(variance);
  }

  private calculateParametricVaR(returns: number[], confidence: number): number {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const std = this.calculateStandardDeviation(returns);
    const zScore = this.getZScore(confidence);
    return mean - zScore * std;
  }

  private calculateMonteCarloVaR(returns: number[], confidence: number): number {
    // Simplified Monte Carlo VaR
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const std = this.calculateStandardDeviation(returns);
    
    const simulations: number[] = [];
    for (let i = 0; i < 10000; i++) {
      simulations.push(mean + std * this.generateGaussianRandom());
    }
    
    simulations.sort((a, b) => a - b);
    return Math.abs(simulations[Math.floor(simulations.length * confidence)]);
  }

  private calculatePainIndex(returns: number[]): number {
    // Simplified pain index calculation
    const cumReturns = this.calculateCumulativeReturns();
    let painSum = 0;
    let peak = 1;
    
    for (const point of cumReturns) {
      const value = 1 + point.portfolio;
      if (value > peak) peak = value;
      const drawdown = (peak - value) / peak;
      painSum += drawdown;
    }
    
    return (painSum / cumReturns.length) * 100;
  }

  private calculateUlcerIndex(returns: number[]): number {
    const cumReturns = this.calculateCumulativeReturns();
    let ulcerSum = 0;
    let peak = 1;
    
    for (const point of cumReturns) {
      const value = 1 + point.portfolio;
      if (value > peak) peak = value;
      const drawdown = (peak - value) / peak;
      ulcerSum += drawdown * drawdown;
    }
    
    return Math.sqrt(ulcerSum / cumReturns.length) * 100;
  }

  private calculateBurkeRatio(returns: number[]): number {
    const cumReturns = this.calculateCumulativeReturns();
    let burkeSum = 0;
    let peak = 1;
    
    for (const point of cumReturns) {
      const value = 1 + point.portfolio;
      if (value > peak) peak = value;
      const drawdown = (peak - value) / peak;
      burkeSum += drawdown * drawdown;
    }
    
    return burkeSum / cumReturns.length;
  }

  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  private getZScore(confidence: number): number {
    // Simplified z-score lookup
    const zScores: { [key: number]: number } = {
      0.01: 2.33,
      0.05: 1.65,
      0.10: 1.28
    };
    return zScores[confidence] || 1.65;
  }

  private daysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private periodToDays(period: string): number {
    const periodMap: { [key: string]: number } = {
      '1D': 1,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 252,
      '2Y': 504,
      '3Y': 756
    };
    return periodMap[period] || 1;
  }

  // Chart data generation methods
  generatePerformanceChart(): ChartData {
    const cumReturns = this.calculateCumulativeReturns();
    
    return {
      labels: cumReturns.map(r => r.date.toLocaleDateString()),
      datasets: [
        {
          label: 'Portfolio',
          data: cumReturns.map(r => (r.portfolio * 100)),
          borderColor: '#58a6ff',
          backgroundColor: 'rgba(88, 166, 255, 0.1)',
          fill: false,
          tension: 0.1
        },
        {
          label: 'Benchmark',
          data: cumReturns.map(r => (r.benchmark * 100)),
          borderColor: '#8b949e',
          backgroundColor: 'rgba(139, 148, 158, 0.1)',
          fill: false,
          tension: 0.1
        }
      ]
    };
  }

  generateDrawdownChart(): ChartData {
    const drawdownAnalysis = this.calculateDrawdownAnalysis();
    
    return {
      labels: drawdownAnalysis.underwater.map(u => u.date.toLocaleDateString()),
      datasets: [
        {
          label: 'Drawdown',
          data: drawdownAnalysis.underwater.map(u => -u.drawdown),
          borderColor: '#ff7b72',
          backgroundColor: 'rgba(255, 123, 114, 0.2)',
          fill: true,
          tension: 0.1
        }
      ]
    };
  }

  generateVolatilityChart(): ChartData {
    const volMetrics = this.calculateVolatilityMetrics();
    
    return {
      labels: volMetrics.historical.map(h => h.date.toLocaleDateString()),
      datasets: [
        {
          label: 'Realized Volatility',
          data: volMetrics.historical.map(h => h.volatility),
          borderColor: '#a5a5ff',
          backgroundColor: 'rgba(165, 165, 255, 0.1)',
          fill: false,
          tension: 0.1
        }
      ]
    };
  }

  generateCorrelationHeatmap(): HeatmapData[] {
    const corrAnalysis = this.calculateCorrelationAnalysis();
    const heatmapData: HeatmapData[] = [];
    
    for (let i = 0; i < corrAnalysis.matrix.assets.length; i++) {
      for (let j = 0; j < corrAnalysis.matrix.assets.length; j++) {
        heatmapData.push({
          x: corrAnalysis.matrix.assets[i],
          y: corrAnalysis.matrix.assets[j],
          value: corrAnalysis.matrix.matrix[i][j],
          color: this.getCorrelationColor(corrAnalysis.matrix.matrix[i][j])
        });
      }
    }
    
    return heatmapData;
  }

  private getCorrelationColor(correlation: number): string {
    if (correlation > 0.7) return '#ff7b72';
    if (correlation > 0.3) return '#f2cc60';
    if (correlation > -0.3) return '#8b949e';
    if (correlation > -0.7) return '#58a6ff';
    return '#3fb950';
  }
}

// Supporting interfaces for price data
interface PricePoint {
  date: Date;
  price: number;
  volume: number;
}

interface ReturnPoint {
  date: Date;
  return: number;
}

// Singleton instance
let analyticsEngine: AnalyticsEngine | null = null;

export const getAnalyticsEngine = (config?: AnalyticsConfig): AnalyticsEngine => {
  if (!analyticsEngine) {
    const defaultConfig: AnalyticsConfig = {
      benchmarkSymbol: 'SPY',
      riskFreeRate: 0.02,
      confidenceLevels: [0.95, 0.99],
      rollingPeriods: [30, 90, 252],
      lookbackPeriod: 756, // 3 years
      rebalanceFrequency: 'daily'
    };
    analyticsEngine = new AnalyticsEngine(config || defaultConfig);
  }
  return analyticsEngine;
};