import React, { useState, useEffect, useMemo } from 'react';
import { getAnalyticsEngine, AnalyticsMetrics, ChartData, HeatmapData } from './AnalyticsEngine';

interface AnalyticsDashboardProps {
  onClose: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'performance' | 'risk' | 'attribution' | 'efficiency' | 'custom'>('performance');
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | '2Y' | '3Y' | 'ALL'>('1Y');
  const [benchmark, setBenchmark] = useState('SPY');
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // seconds

  const analyticsEngine = getAnalyticsEngine();

  useEffect(() => {
    loadAnalytics();
    
    // Set up auto-refresh
    const interval = setInterval(loadAnalytics, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [timeframe, benchmark, refreshInterval]);

  const loadAnalytics = async () => {
    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const analyticsData = analyticsEngine.calculateAnalytics();
      setMetrics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPercent = (value: number, decimals: number = 2) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  const getChangeColor = (value: number) => {
    return value >= 0 ? 'positive' : 'negative';
  };

  const getRiskColor = (value: number, thresholds: { low: number; medium: number }) => {
    if (value <= thresholds.low) return 'positive';
    if (value <= thresholds.medium) return 'warning';
    return 'negative';
  };

  // Memoized chart data
  const performanceChart = useMemo(() => {
    return analyticsEngine.generatePerformanceChart();
  }, [metrics]);

  const drawdownChart = useMemo(() => {
    return analyticsEngine.generateDrawdownChart();
  }, [metrics]);

  const volatilityChart = useMemo(() => {
    return analyticsEngine.generateVolatilityChart();
  }, [metrics]);

  const correlationHeatmap = useMemo(() => {
    return analyticsEngine.generateCorrelationHeatmap();
  }, [metrics]);

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="analytics-dashboard">
        <div className="dashboard-error">
          <p>Failed to load analytics data</p>
          <button onClick={loadAnalytics} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h2 className="dashboard-title">Advanced Analytics Dashboard</h2>
          <p className="dashboard-subtitle">Comprehensive portfolio performance and risk analysis</p>
        </div>
        <div className="header-controls">
          <div className="control-group">
            <label className="control-label">Timeframe:</label>
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="control-select"
            >
              <option value="1M">1 Month</option>
              <option value="3M">3 Months</option>
              <option value="6M">6 Months</option>
              <option value="1Y">1 Year</option>
              <option value="2Y">2 Years</option>
              <option value="3Y">3 Years</option>
              <option value="ALL">All Time</option>
            </select>
          </div>
          
          <div className="control-group">
            <label className="control-label">Benchmark:</label>
            <select 
              value={benchmark} 
              onChange={(e) => setBenchmark(e.target.value)}
              className="control-select"
            >
              <option value="SPY">S&P 500 (SPY)</option>
              <option value="QQQ">NASDAQ (QQQ)</option>
              <option value="IWM">Russell 2000 (IWM)</option>
              <option value="VTI">Total Stock Market (VTI)</option>
            </select>
          </div>
          
          <button onClick={loadAnalytics} className="refresh-btn" title="Refresh Data">
            🔄
          </button>
          
          <button onClick={onClose} className="close-btn">×</button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="kpi-grid">
        <div className="kpi-card primary">
          <div className="kpi-label">Total Return</div>
          <div className={`kpi-value ${getChangeColor(metrics.performance.totalReturn)}`}>
            {formatPercent(metrics.performance.totalReturn)}
          </div>
          <div className="kpi-detail">
            Annualized: {formatPercent(metrics.performance.annualizedReturn)}
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-label">Sharpe Ratio</div>
          <div className="kpi-value">
            {formatNumber(metrics.efficiency.sharpeRatio, 3)}
          </div>
          <div className="kpi-detail">
            Risk-adjusted return
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-label">Max Drawdown</div>
          <div className={`kpi-value ${getRiskColor(metrics.risk.maxDrawdown.maximum, { low: 10, medium: 20 })}`}>
            -{formatNumber(metrics.risk.maxDrawdown.maximum)}%
          </div>
          <div className="kpi-detail">
            Current: -{formatNumber(metrics.risk.maxDrawdown.current)}%
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-label">Volatility</div>
          <div className="kpi-value">
            {formatNumber(metrics.risk.volatility.total)}%
          </div>
          <div className="kpi-detail">
            Annualized standard deviation
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-label">Alpha vs {benchmark}</div>
          <div className={`kpi-value ${getChangeColor(metrics.benchmark.alpha)}`}>
            {formatPercent(metrics.benchmark.alpha)}
          </div>
          <div className="kpi-detail">
            Beta: {formatNumber(metrics.benchmark.beta, 3)}
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-label">Information Ratio</div>
          <div className="kpi-value">
            {formatNumber(metrics.benchmark.informationRatio, 3)}
          </div>
          <div className="kpi-detail">
            Tracking Error: {formatPercent(metrics.benchmark.trackingError)}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          📈 Performance
        </button>
        <button 
          className={`tab-button ${activeTab === 'risk' ? 'active' : ''}`}
          onClick={() => setActiveTab('risk')}
        >
          ⚠️ Risk Analysis
        </button>
        <button 
          className={`tab-button ${activeTab === 'attribution' ? 'active' : ''}`}
          onClick={() => setActiveTab('attribution')}
        >
          🎯 Attribution
        </button>
        <button 
          className={`tab-button ${activeTab === 'efficiency' ? 'active' : ''}`}
          onClick={() => setActiveTab('efficiency')}
        >
          ⚡ Efficiency
        </button>
        <button 
          className={`tab-button ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          🔧 Custom
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'performance' && (
          <div className="performance-tab">
            {/* Performance Chart */}
            <div className="chart-section">
              <h3 className="section-title">Cumulative Performance</h3>
              <div className="chart-container">
                <div className="chart-placeholder">
                  <svg viewBox="0 0 800 300" className="performance-chart">
                    <defs>
                      <linearGradient id="portfolioGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#58a6ff" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#58a6ff" stopOpacity="0.1"/>
                      </linearGradient>
                    </defs>
                    
                    {/* Portfolio line */}
                    <path
                      d="M 50 250 Q 200 200 350 150 T 750 100"
                      stroke="#58a6ff"
                      strokeWidth="3"
                      fill="none"
                    />
                    
                    {/* Benchmark line */}
                    <path
                      d="M 50 250 Q 200 220 350 180 T 750 140"
                      stroke="#8b949e"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="5,5"
                    />
                    
                    {/* Fill area */}
                    <path
                      d="M 50 250 Q 200 200 350 150 T 750 100 L 750 300 L 50 300 Z"
                      fill="url(#portfolioGradient)"
                    />
                    
                    {/* Labels */}
                    <text x="60" y="280" className="chart-label">Start</text>
                    <text x="720" y="280" className="chart-label">Now</text>
                    <text x="400" y="20" className="chart-title">Portfolio vs Benchmark Performance</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Performance Metrics Grid */}
            <div className="metrics-grid">
              <div className="metrics-section">
                <h4 className="section-title">Returns Analysis</h4>
                <div className="metrics-list">
                  <div className="metric-row">
                    <span className="metric-label">Total Return:</span>
                    <span className={`metric-value ${getChangeColor(metrics.performance.totalReturn)}`}>
                      {formatPercent(metrics.performance.totalReturn)}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Annualized Return:</span>
                    <span className={`metric-value ${getChangeColor(metrics.performance.annualizedReturn)}`}>
                      {formatPercent(metrics.performance.annualizedReturn)}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Best Month:</span>
                    <span className="metric-value positive">
                      {formatPercent(metrics.performance.bestMonth.return * 100)}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Worst Month:</span>
                    <span className="metric-value negative">
                      {formatPercent(metrics.performance.worstMonth.return * 100)}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Positive Months:</span>
                    <span className="metric-value">
                      {metrics.performance.positiveMonths} / {metrics.performance.positiveMonths + metrics.performance.negativeMonths}
                    </span>
                  </div>
                </div>
              </div>

              <div className="metrics-section">
                <h4 className="section-title">Period Returns</h4>
                <div className="period-returns">
                  {metrics.performance.periodReturns.map((period, i) => (
                    <div key={i} className="period-row">
                      <span className="period-label">{period.period}:</span>
                      <span className={`period-value ${getChangeColor(period.return)}`}>
                        {formatPercent(period.return)}
                      </span>
                      <span className="period-vs">vs {formatPercent(period.benchmark)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="metrics-section">
                <h4 className="section-title">Rolling Performance</h4>
                <div className="rolling-metrics">
                  {metrics.performance.rollingReturns.slice(-3).map((roll, i) => (
                    <div key={i} className="rolling-item">
                      <div className="rolling-period">{roll.period} Rolling</div>
                      <div className={`rolling-return ${getChangeColor(roll.return * 100)}`}>
                        {formatPercent(roll.return * 100)}
                      </div>
                      <div className="rolling-sharpe">
                        Sharpe: {formatNumber(roll.sharpe, 2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="risk-tab">
            {/* Drawdown Chart */}
            <div className="chart-section">
              <h3 className="section-title">Drawdown Analysis</h3>
              <div className="chart-container">
                <div className="chart-placeholder">
                  <svg viewBox="0 0 800 300" className="drawdown-chart">
                    <defs>
                      <linearGradient id="drawdownGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ff7b72" stopOpacity="0.1"/>
                        <stop offset="100%" stopColor="#ff7b72" stopOpacity="0.4"/>
                      </linearGradient>
                    </defs>
                    
                    {/* Zero line */}
                    <line x1="50" y1="50" x2="750" y2="50" stroke="#8b949e" strokeWidth="1" strokeDasharray="2,2"/>
                    
                    {/* Drawdown area */}
                    <path
                      d="M 50 50 L 150 80 L 250 120 L 350 90 L 450 150 L 550 100 L 650 70 L 750 50"
                      stroke="#ff7b72"
                      strokeWidth="2"
                      fill="none"
                    />
                    
                    <path
                      d="M 50 50 L 150 80 L 250 120 L 350 90 L 450 150 L 550 100 L 650 70 L 750 50 L 750 50 L 50 50 Z"
                      fill="url(#drawdownGradient)"
                    />
                    
                    <text x="400" y="20" className="chart-title">Portfolio Drawdown Over Time</text>
                    <text x="60" y="280" className="chart-label">0%</text>
                    <text x="60" y="170" className="chart-label">-15%</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Risk Metrics Grid */}
            <div className="risk-metrics-grid">
              <div className="risk-section">
                <h4 className="section-title">Value at Risk (VaR)</h4>
                <div className="var-metrics">
                  <div className="var-item">
                    <div className="var-label">Daily VaR (95%):</div>
                    <div className="var-value negative">
                      -{formatNumber(metrics.risk.valueAtRisk.daily.confidence95)}%
                    </div>
                  </div>
                  <div className="var-item">
                    <div className="var-label">Daily VaR (99%):</div>
                    <div className="var-value negative">
                      -{formatNumber(metrics.risk.valueAtRisk.daily.confidence99)}%
                    </div>
                  </div>
                  <div className="var-item">
                    <div className="var-label">Expected Shortfall:</div>
                    <div className="var-value negative">
                      -{formatNumber(metrics.risk.expectedShortfall)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="risk-section">
                <h4 className="section-title">Volatility Breakdown</h4>
                <div className="volatility-breakdown">
                  <div className="vol-item">
                    <span className="vol-label">Total Volatility:</span>
                    <span className="vol-value">{formatNumber(metrics.risk.volatility.total)}%</span>
                  </div>
                  <div className="vol-item">
                    <span className="vol-label">Systematic Risk:</span>
                    <span className="vol-value">{formatNumber(metrics.risk.volatility.systematic)}%</span>
                  </div>
                  <div className="vol-item">
                    <span className="vol-label">Idiosyncratic Risk:</span>
                    <span className="vol-value">{formatNumber(metrics.risk.volatility.idiosyncratic)}%</span>
                  </div>
                  <div className="vol-item">
                    <span className="vol-label">Upside Volatility:</span>
                    <span className="vol-value positive">{formatNumber(metrics.risk.volatility.upside)}%</span>
                  </div>
                  <div className="vol-item">
                    <span className="vol-label">Downside Volatility:</span>
                    <span className="vol-value negative">{formatNumber(metrics.risk.volatility.downside)}%</span>
                  </div>
                </div>
              </div>

              <div className="risk-section">
                <h4 className="section-title">Beta Analysis</h4>
                <div className="beta-analysis">
                  <div className="beta-item">
                    <span className="beta-label">Overall Beta:</span>
                    <span className="beta-value">{formatNumber(metrics.risk.beta.overall, 3)}</span>
                  </div>
                  <div className="beta-item">
                    <span className="beta-label">Up Beta:</span>
                    <span className="beta-value positive">{formatNumber(metrics.risk.beta.upBeta, 3)}</span>
                  </div>
                  <div className="beta-item">
                    <span className="beta-label">Down Beta:</span>
                    <span className="beta-value negative">{formatNumber(metrics.risk.beta.downBeta, 3)}</span>
                  </div>
                  <div className="beta-stability">
                    <span className="stability-label">Beta Stability:</span>
                    <span className={`stability-value ${metrics.risk.beta.stability.stable ? 'positive' : 'negative'}`}>
                      {metrics.risk.beta.stability.stable ? 'Stable' : 'Unstable'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="risk-section">
                <h4 className="section-title">Downside Risk</h4>
                <div className="downside-metrics">
                  <div className="downside-item">
                    <span className="downside-label">Downside Deviation:</span>
                    <span className="downside-value">{formatNumber(metrics.risk.downside.downsideDeviation)}%</span>
                  </div>
                  <div className="downside-item">
                    <span className="downside-label">Pain Index:</span>
                    <span className="downside-value">{formatNumber(metrics.risk.downside.painIndex)}</span>
                  </div>
                  <div className="downside-item">
                    <span className="downside-label">Ulcer Index:</span>
                    <span className="downside-value">{formatNumber(metrics.risk.downside.ulcerIndex)}</span>
                  </div>
                  <div className="downside-item">
                    <span className="downside-label">Downside Frequency:</span>
                    <span className="downside-value">{formatNumber(metrics.risk.downside.downsideFrequency)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Correlation Heatmap */}
            <div className="correlation-section">
              <h4 className="section-title">Asset Correlation Matrix</h4>
              <div className="correlation-heatmap">
                <div className="heatmap-grid">
                  {correlationHeatmap.map((cell, i) => (
                    <div 
                      key={i} 
                      className="heatmap-cell"
                      style={{ 
                        backgroundColor: cell.color,
                        opacity: Math.abs(cell.value) * 0.8 + 0.2
                      }}
                      title={`${cell.x} vs ${cell.y}: ${cell.value.toFixed(3)}`}
                    >
                      {cell.value.toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attribution' && (
          <div className="attribution-tab">
            {/* Sector Attribution */}
            <div className="attribution-section">
              <h4 className="section-title">Sector Attribution Analysis</h4>
              <div className="attribution-table">
                <div className="table-header">
                  <div className="header-cell">Sector</div>
                  <div className="header-cell">Allocation</div>
                  <div className="header-cell">Selection</div>
                  <div className="header-cell">Interaction</div>
                  <div className="header-cell">Total</div>
                </div>
                {metrics.attribution.sectors.map((sector, i) => (
                  <div key={i} className="table-row">
                    <div className="table-cell">{sector.sector}</div>
                    <div className={`table-cell ${getChangeColor(sector.allocation)}`}>
                      {formatPercent(sector.allocation)}
                    </div>
                    <div className={`table-cell ${getChangeColor(sector.selection)}`}>
                      {formatPercent(sector.selection)}
                    </div>
                    <div className={`table-cell ${getChangeColor(sector.interaction)}`}>
                      {formatPercent(sector.interaction)}
                    </div>
                    <div className={`table-cell ${getChangeColor(sector.total)}`}>
                      {formatPercent(sector.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Asset Attribution */}
            <div className="attribution-section">
              <h4 className="section-title">Asset Contribution Analysis</h4>
              <div className="asset-attribution">
                {metrics.attribution.assets.map((asset, i) => (
                  <div key={i} className="asset-card">
                    <div className="asset-header">
                      <span className="asset-symbol">{asset.symbol}</span>
                      <span className="asset-weight">{asset.weight}%</span>
                    </div>
                    <div className="asset-metrics">
                      <div className="asset-metric">
                        <span className="metric-label">Return:</span>
                        <span className={`metric-value ${getChangeColor(asset.return)}`}>
                          {formatPercent(asset.return)}
                        </span>
                      </div>
                      <div className="asset-metric">
                        <span className="metric-label">Contribution:</span>
                        <span className={`metric-value ${getChangeColor(asset.contribution)}`}>
                          {formatPercent(asset.contribution)}
                        </span>
                      </div>
                      <div className="asset-metric">
                        <span className="metric-label">Attribution:</span>
                        <span className={`metric-value ${getChangeColor(asset.attribution)}`}>
                          {formatPercent(asset.attribution)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Factor Attribution */}
            <div className="attribution-section">
              <h4 className="section-title">Factor Attribution</h4>
              <div className="factor-attribution">
                {metrics.attribution.factors.map((factor, i) => (
                  <div key={i} className="factor-item">
                    <div className="factor-name">{factor.factor}</div>
                    <div className="factor-bar">
                      <div 
                        className={`factor-fill ${getChangeColor(factor.contribution)}`}
                        style={{ width: `${Math.abs(factor.contribution) * 10}%` }}
                      ></div>
                    </div>
                    <div className="factor-metrics">
                      <span className="factor-exposure">Exp: {formatNumber(factor.exposure, 2)}</span>
                      <span className="factor-return">Ret: {formatPercent(factor.return)}</span>
                      <span className={`factor-contribution ${getChangeColor(factor.contribution)}`}>
                        {formatPercent(factor.contribution)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attribution Summary */}
            <div className="attribution-summary">
              <div className="summary-grid">
                <div className="summary-card">
                  <div className="summary-label">Timing Effect</div>
                  <div className={`summary-value ${getChangeColor(metrics.attribution.timing.total)}`}>
                    {formatPercent(metrics.attribution.timing.total)}
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Selection Effect</div>
                  <div className={`summary-value ${getChangeColor(metrics.attribution.selection.total)}`}>
                    {formatPercent(metrics.attribution.selection.total)}
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Interaction Effect</div>
                  <div className={`summary-value ${getChangeColor(metrics.attribution.interaction.total)}`}>
                    {formatPercent(metrics.attribution.interaction.total)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'efficiency' && (
          <div className="efficiency-tab">
            {/* Risk-Adjusted Returns */}
            <div className="efficiency-section">
              <h4 className="section-title">Risk-Adjusted Return Metrics</h4>
              <div className="efficiency-grid">
                <div className="efficiency-card primary">
                  <div className="efficiency-label">Sharpe Ratio</div>
                  <div className="efficiency-value">{formatNumber(metrics.efficiency.sharpeRatio, 3)}</div>
                  <div className="efficiency-description">Return per unit of total risk</div>
                </div>
                
                <div className="efficiency-card">
                  <div className="efficiency-label">Sortino Ratio</div>
                  <div className="efficiency-value">{formatNumber(metrics.efficiency.sortinoRatio, 3)}</div>
                  <div className="efficiency-description">Return per unit of downside risk</div>
                </div>
                
                <div className="efficiency-card">
                  <div className="efficiency-label">Calmar Ratio</div>
                  <div className="efficiency-value">{formatNumber(metrics.efficiency.calmarRatio, 3)}</div>
                  <div className="efficiency-description">Return per unit of max drawdown</div>
                </div>
                
                <div className="efficiency-card">
                  <div className="efficiency-label">Information Ratio</div>
                  <div className="efficiency-value">{formatNumber(metrics.efficiency.informationRatio, 3)}</div>
                  <div className="efficiency-description">Active return per tracking error</div>
                </div>
                
                <div className="efficiency-card">
                  <div className="efficiency-label">Treynor Ratio</div>
                  <div className="efficiency-value">{formatNumber(metrics.efficiency.treynorRatio, 3)}</div>
                  <div className="efficiency-description">Return per unit of systematic risk</div>
                </div>
                
                <div className="efficiency-card">
                  <div className="efficiency-label">Jensen's Alpha</div>
                  <div className={`efficiency-value ${getChangeColor(metrics.efficiency.jensenAlpha * 100)}`}>
                    {formatPercent(metrics.efficiency.jensenAlpha * 100)}
                  </div>
                  <div className="efficiency-description">Risk-adjusted excess return</div>
                </div>
              </div>
            </div>

            {/* Advanced Efficiency Metrics */}
            <div className="efficiency-section">
              <h4 className="section-title">Advanced Efficiency Metrics</h4>
              <div className="advanced-metrics">
                <div className="metric-group">
                  <h5 className="group-title">Drawdown-Based Ratios</h5>
                  <div className="metric-item">
                    <span className="metric-name">Sterling Ratio:</span>
                    <span className="metric-value">{formatNumber(metrics.efficiency.sterlingRatio, 3)}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-name">Burke Ratio:</span>
                    <span className="metric-value">{formatNumber(metrics.efficiency.burkeRatio, 3)}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-name">Martin Ratio:</span>
                    <span className="metric-value">{formatNumber(metrics.efficiency.martinRatio, 3)}</span>
                  </div>
                </div>
                
                <div className="metric-group">
                  <h5 className="group-title">Benchmark-Relative</h5>
                  <div className="metric-item">
                    <span className="metric-name">Modigliani Ratio:</span>
                    <span className="metric-value">{formatNumber(metrics.efficiency.modiglianiRatio, 3)}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-name">Up Capture:</span>
                    <span className="metric-value positive">{formatPercent(metrics.benchmark.upCapture)}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-name">Down Capture:</span>
                    <span className="metric-value negative">{formatPercent(metrics.benchmark.downCapture)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Efficiency Comparison Chart */}
            <div className="efficiency-section">
              <h4 className="section-title">Risk-Return Efficiency</h4>
              <div className="efficiency-chart">
                <div className="chart-placeholder">
                  <svg viewBox="0 0 600 400" className="scatter-chart">
                    {/* Axes */}
                    <line x1="80" y1="350" x2="550" y2="350" stroke="#8b949e" strokeWidth="1"/>
                    <line x1="80" y1="350" x2="80" y2="50" stroke="#8b949e" strokeWidth="1"/>
                    
                    {/* Portfolio point */}
                    <circle cx="300" cy="200" r="8" fill="#58a6ff" stroke="#fff" strokeWidth="2"/>
                    <text x="310" y="205" className="chart-label">Portfolio</text>
                    
                    {/* Benchmark point */}
                    <circle cx="250" cy="250" r="6" fill="#8b949e" stroke="#fff" strokeWidth="2"/>
                    <text x="260" y="255" className="chart-label">Benchmark</text>
                    
                    {/* Efficient frontier curve */}
                    <path
                      d="M 100 340 Q 200 300 300 200 Q 400 120 500 80"
                      stroke="#3fb950"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="3,3"
                    />
                    <text x="450" y="70" className="chart-label">Efficient Frontier</text>
                    
                    {/* Labels */}
                    <text x="300" y="380" className="axis-label">Risk (Volatility %)</text>
                    <text x="20" y="200" className="axis-label" transform="rotate(-90 20 200)">Return %</text>
                    <text x="300" y="30" className="chart-title">Risk-Return Positioning</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="custom-tab">
            <div className="custom-dashboard">
              <h4 className="section-title">Custom Dashboard Builder</h4>
              <p className="section-subtitle">Create personalized analytics views</p>
              
              <div className="dashboard-builder">
                <div className="widget-library">
                  <h5 className="library-title">Available Widgets</h5>
                  <div className="widget-list">
                    <div className="widget-item" draggable>
                      📈 Performance Chart
                    </div>
                    <div className="widget-item" draggable>
                      📊 Risk Metrics
                    </div>
                    <div className="widget-item" draggable>
                      🎯 Attribution Table
                    </div>
                    <div className="widget-item" draggable>
                      📉 Drawdown Chart
                    </div>
                    <div className="widget-item" draggable>
                      🔥 Correlation Heatmap
                    </div>
                    <div className="widget-item" draggable>
                      ⚡ Efficiency Ratios
                    </div>
                  </div>
                </div>
                
                <div className="dashboard-canvas">
                  <div className="canvas-placeholder">
                    <div className="placeholder-content">
                      <div className="placeholder-icon">🎨</div>
                      <h5>Custom Dashboard Canvas</h5>
                      <p>Drag widgets from the library to create your personalized analytics dashboard</p>
                      <button className="create-dashboard-btn">Start Building</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="dashboard-templates">
                <h5 className="templates-title">Dashboard Templates</h5>
                <div className="templates-grid">
                  <div className="template-card">
                    <div className="template-name">Risk Manager</div>
                    <div className="template-description">Focus on risk metrics and drawdown analysis</div>
                    <button className="use-template-btn">Use Template</button>
                  </div>
                  <div className="template-card">
                    <div className="template-name">Performance Tracker</div>
                    <div className="template-description">Track returns and benchmark comparison</div>
                    <button className="use-template-btn">Use Template</button>
                  </div>
                  <div className="template-card">
                    <div className="template-name">Attribution Analyst</div>
                    <div className="template-description">Deep dive into performance attribution</div>
                    <button className="use-template-btn">Use Template</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;