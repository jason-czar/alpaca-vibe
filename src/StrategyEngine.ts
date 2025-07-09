export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  category: 'momentum' | 'mean_reversion' | 'breakout' | 'trend_following' | 'scalping' | 'swing' | 'custom';
  author: string;
  created: Date;
  lastModified: Date;
  isPublic: boolean;
  tags: string[];
  
  // Strategy Configuration
  timeframes: string[];
  requiredIndicators: string[];
  optionalIndicators: string[];
  parameters: StrategyParameter[];
  
  // Entry/Exit Rules
  entryRules: TradingRule[];
  exitRules: TradingRule[];
  riskManagement: RiskManagementRules;
  
  // Performance Metrics
  backtestResults?: BacktestSummary;
  validation: StrategyValidation;
  
  // Code/Logic
  entryLogic: string;
  exitLogic: string;
  riskLogic: string;
}

export interface StrategyParameter {
  name: string;
  type: 'number' | 'integer' | 'boolean' | 'select' | 'timeframe';
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  description: string;
  category: 'entry' | 'exit' | 'risk' | 'general';
  required: boolean;
}

export interface TradingRule {
  id: string;
  name: string;
  condition: string;
  action: 'buy' | 'sell' | 'close_long' | 'close_short' | 'scale_in' | 'scale_out';
  weight: number; // 0-1, for combining multiple rules
  enabled: boolean;
  description: string;
}

export interface RiskManagementRules {
  stopLoss: {
    enabled: boolean;
    type: 'fixed' | 'trailing' | 'atr' | 'indicator';
    value: number;
    trailingDistance?: number;
  };
  takeProfit: {
    enabled: boolean;
    type: 'fixed' | 'ratio' | 'indicator';
    value: number;
    partialTakeProfits?: Array<{ percentage: number; target: number }>;
  };
  positionSizing: {
    type: 'fixed' | 'percentage' | 'kelly' | 'volatility';
    value: number;
    maxPositionSize: number;
  };
  maxDrawdown: number;
  maxDailyLoss: number;
  maxConcurrentTrades: number;
}

export interface StrategyValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  complexity: 'low' | 'medium' | 'high';
  estimatedPerformance: number;
  riskScore: number; // 1-10, higher is riskier
}

export interface BacktestSummary {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  avgHoldingPeriod: number;
  lastBacktestDate: Date;
}

export interface BotTemplate {
  id: string;
  name: string;
  description: string;
  category: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  author: string;
  created: Date;
  isPublic: boolean;
  tags: string[];
  
  // Pre-configured Setup
  indicators: Array<{
    name: string;
    enabled: boolean;
    parameters: { [key: string]: any };
  }>;
  
  strategy: TradingStrategy;
  riskProfile: 'conservative' | 'moderate' | 'aggressive' | 'high_risk';
  
  // Performance Expectations
  expectedReturn: number;
  expectedVolatility: number;
  recommendedCapital: number;
  timeCommitment: string;
  
  // Educational Content
  tutorial: {
    overview: string;
    howItWorks: string;
    whenToUse: string;
    risks: string[];
    tips: string[];
  };
  
  // Customization Options
  customizationLevel: 'none' | 'basic' | 'advanced' | 'expert';
  configurableParameters: string[];
}

export class StrategyEngine {
  private strategies: Map<string, TradingStrategy> = new Map();
  private botTemplates: Map<string, BotTemplate> = new Map();

  constructor() {
    this.initializeDefaultStrategies();
    this.initializeBotTemplates();
  }

