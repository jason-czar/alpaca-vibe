export interface CustomIndicator {
  id: string;
  name: string;
  description: string;
  formula: string;
  parameters: IndicatorParameter[];
  category: 'trend' | 'momentum' | 'volatility' | 'volume' | 'custom';
  author: string;
  created: Date;
  lastModified: Date;
  isPublic: boolean;
  tags: string[];
  validation: ValidationResult;
}

export interface IndicatorParameter {
  name: string;
  type: 'number' | 'integer' | 'boolean' | 'select';
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[]; // For select type
  description: string;
  required: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  complexity: 'low' | 'medium' | 'high';
  estimatedPerformance: number; // Operations per bar
}

export interface IndicatorFormula {
  expression: string;
  variables: { [key: string]: string };
  functions: string[];
  dependencies: string[];
}

export interface CalculationContext {
  bars: MarketBar[];
  currentIndex: number;
  parameters: { [key: string]: any };
  cache: { [key: string]: number[] };
  builtInIndicators: { [key: string]: number[] };
}

export interface MarketBar {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class IndicatorBuilder {
  private customIndicators: Map<string, CustomIndicator> = new Map();
  private builtInFunctions: Map<string, Function> = new Map();
  private validationRules: ValidationRule[] = [];

  constructor() {
    this.initializeBuiltInFunctions();
    this.initializeValidationRules();
    this.loadDefaultIndicators();
  }

  private initializeBuiltInFunctions(): void {
    // Mathematical functions
    this.builtInFunctions.set('SMA', this.calculateSMA.bind(this));
    this.builtInFunctions.set('EMA', this.calculateEMA.bind(this));
    this.builtInFunctions.set('WMA', this.calculateWMA.bind(this));
    this.builtInFunctions.set('RSI', this.calculateRSI.bind(this));
    this.builtInFunctions.set('MACD', this.calculateMACD.bind(this));
    this.builtInFunctions.set('STDEV', this.calculateStandardDeviation.bind(this));
    this.builtInFunctions.set('MAX', this.calculateMax.bind(this));
    this.builtInFunctions.set('MIN', this.calculateMin.bind(this));
    this.builtInFunctions.set('SUM', this.calculateSum.bind(this));
    this.builtInFunctions.set('ABS', Math.abs);
    this.builtInFunctions.set('SQRT', Math.sqrt);
    this.builtInFunctions.set('POW', Math.pow);
    this.builtInFunctions.set('LOG', Math.log);
    this.builtInFunctions.set('EXP', Math.exp);
    
    // Price functions
    this.builtInFunctions.set('OPEN', (bars: MarketBar[], index: number) => bars[index]?.open || 0);
    this.builtInFunctions.set('HIGH', (bars: MarketBar[], index: number) => bars[index]?.high || 0);
    this.builtInFunctions.set('LOW', (bars: MarketBar[], index: number) => bars[index]?.low || 0);
    this.builtInFunctions.set('CLOSE', (bars: MarketBar[], index: number) => bars[index]?.close || 0);
    this.builtInFunctions.set('VOLUME', (bars: MarketBar[], index: number) => bars[index]?.volume || 0);
    this.builtInFunctions.set('TYPICAL', (bars: MarketBar[], index: number) => {
      const bar = bars[index];
      return bar ? (bar.high + bar.low + bar.close) / 3 : 0;
    });
    this.builtInFunctions.set('MEDIAN', (bars: MarketBar[], index: number) => {
      const bar = bars[index];
      return bar ? (bar.high + bar.low) / 2 : 0;
    });
    this.builtInFunctions.set('WEIGHTED', (bars: MarketBar[], index: number) => {
      const bar = bars[index];
      return bar ? (bar.high + bar.low + 2 * bar.close) / 4 : 0;
    });

    // Conditional functions
    this.builtInFunctions.set('IF', (condition: boolean, trueValue: number, falseValue: number) => 
      condition ? trueValue : falseValue);
    this.builtInFunctions.set('AND', (...conditions: boolean[]) => conditions.every(c => c));
    this.builtInFunctions.set('OR', (...conditions: boolean[]) => conditions.some(c => c));
    this.builtInFunctions.set('NOT', (condition: boolean) => !condition);
  }

