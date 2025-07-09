import React, { useState } from 'react';
import { BacktestEngine, BacktestConfig, BacktestResult } from './BacktestEngine';
import type { Indicator, IndicatorState } from './types';

interface BacktestPanelProps {
  indicators: Indicator[];
  indicatorStates: IndicatorState[];
}

const BacktestPanel: React.FC<BacktestPanelProps> = ({ indicators, indicatorStates }) => {
  const [config, setConfig] = useState<Partial<BacktestConfig>>({
    symbol: 'AAPL',
    initialCapital: 10000,
    strategy: 'multi_indicator'
  });
  
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfigChange = (field: keyof BacktestConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const runBacktest = async () => {
    if (!config.symbol || !config.initialCapital) {
      setError('Please provide symbol and initial capital');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 6); // 6 months back

      const backtestConfig: BacktestConfig = {
        symbol: config.symbol,
        startDate,
        endDate,
        initialCapital: config.initialCapital,
        strategy: config.strategy || 'multi_indicator',
        indicators: indicators.map((ind, idx) => ({
          name: ind.name,
          enabled: indicatorStates[idx]?.enabled || false,
          value: indicatorStates[idx]?.value || ind.default,
          param: ind.param
        }))
      };

      const engine = new BacktestEngine(backtestConfig);
      const backtestResult = await engine.runBacktest();
      setResult(backtestResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Backtest failed');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="backtest-panel">
      <div className="panel-header">
        <h2 className="panel-title">Advanced Backtesting</h2>
        <p className="panel-subtitle">Test your strategy against historical data</p>
      </div>

      {/* Configuration Section */}
      <div className="backtest-config">
        <h3 className="config-title">Backtest Configuration</h3>
        
        <div className="config-grid">
          <div className="config-item">
            <label className="config-label">Symbol</label>
            <input
              type="text"
              value={config.symbol || ''}
              onChange={(e) => handleConfigChange('symbol', e.target.value.toUpperCase())}
              className="config-input"
              placeholder="AAPL"
            />
          </div>
          
          <div className="config-item">
            <label className="config-label">Initial Capital</label>
            <input
              type="number"
              value={config.initialCapital || ''}
              onChange={(e) => handleConfigChange('initialCapital', Number(e.target.value))}
              className="config-input"
              placeholder="10000"
            />
          </div>
          
          <div className="config-item">
            <label className="config-label">Strategy</label>
            <select
              value={config.strategy || 'multi_indicator'}
              onChange={(e) => handleConfigChange('strategy', e.target.value)}
              className="config-select"
            >
              <option value="multi_indicator">Multi-Indicator</option>
              <option value="momentum">Momentum</option>
              <option value="mean_reversion">Mean Reversion</option>
              <option value="simple">Simple</option>
            </select>
          </div>
        </div>

        {/* Active Indicators Summary */}
        <div className="active-indicators">
          <h4 className="indicators-title">Active Indicators ({indicatorStates.filter(s => s.enabled).length})</h4>
          <div className="indicators-list">
            {indicators.map((ind, idx) => (
              indicatorStates[idx]?.enabled && (
                <div key={ind.name} className="indicator-chip">
                  {ind.name.split(' ')[0]} ({ind.param}: {indicatorStates[idx].value})
                </div>
              )
            ))}
          </div>
          {indicatorStates.filter(s => s.enabled).length === 0 && (
            <p className="no-indicators">No indicators enabled. Enable some indicators to improve strategy performance.</p>
          )}
        </div>

        <button
          onClick={runBacktest}
          disabled={loading}
          className="run-backtest-btn"
        >
          {loading ? 'Running Backtest...' : 'Run Backtest'}
        </button>

        {error && <div className="backtest-error">{error}</div>}
      </div>

      {/* Results Section */}
      {result && (
        <div className="backtest-results">
          <h3 className="results-title">Backtest Results</h3>
          
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card primary">
              <div className="metric-label">Total Return</div>
              <div className="metric-value">
                {formatCurrency(result.totalReturn)}
                <span className={`metric-percent ${result.totalReturnPercent >= 0 ? 'positive' : 'negative'}`}>
                  {formatPercent(result.totalReturnPercent)}
                </span>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">Sharpe Ratio</div>
              <div className="metric-value">{result.sharpeRatio.toFixed(3)}</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">Max Drawdown</div>
              <div className="metric-value negative">{result.maxDrawdown.toFixed(2)}%</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">Win Rate</div>
              <div className="metric-value">{result.winRate.toFixed(1)}%</div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="detailed-metrics">
            <div className="metrics-section">
              <h4 className="section-title">Performance</h4>
              <div className="metrics-list">
                <div className="metric-row">
                  <span>Annualized Return:</span>
                  <span className={result.annualizedReturn >= 0 ? 'positive' : 'negative'}>
                    {formatPercent(result.annualizedReturn * 100)}
                  </span>
                </div>
                <div className="metric-row">
                  <span>Final Capital:</span>
                  <span>{formatCurrency(result.finalCapital)}</span>
                </div>
                <div className="metric-row">
                  <span>Profit Factor:</span>
                  <span>{result.profitFactor.toFixed(2)}</span>
                </div>
                <div className="metric-row">
                  <span>Volatility:</span>
                  <span>{(result.metrics.volatility * 100).toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className="metrics-section">
              <h4 className="section-title">Trading</h4>
              <div className="metrics-list">
                <div className="metric-row">
                  <span>Total Trades:</span>
                  <span>{result.totalTrades}</span>
                </div>
                <div className="metric-row">
                  <span>Profitable Trades:</span>
                  <span className="positive">{result.profitableTrades}</span>
                </div>
                <div className="metric-row">
                  <span>Average Win:</span>
                  <span className="positive">{formatCurrency(result.averageWin)}</span>
                </div>
                <div className="metric-row">
                  <span>Average Loss:</span>
                  <span className="negative">{formatCurrency(-result.averageLoss)}</span>
                </div>
              </div>
            </div>

            <div className="metrics-section">
              <h4 className="section-title">Risk</h4>
              <div className="metrics-list">
                <div className="metric-row">
                  <span>Calmar Ratio:</span>
                  <span>{result.metrics.calmarRatio.toFixed(3)}</span>
                </div>
                <div className="metric-row">
                  <span>Sortino Ratio:</span>
                  <span>{result.metrics.sortinoRatio.toFixed(3)}</span>
                </div>
                <div className="metric-row">
                  <span>Largest Win:</span>
                  <span className="positive">{formatCurrency(result.metrics.largestWin)}</span>
                </div>
                <div className="metric-row">
                  <span>Largest Loss:</span>
                  <span className="negative">{formatCurrency(result.metrics.largestLoss)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trade History */}
          <div className="trade-history">
            <h4 className="section-title">Recent Trades ({result.trades.length})</h4>
            <div className="trades-list">
              {result.trades.slice(-10).reverse().map((trade, idx) => (
                <div key={trade.id} className={`trade-item ${trade.side}`}>
                  <div className="trade-main">
                    <span className={`trade-side ${trade.side}`}>
                      {trade.side.toUpperCase()}
                    </span>
                    <span className="trade-symbol">{trade.symbol}</span>
                    <span className="trade-quantity">{trade.quantity} shares</span>
                    <span className="trade-price">{formatCurrency(trade.price)}</span>
                    {trade.pnl !== undefined && (
                      <span className={`trade-pnl ${trade.pnl >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(trade.pnl)}
                      </span>
                    )}
                  </div>
                  <div className="trade-details">
                    <span className="trade-date">
                      {trade.timestamp.toLocaleDateString()} {trade.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="trade-reason">{trade.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Equity Curve Visualization */}
          <div className="equity-curve">
            <h4 className="section-title">Equity Curve</h4>
            <div className="chart-container">
              <svg className="equity-chart" viewBox="0 0 800 200">
                {/* Chart implementation would go here */}
                <text x="400" y="100" textAnchor="middle" className="chart-placeholder">
                  Equity curve visualization would be rendered here
                </text>
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BacktestPanel;