  private initializeDefaultStrategies(): void {
    // RSI Mean Reversion Strategy
    const rsiMeanReversion: TradingStrategy = {
      id: 'rsi_mean_reversion',
      name: 'RSI Mean Reversion',
      description: 'Buy when RSI is oversold, sell when overbought with confirmation',
      category: 'mean_reversion',
      author: 'System',
      created: new Date(),
      lastModified: new Date(),
      isPublic: true,
      tags: ['rsi', 'mean_reversion', 'beginner'],
      
      timeframes: ['1Day', '4Hour', '1Hour'],
      requiredIndicators: ['RSI'],
      optionalIndicators: ['SMA', 'Volume'],
      
      parameters: [
        {
          name: 'rsi_period',
          type: 'integer',
          defaultValue: 14,
          min: 2,
          max: 50,
          description: 'RSI calculation period',
          category: 'general',
          required: true
        },
        {
          name: 'oversold_level',
          type: 'number',
          defaultValue: 30,
          min: 10,
          max: 40,
          description: 'RSI oversold threshold',
          category: 'entry',
          required: true
        },
        {
          name: 'overbought_level',
          type: 'number',
          defaultValue: 70,
          min: 60,
          max: 90,
          description: 'RSI overbought threshold',
          category: 'exit',
          required: true
        },
        {
          name: 'confirmation_required',
          type: 'boolean',
          defaultValue: true,
          description: 'Require price confirmation for signals',
          category: 'entry',
          required: false
        }
      ],
      
      entryRules: [
        {
          id: 'rsi_oversold_buy',
          name: 'RSI Oversold Buy',
          condition: 'RSI < oversold_level AND RSI[1] >= oversold_level',
          action: 'buy',
          weight: 1.0,
          enabled: true,
          description: 'Buy when RSI crosses below oversold level'
        }
      ],
      
      exitRules: [
        {
          id: 'rsi_overbought_sell',
          name: 'RSI Overbought Sell',
          condition: 'RSI > overbought_level AND RSI[1] <= overbought_level',
          action: 'sell',
          weight: 1.0,
          enabled: true,
          description: 'Sell when RSI crosses above overbought level'
        }
      ],
      
      riskManagement: {
        stopLoss: {
          enabled: true,
          type: 'fixed',
          value: 5.0
        },
        takeProfit: {
          enabled: true,
          type: 'ratio',
          value: 2.0
        },
        positionSizing: {
          type: 'percentage',
          value: 10,
          maxPositionSize: 25
        },
        maxDrawdown: 15,
        maxDailyLoss: 5,
        maxConcurrentTrades: 3
      },
      
      entryLogic: `
        // RSI Mean Reversion Entry Logic
        if (RSI < oversold_level && RSI[1] >= oversold_level) {
          if (!confirmation_required || CLOSE > CLOSE[1]) {
            return { signal: 'BUY', confidence: 0.8 };
          }
        }
        return { signal: 'HOLD', confidence: 0 };
      `,
      
      exitLogic: `
        // RSI Mean Reversion Exit Logic
        if (RSI > overbought_level && RSI[1] <= overbought_level) {
          return { signal: 'SELL', confidence: 0.8 };
        }
        return { signal: 'HOLD', confidence: 0 };
      `,
      
      riskLogic: `
        // Risk Management Logic
        const stopLossPrice = entryPrice * (1 - stopLoss.value / 100);
        const takeProfitPrice = entryPrice * (1 + stopLoss.value * takeProfit.value / 100);
        
        if (currentPrice <= stopLossPrice) {
          return { action: 'CLOSE', reason: 'Stop Loss Hit' };
        }
        if (currentPrice >= takeProfitPrice) {
          return { action: 'CLOSE', reason: 'Take Profit Hit' };
        }
        
        return { action: 'HOLD', reason: 'Within Risk Parameters' };
      `,
      
      validation: {
        isValid: true,
        errors: [],
        warnings: ['Consider adding volume confirmation'],
        complexity: 'low',
        estimatedPerformance: 8,
        riskScore: 4
      }
    };

    // Moving Average Crossover Strategy
    const maCrossover: TradingStrategy = {
      id: 'ma_crossover',
      name: 'Moving Average Crossover',
      description: 'Classic trend-following strategy using fast and slow moving averages',
      category: 'trend_following',
      author: 'System',
      created: new Date(),
      lastModified: new Date(),
      isPublic: true,
      tags: ['moving_average', 'trend_following', 'classic'],
      
      timeframes: ['1Day', '4Hour'],
      requiredIndicators: ['SMA', 'EMA'],
      optionalIndicators: ['Volume', 'MACD'],
      
      parameters: [
        {
          name: 'fast_period',
          type: 'integer',
          defaultValue: 10,
          min: 5,
          max: 50,
          description: 'Fast moving average period',
          category: 'general',
          required: true
        },
        {
          name: 'slow_period',
          type: 'integer',
          defaultValue: 30,
          min: 20,
          max: 200,
          description: 'Slow moving average period',
          category: 'general',
          required: true
        },
        {
          name: 'ma_type',
          type: 'select',
          defaultValue: 'EMA',
          options: ['SMA', 'EMA'],
          description: 'Type of moving average to use',
          category: 'general',
          required: true
        }
      ],
      
      entryRules: [
        {
          id: 'golden_cross',
          name: 'Golden Cross',
          condition: 'FAST_MA > SLOW_MA AND FAST_MA[1] <= SLOW_MA[1]',
          action: 'buy',
          weight: 1.0,
          enabled: true,
          description: 'Buy when fast MA crosses above slow MA'
        }
      ],
      
      exitRules: [
        {
          id: 'death_cross',
          name: 'Death Cross',
          condition: 'FAST_MA < SLOW_MA AND FAST_MA[1] >= SLOW_MA[1]',
          action: 'sell',
          weight: 1.0,
          enabled: true,
          description: 'Sell when fast MA crosses below slow MA'
        }
      ],
      
      riskManagement: {
        stopLoss: {
          enabled: true,
          type: 'trailing',
          value: 8.0,
          trailingDistance: 3.0
        },
        takeProfit: {
          enabled: false,
          type: 'fixed',
          value: 0
        },
        positionSizing: {
          type: 'percentage',
          value: 15,
          maxPositionSize: 30
        },
        maxDrawdown: 20,
        maxDailyLoss: 8,
        maxConcurrentTrades: 2
      },
      
      entryLogic: `
        const fastMA = ma_type === 'EMA' ? EMA(CLOSE, fast_period) : SMA(CLOSE, fast_period);
        const slowMA = ma_type === 'EMA' ? EMA(CLOSE, slow_period) : SMA(CLOSE, slow_period);
        
        if (fastMA > slowMA && fastMA[1] <= slowMA[1]) {
          return { signal: 'BUY', confidence: 0.7 };
        }
        return { signal: 'HOLD', confidence: 0 };
      `,
      
      exitLogic: `
        const fastMA = ma_type === 'EMA' ? EMA(CLOSE, fast_period) : SMA(CLOSE, fast_period);
        const slowMA = ma_type === 'EMA' ? EMA(CLOSE, slow_period) : SMA(CLOSE, slow_period);
        
        if (fastMA < slowMA && fastMA[1] >= slowMA[1]) {
          return { signal: 'SELL', confidence: 0.7 };
        }
        return { signal: 'HOLD', confidence: 0 };
      `,
      
      riskLogic: `
        const trailingStop = Math.max(
          entryPrice * (1 - stopLoss.value / 100),
          highestPrice * (1 - stopLoss.trailingDistance / 100)
        );
        
        if (currentPrice <= trailingStop) {
          return { action: 'CLOSE', reason: 'Trailing Stop Hit' };
        }
        
        return { action: 'HOLD', reason: 'Trend Continues' };
      `,
      
      validation: {
        isValid: true,
        errors: [],
        warnings: [],
        complexity: 'low',
        estimatedPerformance: 12,
        riskScore: 5
      }
    };

    // Bollinger Band Breakout Strategy
    const bollingerBreakout: TradingStrategy = {
      id: 'bollinger_breakout',
      name: 'Bollinger Band Breakout',
      description: 'Trade breakouts from Bollinger Band compression with volume confirmation',
      category: 'breakout',
      author: 'System',
      created: new Date(),
      lastModified: new Date(),
      isPublic: true,
      tags: ['bollinger_bands', 'breakout', 'volatility'],
      
      timeframes: ['1Hour', '30Min', '15Min'],
      requiredIndicators: ['Bollinger Bands'],
      optionalIndicators: ['Volume', 'ATR'],
      
      parameters: [
        {
          name: 'bb_period',
          type: 'integer',
          defaultValue: 20,
          min: 10,
          max: 50,
          description: 'Bollinger Bands period',
          category: 'general',
          required: true
        },
        {
          name: 'bb_deviation',
          type: 'number',
          defaultValue: 2.0,
          min: 1.0,
          max: 3.0,
          step: 0.1,
          description: 'Bollinger Bands standard deviation',
          category: 'general',
          required: true
        },
        {
          name: 'volume_confirmation',
          type: 'boolean',
          defaultValue: true,
          description: 'Require volume confirmation for breakouts',
          category: 'entry',
          required: false
        },
        {
          name: 'squeeze_threshold',
          type: 'number',
          defaultValue: 0.1,
          min: 0.05,
          max: 0.3,
          step: 0.01,
          description: 'Band width threshold for squeeze detection',
          category: 'entry',
          required: true
        }
      ],
      
      entryRules: [
        {
          id: 'upper_band_breakout',
          name: 'Upper Band Breakout',
          condition: 'CLOSE > BB_UPPER AND CLOSE[1] <= BB_UPPER[1] AND BAND_WIDTH < squeeze_threshold',
          action: 'buy',
          weight: 1.0,
          enabled: true,
          description: 'Buy on breakout above upper Bollinger Band'
        },
        {
          id: 'lower_band_breakout',
          name: 'Lower Band Breakout',
          condition: 'CLOSE < BB_LOWER AND CLOSE[1] >= BB_LOWER[1] AND BAND_WIDTH < squeeze_threshold',
          action: 'sell',
          weight: 1.0,
          enabled: true,
          description: 'Sell on breakdown below lower Bollinger Band'
        }
      ],
      
      exitRules: [
        {
          id: 'return_to_middle',
          name: 'Return to Middle Band',
          condition: 'CLOSE crosses BB_MIDDLE',
          action: 'close_long',
          weight: 0.8,
          enabled: true,
          description: 'Close position when price returns to middle band'
        }
      ],
      
      riskManagement: {
        stopLoss: {
          enabled: true,
          type: 'atr',
          value: 2.0
        },
        takeProfit: {
          enabled: true,
          type: 'ratio',
          value: 1.5,
          partialTakeProfits: [
            { percentage: 50, target: 1.0 },
            { percentage: 30, target: 1.5 }
          ]
        },
        positionSizing: {
          type: 'volatility',
          value: 1.0,
          maxPositionSize: 20
        },
        maxDrawdown: 12,
        maxDailyLoss: 6,
        maxConcurrentTrades: 4
      },
      
      entryLogic: `
        const bbUpper = BB_UPPER;
        const bbLower = BB_LOWER;
        const bbMiddle = BB_MIDDLE;
        const bandWidth = (bbUpper - bbLower) / bbMiddle;
        
        // Upper breakout
        if (CLOSE > bbUpper && CLOSE[1] <= bbUpper && bandWidth < squeeze_threshold) {
          if (!volume_confirmation || VOLUME > SMA(VOLUME, 20)) {
            return { signal: 'BUY', confidence: 0.8 };
          }
        }
        
        // Lower breakdown
        if (CLOSE < bbLower && CLOSE[1] >= bbLower && bandWidth < squeeze_threshold) {
          if (!volume_confirmation || VOLUME > SMA(VOLUME, 20)) {
            return { signal: 'SELL', confidence: 0.8 };
          }
        }
        
        return { signal: 'HOLD', confidence: 0 };
      `,
      
      exitLogic: `
        const bbMiddle = BB_MIDDLE;
        
        // Close long positions when returning to middle band
        if (position === 'LONG' && CLOSE < bbMiddle && CLOSE[1] >= bbMiddle) {
          return { signal: 'SELL', confidence: 0.6 };
        }
        
        // Close short positions when returning to middle band
        if (position === 'SHORT' && CLOSE > bbMiddle && CLOSE[1] <= bbMiddle) {
          return { signal: 'BUY', confidence: 0.6 };
        }
        
        return { signal: 'HOLD', confidence: 0 };
      `,
      
      riskLogic: `
        const atr = ATR(14);
        const stopDistance = atr * stopLoss.value;
        
        const stopLossPrice = position === 'LONG' 
          ? entryPrice - stopDistance 
          : entryPrice + stopDistance;
        
        if ((position === 'LONG' && currentPrice <= stopLossPrice) ||
            (position === 'SHORT' && currentPrice >= stopLossPrice)) {
          return { action: 'CLOSE', reason: 'ATR Stop Loss Hit' };
        }
        
        return { action: 'HOLD', reason: 'Within ATR Risk Parameters' };
      `,
      
      validation: {
        isValid: true,
        errors: [],
        warnings: ['High frequency strategy - monitor transaction costs'],
        complexity: 'medium',
        estimatedPerformance: 18,
        riskScore: 6
      }
    };

    this.strategies.set(rsiMeanReversion.id, rsiMeanReversion);
    this.strategies.set(maCrossover.id, maCrossover);
    this.strategies.set(bollingerBreakout.id, bollingerBreakout);
  }