  private initializeValidationRules(): void {
    this.validationRules = [
      {
        name: 'formula_syntax',
        check: (formula: string) => this.validateFormulaSyntax(formula),
        severity: 'error'
      },
      {
        name: 'circular_dependency',
        check: (formula: string, dependencies: string[]) => this.checkCircularDependency(formula, dependencies),
        severity: 'error'
      },
      {
        name: 'performance_impact',
        check: (formula: string) => this.assessPerformanceImpact(formula),
        severity: 'warning'
      },
      {
        name: 'parameter_validation',
        check: (parameters: IndicatorParameter[]) => this.validateParameters(parameters),
        severity: 'error'
      }
    ];
  }

  private loadDefaultIndicators(): void {
    // Load some example custom indicators
    const customRSI: CustomIndicator = {
      id: 'custom_rsi_divergence',
      name: 'RSI Divergence Detector',
      description: 'Detects bullish and bearish divergences between price and RSI',
      formula: `
        rsi_current = RSI(CLOSE, period)
        rsi_prev = RSI(CLOSE, period)[1]
        price_current = CLOSE
        price_prev = CLOSE[1]
        
        bullish_div = IF(AND(price_current < price_prev, rsi_current > rsi_prev), 1, 0)
        bearish_div = IF(AND(price_current > price_prev, rsi_current < rsi_prev), -1, 0)
        
        RETURN bullish_div + bearish_div
      `,
      parameters: [
        {
          name: 'period',
          type: 'integer',
          defaultValue: 14,
          min: 2,
          max: 50,
          description: 'RSI calculation period',
          required: true
        }
      ],
      category: 'momentum',
      author: 'System',
      created: new Date(),
      lastModified: new Date(),
      isPublic: true,
      tags: ['rsi', 'divergence', 'momentum'],
      validation: { isValid: true, errors: [], warnings: [], complexity: 'medium', estimatedPerformance: 15 }
    };

    const customVolatility: CustomIndicator = {
      id: 'adaptive_volatility',
      name: 'Adaptive Volatility Index',
      description: 'Volatility indicator that adapts to market conditions',
      formula: `
        true_range = MAX(HIGH - LOW, ABS(HIGH - CLOSE[1]), ABS(LOW - CLOSE[1]))
        atr = EMA(true_range, atr_period)
        price_change = ABS(CLOSE - CLOSE[1])
        volatility_ratio = price_change / atr
        
        adaptive_vol = EMA(volatility_ratio, smoothing_period)
        normalized_vol = (adaptive_vol - MIN(adaptive_vol, lookback)) / 
                        (MAX(adaptive_vol, lookback) - MIN(adaptive_vol, lookback)) * 100
        
        RETURN normalized_vol
      `,
      parameters: [
        {
          name: 'atr_period',
          type: 'integer',
          defaultValue: 14,
          min: 5,
          max: 50,
          description: 'ATR calculation period',
          required: true
        },
        {
          name: 'smoothing_period',
          type: 'integer',
          defaultValue: 10,
          min: 3,
          max: 30,
          description: 'Smoothing period for volatility',
          required: true
        },
        {
          name: 'lookback',
          type: 'integer',
          defaultValue: 50,
          min: 20,
          max: 200,
          description: 'Lookback period for normalization',
          required: true
        }
      ],
      category: 'volatility',
      author: 'System',
      created: new Date(),
      lastModified: new Date(),
      isPublic: true,
      tags: ['volatility', 'adaptive', 'atr'],
      validation: { isValid: true, errors: [], warnings: [], complexity: 'high', estimatedPerformance: 25 }
    };

    this.customIndicators.set(customRSI.id, customRSI);
    this.customIndicators.set(customVolatility.id, customVolatility);
  }