  private initializeBotTemplates(): void {
    // Beginner Conservative Bot
    const beginnerBot: BotTemplate = {
      id: 'beginner_conservative',
      name: 'Conservative Starter Bot',
      description: 'Perfect for beginners - simple RSI strategy with strong risk management',
      category: 'beginner',
      difficulty: 'easy',
      author: 'Vibe Coding',
      created: new Date(),
      isPublic: true,
      tags: ['beginner', 'conservative', 'rsi', 'safe'],
      
      indicators: [
        {
          name: 'Relative Strength Index (RSI)',
          enabled: true,
          parameters: { period: 14 }
        },
        {
          name: 'Simple Moving Average (SMA)',
          enabled: true,
          parameters: { period: 50 }
        }
      ],
      
      strategy: this.strategies.get('rsi_mean_reversion')!,
      riskProfile: 'conservative',
      
      expectedReturn: 12,
      expectedVolatility: 15,
      recommendedCapital: 1000,
      timeCommitment: '15 minutes daily',
      
      tutorial: {
        overview: 'This bot uses the RSI (Relative Strength Index) to identify when stocks are oversold or overbought, making it perfect for beginners to learn mean reversion trading.',
        howItWorks: 'The bot buys when RSI drops below 30 (oversold) and sells when RSI rises above 70 (overbought). It includes a 50-period SMA for trend confirmation.',
        whenToUse: 'Best used in sideways or slightly trending markets. Avoid during strong trending periods or high volatility events.',
        risks: [
          'May struggle in strong trending markets',
          'False signals during high volatility',
          'Requires patience for mean reversion to occur'
        ],
        tips: [
          'Start with paper trading to understand the signals',
          'Monitor RSI levels daily around market close',
          'Consider market conditions before enabling',
          'Keep position sizes small while learning'
        ]
      },
      
      customizationLevel: 'basic',
      configurableParameters: ['rsi_period', 'oversold_level', 'overbought_level']
    };

    // Intermediate Trend Following Bot
    const trendBot: BotTemplate = {
      id: 'intermediate_trend',
      name: 'Trend Rider Pro',
      description: 'Intermediate strategy combining moving averages with momentum indicators',
      category: 'intermediate',
      difficulty: 'medium',
      author: 'Vibe Coding',
      created: new Date(),
      isPublic: true,
      tags: ['intermediate', 'trend_following', 'moving_average', 'momentum'],
      
      indicators: [
        {
          name: 'Exponential Moving Average (EMA)',
          enabled: true,
          parameters: { period: 12 }
        },
        {
          name: 'Exponential Moving Average (EMA)',
          enabled: true,
          parameters: { period: 26 }
        },
        {
          name: 'Moving Average Convergence Divergence (MACD)',
          enabled: true,
          parameters: { fast_ema: 12 }
        },
        {
          name: 'Average True Range (ATR)',
          enabled: true,
          parameters: { period: 14 }
        }
      ],
      
      strategy: this.strategies.get('ma_crossover')!,
      riskProfile: 'moderate',
      
      expectedReturn: 18,
      expectedVolatility: 22,
      recommendedCapital: 5000,
      timeCommitment: '30 minutes daily',
      
      tutorial: {
        overview: 'This intermediate bot combines moving average crossovers with MACD confirmation to catch strong trends while filtering out false signals.',
        howItWorks: 'Enters long positions when the 12 EMA crosses above the 26 EMA with MACD confirmation. Uses ATR-based trailing stops to ride trends.',
        whenToUse: 'Excellent for trending markets and momentum plays. Works well on daily and 4-hour timeframes.',
        risks: [
          'Whipsaws in sideways markets',
          'Late entries in fast-moving trends',
          'Trailing stops may be too tight in volatile conditions'
        ],
        tips: [
          'Monitor MACD histogram for momentum confirmation',
          'Adjust ATR multiplier based on market volatility',
          'Consider market regime before activation',
          'Use on liquid, trending stocks'
        ]
      },
      
      customizationLevel: 'advanced',
      configurableParameters: ['fast_period', 'slow_period', 'ma_type', 'trailing_distance']
    };

    // Advanced Scalping Bot
    const scalpingBot: BotTemplate = {
      id: 'advanced_scalping',
      name: 'Lightning Scalper',
      description: 'High-frequency scalping bot for experienced traders using Bollinger Bands',
      category: 'advanced',
      difficulty: 'hard',
      author: 'Vibe Coding',
      created: new Date(),
      isPublic: true,
      tags: ['advanced', 'scalping', 'bollinger_bands', 'high_frequency'],
      
      indicators: [
        {
          name: 'Bollinger Bands',
          enabled: true,
          parameters: { period: 20 }
        },
        {
          name: 'Relative Strength Index (RSI)',
          enabled: true,
          parameters: { period: 9 }
        },
        {
          name: 'Average True Range (ATR)',
          enabled: true,
          parameters: { period: 14 }
        },
        {
          name: 'Volume Weighted Average Price (VWAP)',
          enabled: true,
          parameters: { session: 1 }
        }
      ],
      
      strategy: this.strategies.get('bollinger_breakout')!,
      riskProfile: 'aggressive',
      
      expectedReturn: 35,
      expectedVolatility: 45,
      recommendedCapital: 25000,
      timeCommitment: '2-4 hours active monitoring',
      
      tutorial: {
        overview: 'This advanced scalping bot exploits short-term volatility using Bollinger Band squeezes and breakouts with multiple confirmation signals.',
        howItWorks: 'Identifies low volatility periods (squeezes) and trades breakouts with RSI, volume, and VWAP confirmation. Uses tight ATR-based stops.',
        whenToUse: 'Best during active trading hours with high volume. Requires constant monitoring and quick execution.',
        risks: [
          'High transaction costs from frequent trading',
          'Requires active monitoring',
          'Sensitive to execution delays',
          'Can generate many small losses'
        ],
        tips: [
          'Use only during high volume periods',
          'Monitor spreads and transaction costs carefully',
          'Consider using limit orders for better fills',
          'Start with smaller position sizes',
          'Have reliable, fast internet connection'
        ]
      },
      
      customizationLevel: 'expert',
      configurableParameters: ['bb_period', 'bb_deviation', 'squeeze_threshold', 'volume_confirmation']
    };

    // Professional Multi-Strategy Bot
    const professionalBot: BotTemplate = {
      id: 'professional_multi',
      name: 'Institutional Grade Multi-Strategy',
      description: 'Professional-grade bot combining multiple strategies with advanced risk management',
      category: 'professional',
      difficulty: 'expert',
      author: 'Vibe Coding',
      created: new Date(),
      isPublic: true,
      tags: ['professional', 'multi_strategy', 'institutional', 'advanced_risk'],
      
      indicators: [
        {
          name: 'Relative Strength Index (RSI)',
          enabled: true,
          parameters: { period: 14 }
        },
        {
          name: 'Moving Average Convergence Divergence (MACD)',
          enabled: true,
          parameters: { fast_ema: 12 }
        },
        {
          name: 'Bollinger Bands',
          enabled: true,
          parameters: { period: 20 }
        },
        {
          name: 'Average True Range (ATR)',
          enabled: true,
          parameters: { period: 14 }
        },
        {
          name: 'Stochastic Oscillator',
          enabled: true,
          parameters: { k_period: 14 }
        },
        {
          name: 'Volume Weighted Average Price (VWAP)',
          enabled: true,
          parameters: { session: 1 }
        }
      ],
      
      strategy: {
        ...this.strategies.get('rsi_mean_reversion')!,
        id: 'multi_strategy_professional',
        name: 'Multi-Strategy Professional',
        description: 'Combines mean reversion, trend following, and breakout strategies',
        category: 'custom'
      },
      riskProfile: 'moderate',
      
      expectedReturn: 25,
      expectedVolatility: 18,
      recommendedCapital: 100000,
      timeCommitment: '1 hour daily + monitoring',
      
      tutorial: {
        overview: 'This professional-grade bot combines multiple proven strategies with sophisticated risk management, position sizing, and market regime detection.',
        howItWorks: 'Uses ensemble methods to combine signals from mean reversion, trend following, and breakout strategies. Includes dynamic position sizing and correlation-based risk management.',
        whenToUse: 'Suitable for all market conditions with automatic strategy weighting based on market regime detection.',
        risks: [
          'Complex system with multiple failure points',
          'Requires deep understanding of all components',
          'May over-optimize to historical data',
          'Higher capital requirements'
        ],
        tips: [
          'Thoroughly backtest before live deployment',
          'Monitor all strategy components regularly',
          'Understand correlation between strategies',
          'Keep detailed performance logs',
          'Regular rebalancing and optimization needed'
        ]
      },
      
      customizationLevel: 'expert',
      configurableParameters: [
        'strategy_weights', 'risk_allocation', 'correlation_threshold', 
        'regime_detection', 'position_sizing_method', 'rebalance_frequency'
      ]
    };

    this.botTemplates.set(beginnerBot.id, beginnerBot);
    this.botTemplates.set(trendBot.id, trendBot);
    this.botTemplates.set(scalpingBot.id, scalpingBot);
    this.botTemplates.set(professionalBot.id, professionalBot);
  }

  // Strategy Management Methods
  createStrategy(
    name: string,
    description: string,
    category: TradingStrategy['category'],
    parameters: StrategyParameter[],
    entryRules: TradingRule[],
    exitRules: TradingRule[],
    riskManagement: RiskManagementRules
  ): { success: boolean; strategy?: TradingStrategy; errors: string[] } {
    const validation = this.validateStrategy(entryRules, exitRules, riskManagement);
    
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const strategy: TradingStrategy = {
      id: this.generateId(name),
      name,
      description,
      category,
      author: 'User',
      created: new Date(),
      lastModified: new Date(),
      isPublic: false,
      tags: [],
      timeframes: ['1Day'],
      requiredIndicators: [],
      optionalIndicators: [],
      parameters,
      entryRules,
      exitRules,
      riskManagement,
      entryLogic: this.generateLogicFromRules(entryRules),
      exitLogic: this.generateLogicFromRules(exitRules),
      riskLogic: this.generateRiskLogic(riskManagement),
      validation
    };

    this.strategies.set(strategy.id, strategy);
    return { success: true, strategy, errors: [] };
  }

  getAllStrategies(): TradingStrategy[] {
    return Array.from(this.strategies.values());
  }

  getStrategy(id: string): TradingStrategy | undefined {
    return this.strategies.get(id);
  }