  createIndicator(
    name: string,
    description: string,
    formula: string,
    parameters: IndicatorParameter[],
    category: CustomIndicator['category'] = 'custom',
    tags: string[] = []
  ): { success: boolean; indicator?: CustomIndicator; errors: string[] } {
    const validation = this.validateIndicator(formula, parameters);
    
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const indicator: CustomIndicator = {
      id: this.generateId(name),
      name,
      description,
      formula,
      parameters,
      category,
      author: 'User',
      created: new Date(),
      lastModified: new Date(),
      isPublic: false,
      tags,
      validation
    };

    this.customIndicators.set(indicator.id, indicator);
    
    return { success: true, indicator, errors: [] };
  }

  updateIndicator(
    id: string,
    updates: Partial<CustomIndicator>
  ): { success: boolean; indicator?: CustomIndicator; errors: string[] } {
    const existing = this.customIndicators.get(id);
    if (!existing) {
      return { success: false, errors: ['Indicator not found'] };
    }

    const updated = { ...existing, ...updates, lastModified: new Date() };
    
    if (updates.formula || updates.parameters) {
      const validation = this.validateIndicator(updated.formula, updated.parameters);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }
      updated.validation = validation;
    }

    this.customIndicators.set(id, updated);
    return { success: true, indicator: updated, errors: [] };
  }

  deleteIndicator(id: string): boolean {
    return this.customIndicators.delete(id);
  }

  getIndicator(id: string): CustomIndicator | undefined {
    return this.customIndicators.get(id);
  }

  getAllIndicators(): CustomIndicator[] {
    return Array.from(this.customIndicators.values());
  }

  getIndicatorsByCategory(category: CustomIndicator['category']): CustomIndicator[] {
    return this.getAllIndicators().filter(ind => ind.category === category);
  }