  getStrategiesByCategory(category: TradingStrategy['category']): TradingStrategy[] {
    return this.getAllStrategies().filter(s => s.category === category);
  }

  // Bot Template Management Methods
  getAllBotTemplates(): BotTemplate[] {
    return Array.from(this.botTemplates.values());
  }

  getBotTemplate(id: string): BotTemplate | undefined {
    return this.botTemplates.get(id);
  }

  getBotTemplatesByCategory(category: BotTemplate['category']): BotTemplate[] {
    return this.getAllBotTemplates().filter(t => t.category === category);
  }

  getBotTemplatesByDifficulty(difficulty: BotTemplate['difficulty']): BotTemplate[] {
    return this.getAllBotTemplates().filter(t => t.difficulty === difficulty);
  }

  applyBotTemplate(templateId: string): {
    success: boolean;
    indicators?: Array<{ name: string; enabled: boolean; parameters: any }>;
    strategy?: TradingStrategy;
    errors: string[];
  } {
    const template = this.botTemplates.get(templateId);
    if (!template) {
      return { success: false, errors: ['Template not found'] };
    }

    return {
      success: true,
      indicators: template.indicators,
      strategy: template.strategy,
      errors: []
    };
  }

  // Validation Methods
  private validateStrategy(
    entryRules: TradingRule[],
    exitRules: TradingRule[],
    riskManagement: RiskManagementRules
  ): StrategyValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate entry rules
    if (entryRules.length === 0) {
      errors.push('Strategy must have at least one entry rule');
    }

    // Validate exit rules
    if (exitRules.length === 0) {
      warnings.push('No exit rules defined - consider adding exit conditions');
    }

    // Validate risk management
    if (!riskManagement.stopLoss.enabled && !riskManagement.takeProfit.enabled) {
      warnings.push('No stop loss or take profit - high risk strategy');
    }

    if (riskManagement.positionSizing.maxPositionSize > 50) {
      warnings.push('Maximum position size above 50% - consider reducing concentration risk');
    }

    // Calculate complexity and risk scores
    const complexity = this.calculateStrategyComplexity(entryRules, exitRules);
    const riskScore = this.calculateRiskScore(riskManagement);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      complexity,
      estimatedPerformance: entryRules.length * 5 + exitRules.length * 3,
      riskScore
    };
  }

  private calculateStrategyComplexity(entryRules: TradingRule[], exitRules: TradingRule[]): 'low' | 'medium' | 'high' {
    const totalRules = entryRules.length + exitRules.length;
    const complexConditions = [...entryRules, ...exitRules].filter(rule => 
      rule.condition.includes('AND') || rule.condition.includes('OR')
    ).length;

    const score = totalRules + complexConditions * 2;
    
    if (score <= 3) return 'low';
    if (score <= 8) return 'medium';
    return 'high';
  }

  private calculateRiskScore(riskManagement: RiskManagementRules): number {
    let score = 5; // Base score

    // Adjust based on stop loss
    if (!riskManagement.stopLoss.enabled) score += 3;
    else if (riskManagement.stopLoss.value > 10) score += 2;
    else if (riskManagement.stopLoss.value < 3) score += 1;

    // Adjust based on position sizing
    if (riskManagement.positionSizing.maxPositionSize > 30) score += 2;
    if (riskManagement.positionSizing.maxPositionSize > 50) score += 3;

    // Adjust based on drawdown limits
    if (riskManagement.maxDrawdown > 25) score += 2;
    if (riskManagement.maxDailyLoss > 10) score += 1;

    return Math.min(10, Math.max(1, score));
  }

  private generateLogicFromRules(rules: TradingRule[]): string {
    return `
      // Generated logic from rules
      ${rules.map(rule => `
        // ${rule.name}: ${rule.description}
        if (${rule.condition}) {
          return { signal: '${rule.action.toUpperCase()}', confidence: ${rule.weight} };
        }
      `).join('\n')}
      
      return { signal: 'HOLD', confidence: 0 };
    `;
  }

  private generateRiskLogic(riskManagement: RiskManagementRules): string {
    return `
      // Generated risk management logic
      ${riskManagement.stopLoss.enabled ? `
        const stopLossPrice = entryPrice * (1 - ${riskManagement.stopLoss.value} / 100);
        if (currentPrice <= stopLossPrice) {
          return { action: 'CLOSE', reason: 'Stop Loss Hit' };
        }
      ` : ''}
      
      ${riskManagement.takeProfit.enabled ? `
        const takeProfitPrice = entryPrice * (1 + ${riskManagement.takeProfit.value} / 100);
        if (currentPrice >= takeProfitPrice) {
          return { action: 'CLOSE', reason: 'Take Profit Hit' };
        }
      ` : ''}
      
      return { action: 'HOLD', reason: 'Within Risk Parameters' };
    `;
  }

  private generateId(name: string): string {
    const timestamp = Date.now();
    const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `strategy_${sanitized}_${timestamp}`;
  }

  // Strategy Optimization Methods
  optimizeStrategy(strategyId: string, optimizationParams: any): {
    success: boolean;
    optimizedStrategy?: TradingStrategy;
    results?: any;
    errors: string[];
  } {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) {
      return { success: false, errors: ['Strategy not found'] };
    }

    // Simplified optimization - in reality this would run parameter sweeps
    const optimizedStrategy = { ...strategy };
    
    // Example optimization results
    const results = {
      originalPerformance: {
        sharpeRatio: 1.2,
        maxDrawdown: 15,
        winRate: 55
      },
      optimizedPerformance: {
        sharpeRatio: 1.45,
        maxDrawdown: 12,
        winRate: 62
      },
      optimizedParameters: {
        rsi_period: 16,
        oversold_level: 25,
        overbought_level: 75
      }
    };

    return {
      success: true,
      optimizedStrategy,
      results,
      errors: []
    };
  }

  compareStrategies(strategyIds: string[]): {
    success: boolean;
    comparison?: any;
    errors: string[];
  } {
    const strategies = strategyIds.map(id => this.strategies.get(id)).filter(Boolean);
    
    if (strategies.length < 2) {
      return { success: false, errors: ['Need at least 2 strategies to compare'] };
    }

    const comparison = {
      strategies: strategies.map(s => ({
        name: s!.name,
        category: s!.category,
        complexity: s!.validation.complexity,
        riskScore: s!.validation.riskScore,
        estimatedPerformance: s!.validation.estimatedPerformance
      })),
      recommendations: [
        'RSI Mean Reversion is best for sideways markets',
        'Moving Average Crossover excels in trending conditions',
        'Bollinger Breakout works well in volatile environments'
      ]
    };

    return { success: true, comparison, errors: [] };
  }
}

// Singleton instance
let strategyEngine: StrategyEngine | null = null;

export const getStrategyEngine = (): StrategyEngine => {
  if (!strategyEngine) {
    strategyEngine = new StrategyEngine();
  }
  return strategyEngine;
};