  searchIndicators(query: string): CustomIndicator[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllIndicators().filter(ind => 
      ind.name.toLowerCase().includes(lowerQuery) ||
      ind.description.toLowerCase().includes(lowerQuery) ||
      ind.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  calculateIndicator(
    id: string,
    bars: MarketBar[],
    parameters: { [key: string]: any }
  ): { success: boolean; values?: number[]; errors: string[] } {
    const indicator = this.customIndicators.get(id);
    if (!indicator) {
      return { success: false, errors: ['Indicator not found'] };
    }

    try {
      const values = this.executeFormula(indicator.formula, bars, parameters);
      return { success: true, values, errors: [] };
    } catch (error) {
      return { 
        success: false, 
        errors: [`Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      };
    }
  }

  private validateIndicator(formula: string, parameters: IndicatorParameter[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Run all validation rules
    for (const rule of this.validationRules) {
      try {
        const result = rule.check(formula, parameters);
        if (!result.isValid) {
          if (rule.severity === 'error') {
            errors.push(...result.messages);
          } else {
            warnings.push(...result.messages);
          }
        }
      } catch (error) {
        errors.push(`Validation error in ${rule.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const complexity = this.assessComplexity(formula);
    const estimatedPerformance = this.estimatePerformance(formula);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      complexity,
      estimatedPerformance
    };
  }

  private validateFormulaSyntax(formula: string): { isValid: boolean; messages: string[] } {
    const messages: string[] = [];
    
    // Check for balanced parentheses
    let parenCount = 0;
    for (const char of formula) {
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
      if (parenCount < 0) {
        messages.push('Unmatched closing parenthesis');
        break;
      }
    }
    if (parenCount > 0) {
      messages.push('Unmatched opening parenthesis');
    }

    // Check for valid function names
    const functionPattern = /([A-Z_][A-Z0-9_]*)\s*\(/g;
    let match;
    while ((match = functionPattern.exec(formula)) !== null) {
      const funcName = match[1];
      if (!this.builtInFunctions.has(funcName)) {
        messages.push(`Unknown function: ${funcName}`);
      }
    }

    // Check for RETURN statement
    if (!formula.includes('RETURN')) {
      messages.push('Formula must include a RETURN statement');
    }

    return { isValid: messages.length === 0, messages };
  }

  private checkCircularDependency(formula: string, dependencies: string[]): { isValid: boolean; messages: string[] } {
    // Simplified circular dependency check
    // In a real implementation, this would build a dependency graph
    return { isValid: true, messages: [] };
  }

  private assessPerformanceImpact(formula: string): { isValid: boolean; messages: string[] } {
    const warnings: string[] = [];
    
    // Count complex operations
    const complexOps = (formula.match(/EMA|SMA|RSI|MACD|STDEV/g) || []).length;
    if (complexOps > 5) {
      warnings.push('High number of complex operations may impact performance');
    }

    // Check for nested loops (simplified)
    if (formula.includes('FOR') || formula.includes('WHILE')) {
      warnings.push('Loops in formulas may significantly impact performance');
    }

    return { isValid: warnings.length === 0, messages: warnings };
  }

  private validateParameters(parameters: IndicatorParameter[]): { isValid: boolean; messages: string[] } {
    const messages: string[] = [];
    
    for (const param of parameters) {
      if (!param.name || param.name.trim() === '') {
        messages.push('Parameter name cannot be empty');
      }
      
      if (param.type === 'number' || param.type === 'integer') {
        if (param.min !== undefined && param.max !== undefined && param.min >= param.max) {
          messages.push(`Parameter ${param.name}: min value must be less than max value`);
        }
      }
      
      if (param.type === 'select' && (!param.options || param.options.length === 0)) {
        messages.push(`Parameter ${param.name}: select type requires options`);
      }
    }

    return { isValid: messages.length === 0, messages };
  }

  private assessComplexity(formula: string): 'low' | 'medium' | 'high' {
    const lines = formula.split('\n').filter(line => line.trim());
    const operations = (formula.match(/[+\-*/=<>]/g) || []).length;
    const functions = (formula.match(/[A-Z_][A-Z0-9_]*\s*\(/g) || []).length;
    
    const score = lines.length + operations + functions * 2;
    
    if (score < 10) return 'low';
    if (score < 25) return 'medium';
    return 'high';
  }

  private estimatePerformance(formula: string): number {
    // Estimate operations per bar
    const basicOps = (formula.match(/[+\-*/]/g) || []).length;
    const functions = (formula.match(/[A-Z_][A-Z0-9_]*\s*\(/g) || []).length;
    const complexFunctions = (formula.match(/EMA|SMA|RSI|MACD|STDEV/g) || []).length;
    
    return basicOps + functions * 2 + complexFunctions * 5;
  }

  private executeFormula(
    formula: string,
    bars: MarketBar[],
    parameters: { [key: string]: any }
  ): number[] {
    // This is a simplified formula execution engine
    // In a real implementation, this would parse and execute the formula properly
    const results: number[] = [];
    
    // For demo purposes, return some calculated values
    for (let i = 0; i < bars.length; i++) {
      // Simplified calculation - in reality, this would parse and execute the formula
      const value = Math.sin(i * 0.1) * 50 + 50; // Demo oscillator
      results.push(value);
    }
    
    return results;
  }

  private generateId(name: string): string {
    const timestamp = Date.now();
    const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `custom_${sanitized}_${timestamp}`;
  }

  // Built-in calculation functions
  private calculateSMA(values: number[], period: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < values.length; i++) {
      if (i < period - 1) {
        result.push(values[i]);
      } else {
        const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        result.push(sum / period);
      }
    }
    return result;
  }

  private calculateEMA(values: number[], period: number): number[] {
    const result: number[] = [];
    const multiplier = 2 / (period + 1);
    
    result.push(values[0]);
    
    for (let i = 1; i < values.length; i++) {
      const ema = (values[i] * multiplier) + (result[i - 1] * (1 - multiplier));
      result.push(ema);
    }
    
    return result;
  }

  private calculateWMA(values: number[], period: number): number[] {
    const result: number[] = [];
    
    for (let i = 0; i < values.length; i++) {
      if (i < period - 1) {
        result.push(values[i]);
      } else {
        let weightedSum = 0;
        let weightSum = 0;
        
        for (let j = 0; j < period; j++) {
          const weight = j + 1;
          weightedSum += values[i - period + 1 + j] * weight;
          weightSum += weight;
        }
        
        result.push(weightedSum / weightSum);
      }
    }
    
    return result;
  }

  private calculateRSI(values: number[], period: number): number[] {
    const result: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < values.length; i++) {
      const change = values[i] - values[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
      
      if (i >= period) {
        const avgGain = gains.slice(-period).reduce((a, b) => a + b) / period;
        const avgLoss = losses.slice(-period).reduce((a, b) => a + b) / period;
        const rs = avgGain / (avgLoss || 0.001);
        result.push(100 - (100 / (1 + rs)));
      } else {
        result.push(50);
      }
    }
    
    return [50, ...result];
  }

  private calculateMACD(values: number[], fastPeriod: number = 12, slowPeriod: number = 26): number[] {
    const fastEMA = this.calculateEMA(values, fastPeriod);
    const slowEMA = this.calculateEMA(values, slowPeriod);
    
    return fastEMA.map((fast, i) => fast - slowEMA[i]);
  }

  private calculateStandardDeviation(values: number[], period: number): number[] {
    const result: number[] = [];
    
    for (let i = 0; i < values.length; i++) {
      if (i < period - 1) {
        result.push(0);
      } else {
        const slice = values.slice(i - period + 1, i + 1);
        const mean = slice.reduce((a, b) => a + b) / period;
        const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
        result.push(Math.sqrt(variance));
      }
    }
    
    return result;
  }

  private calculateMax(values: number[], period: number): number[] {
    const result: number[] = [];
    
    for (let i = 0; i < values.length; i++) {
      if (i < period - 1) {
        result.push(values[i]);
      } else {
        const max = Math.max(...values.slice(i - period + 1, i + 1));
        result.push(max);
      }
    }
    
    return result;
  }

  private calculateMin(values: number[], period: number): number[] {
    const result: number[] = [];
    
    for (let i = 0; i < values.length; i++) {
      if (i < period - 1) {
        result.push(values[i]);
      } else {
        const min = Math.min(...values.slice(i - period + 1, i + 1));
        result.push(min);
      }
    }
    
    return result;
  }

  private calculateSum(values: number[], period: number): number[] {
    const result: number[] = [];
    
    for (let i = 0; i < values.length; i++) {
      if (i < period - 1) {
        result.push(values[i]);
      } else {
        const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        result.push(sum);
      }
    }
    
    return result;
  }

  exportIndicator(id: string): string | null {
    const indicator = this.customIndicators.get(id);
    if (!indicator) return null;
    
    return JSON.stringify(indicator, null, 2);
  }

  importIndicator(jsonData: string): { success: boolean; indicator?: CustomIndicator; errors: string[] } {
    try {
      const indicator: CustomIndicator = JSON.parse(jsonData);
      
      // Validate imported indicator
      const validation = this.validateIndicator(indicator.formula, indicator.parameters);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }
      
      // Generate new ID to avoid conflicts
      indicator.id = this.generateId(indicator.name);
      indicator.validation = validation;
      
      this.customIndicators.set(indicator.id, indicator);
      
      return { success: true, indicator, errors: [] };
    } catch (error) {
      return { 
        success: false, 
        errors: [`Import error: ${error instanceof Error ? error.message : 'Invalid JSON'}`] 
      };
    }
  }
}

interface ValidationRule {
  name: string;
  check: (formula: string, parameters?: any) => { isValid: boolean; messages: string[] };
  severity: 'error' | 'warning';
}

// Singleton instance
let indicatorBuilder: IndicatorBuilder | null = null;

export const getIndicatorBuilder = (): IndicatorBuilder => {
  if (!indicatorBuilder) {
    indicatorBuilder = new IndicatorBuilder();
  }
  return indicatorBuilder;
};