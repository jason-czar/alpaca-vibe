import React, { useState, useEffect } from 'react';
import { getPortfolioManager, Position, PortfolioMetrics, RiskMetrics, PortfolioOptimization, PerformanceAttribution } from './PortfolioManager';

const PortfolioPanel: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [optimization, setOptimization] = useState<PortfolioOptimization | null>(null);
  const [attribution, setAttribution] = useState<PerformanceAttribution | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'risk' | 'optimization' | 'attribution'>('overview');
  const [loading, setLoading] = useState(false);

  const portfolioManager = getPortfolioManager();

  useEffect(() => {
    loadPortfolioData();
    
    // Simulate real-time price updates
    const interval = setInterval(() => {
      simulatePriceUpdates();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadPortfolioData = () => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setPositions(portfolioManager.getPositions());
      setMetrics(portfolioManager.getPortfolioMetrics());
      setRiskMetrics(portfolioManager.getRiskMetrics());
      setOptimization(portfolioManager.generateOptimizationSuggestions());
      setAttribution(portfolioManager.calculatePerformanceAttribution());
      setLoading(false);
    }, 500);
  };

  const simulatePriceUpdates = () => {
    const priceUpdates: { [symbol: string]: number } = {};
    
    positions.forEach(position => {
      // Simulate small price movements
      const change = (Math.random() - 0.5) * 0.02; // ±1% max change
      priceUpdates[position.symbol] = position.currentPrice * (1 + change);
    });

    portfolioManager.updatePrices(priceUpdates);
    setPositions(portfolioManager.getPositions());
    setMetrics(portfolioManager.getPortfolioMetrics());
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

  const getChangeColor = (value: number) => {
    return value >= 0 ? 'positive' : 'negative';
  };

  if (loading) {
    return (
      <div className="portfolio-panel">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="portfolio-panel">
      <div className="panel-header">
        <h2 className="panel-title">Portfolio Management</h2>
        <p className="panel-subtitle">Advanced position tracking and risk management</p>
      </div>

      {/* Portfolio Summary */}
      {metrics && (
        <div className="portfolio-summary">
          <div className="summary-grid">
            <div className="summary-card primary">
              <div className="metric-label">Total Value</div>
              <div className="metric-value">
                {formatCurrency(metrics.totalValue)}
                <span className={`metric-change ${getChangeColor(metrics.dayChange)}`}>
                  {formatCurrency(metrics.dayChange)} ({formatPercent(metrics.dayChangePercent)})
                </span>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="metric-label">Total P&L</div>
              <div className={`metric-value ${getChangeColor(metrics.totalPL)}`}>
                {formatCurrency(metrics.totalPL)}
                <span className="metric-percent">
                  {formatPercent(metrics.totalPLPercent)}
                </span>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="metric-label">Buying Power</div>
              <div className="metric-value">
                {formatCurrency(metrics.buyingPower)}
                <span className="metric-detail">
                  Cash: {formatCurrency(metrics.cash)}
                </span>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="metric-label">Sharpe Ratio</div>
              <div className="metric-value">
                {metrics.sharpeRatio.toFixed(3)}
                <span className="metric-detail">
                  Risk-Adjusted Return
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="portfolio-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'risk' ? 'active' : ''}`}
          onClick={() => setActiveTab('risk')}
        >
          ⚠️ Risk Analysis
        </button>
        <button 
          className={`tab-button ${activeTab === 'optimization' ? 'active' : ''}`}
          onClick={() => setActiveTab('optimization')}
        >
          🎯 Optimization
        </button>
        <button 
          className={`tab-button ${activeTab === 'attribution' ? 'active' : ''}`}
          onClick={() => setActiveTab('attribution')}
        >
          📈 Attribution
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <h3 className="section-title">Positions ({positions.length})</h3>
            <div className="positions-table">
              <div className="table-header">
                <div className="header-cell">Symbol</div>
                <div className="header-cell">Quantity</div>
                <div className="header-cell">Avg Price</div>
                <div className="header-cell">Current Price</div>
                <div className="header-cell">Market Value</div>
                <div className="header-cell">P&L</div>
                <div className="header-cell">Weight</div>
                <div className="header-cell">Day Change</div>
              </div>
              
              {positions.map((position, index) => (
                <div key={position.symbol} className="table-row">
                  <div className="table-cell symbol-cell">
                    <span className="symbol">{position.symbol}</span>
                    <span className="sector">{position.sector}</span>
                  </div>
                  <div className="table-cell">{position.quantity}</div>
                  <div className="table-cell">{formatCurrency(position.averagePrice)}</div>
                  <div className="table-cell">{formatCurrency(position.currentPrice)}</div>
                  <div className="table-cell">{formatCurrency(position.marketValue)}</div>
                  <div className={`table-cell ${getChangeColor(position.unrealizedPL)}`}>
                    {formatCurrency(position.unrealizedPL)}
                    <span className="percent">({formatPercent(position.unrealizedPLPercent)})</span>
                  </div>
                  <div className="table-cell">{position.weight.toFixed(1)}%</div>
                  <div className={`table-cell ${getChangeColor(position.dayChange)}`}>
                    {formatCurrency(position.dayChange)}
                    <span className="percent">({formatPercent(position.dayChangePercent)})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'risk' && riskMetrics && (
          <div className="risk-tab">
            <div className="risk-metrics-grid">
              <div className="risk-section">
                <h4 className="section-title">Risk Metrics</h4>
                <div className="metrics-list">
                  <div className="metric-row">
                    <span>Portfolio Risk:</span>
                    <span>{(riskMetrics.portfolioRisk * 100).toFixed(2)}%</span>
                  </div>
                  <div className="metric-row">
                    <span>Concentration Risk:</span>
                    <span className={riskMetrics.concentrationRisk > 60 ? 'negative' : 'positive'}>
                      {riskMetrics.concentrationRisk.toFixed(1)}%
                    </span>
                  </div>
                  <div className="metric-row">
                    <span>Value at Risk (1-day):</span>
                    <span className="negative">{formatCurrency(riskMetrics.valueAtRisk)}</span>
                  </div>
                  <div className="metric-row">
                    <span>Expected Shortfall:</span>
                    <span className="negative">{formatCurrency(riskMetrics.expectedShortfall)}</span>
                  </div>
                  <div className="metric-row">
                    <span>Beta (Weighted):</span>
                    <span>{riskMetrics.betaWeighted.toFixed(3)}</span>
                  </div>
                </div>
              </div>

              <div className="risk-section">
                <h4 className="section-title">Sector Exposure</h4>
                <div className="sector-chart">
                  {Object.entries(riskMetrics.sectorExposure).map(([sector, weight]) => (
                    <div key={sector} className="sector-bar">
                      <div className="sector-label">{sector}</div>
                      <div className="sector-progress">
                        <div 
                          className="sector-fill" 
                          style={{ width: `${weight}%` }}
                        ></div>
                      </div>
                      <div className="sector-value">{weight.toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="correlation-section">
              <h4 className="section-title">Correlation Matrix</h4>
              <div className="correlation-matrix">
                {Object.entries(riskMetrics.correlationMatrix).map(([symbol1, correlations]) => (
                  <div key={symbol1} className="correlation-row">
                    <div className="correlation-label">{symbol1}</div>
                    {Object.entries(correlations).map(([symbol2, correlation]) => (
                      <div 
                        key={symbol2} 
                        className={`correlation-cell ${correlation > 0.7 ? 'high-correlation' : correlation < -0.3 ? 'negative-correlation' : ''}`}
                        title={`${symbol1} vs ${symbol2}: ${correlation.toFixed(3)}`}
                      >
                        {correlation.toFixed(2)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'optimization' && optimization && (
          <div className="optimization-tab">
            <div className="optimization-summary">
              <h4 className="section-title">Portfolio Optimization</h4>
              <div className="optimization-metrics">
                <div className="metric-card">
                  <div className="metric-label">Expected Return</div>
                  <div className="metric-value positive">{formatPercent(optimization.expectedReturn * 100)}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Expected Risk</div>
                  <div className="metric-value">{formatPercent(optimization.expectedRisk * 100)}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Sharpe Improvement</div>
                  <div className="metric-value positive">+{optimization.sharpeImprovement.toFixed(3)}</div>
                </div>
              </div>
            </div>

            <div className="rebalance-actions">
              <h4 className="section-title">Recommended Actions ({optimization.rebalanceActions.length})</h4>
              {optimization.rebalanceActions.length === 0 ? (
                <div className="no-actions">
                  ✅ Your portfolio is well-balanced. No rebalancing needed at this time.
                </div>
              ) : (
                <div className="actions-list">
                  {optimization.rebalanceActions.map((action, index) => (
                    <div key={index} className={`action-card ${action.action}`}>
                      <div className="action-header">
                        <span className={`action-type ${action.action}`}>
                          {action.action.toUpperCase()}
                        </span>
                        <span className="action-symbol">{action.symbol}</span>
                        <span className="action-quantity">{action.quantity} shares</span>
                      </div>
                      <div className="action-details">
                        <div className="weight-change">
                          {action.currentWeight.toFixed(1)}% → {action.targetWeight.toFixed(1)}%
                        </div>
                        <div className="action-reason">{action.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="allocation-comparison">
              <h4 className="section-title">Allocation Comparison</h4>
              <div className="allocation-chart">
                {Object.entries(optimization.currentAllocation).map(([symbol, weight]) => (
                  <div key={symbol} className="allocation-row">
                    <div className="allocation-symbol">{symbol}</div>
                    <div className="allocation-bars">
                      <div className="allocation-bar current">
                        <div 
                          className="allocation-fill current" 
                          style={{ width: `${weight}%` }}
                        ></div>
                        <span className="allocation-label">Current: {weight.toFixed(1)}%</span>
                      </div>
                      <div className="allocation-bar suggested">
                        <div 
                          className="allocation-fill suggested" 
                          style={{ width: `${optimization.suggestedAllocation[symbol]}%` }}
                        ></div>
                        <span className="allocation-label">Target: {optimization.suggestedAllocation[symbol].toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attribution' && attribution && (
          <div className="attribution-tab">
            <h4 className="section-title">Performance Attribution</h4>
            
            <div className="attribution-summary">
              <div className="attribution-metric primary">
                <div className="metric-label">Total Return</div>
                <div className={`metric-value ${getChangeColor(attribution.totalReturn)}`}>
                  {formatPercent(attribution.totalReturn)}
                </div>
              </div>
              
              <div className="attribution-metric">
                <div className="metric-label">Benchmark ({attribution.benchmark})</div>
                <div className="metric-value">
                  {formatPercent(attribution.benchmarkReturn)}
                </div>
              </div>
              
              <div className="attribution-metric">
                <div className="metric-label">Active Return</div>
                <div className={`metric-value ${getChangeColor(attribution.activeReturn)}`}>
                  {formatPercent(attribution.activeReturn)}
                </div>
              </div>
            </div>

            <div className="attribution-breakdown">
              <h5 className="subsection-title">Return Attribution Breakdown</h5>
              <div className="attribution-chart">
                <div className="attribution-bar">
                  <div className="attribution-label">Asset Allocation</div>
                  <div className="attribution-value positive">
                    +{attribution.assetAllocation.toFixed(2)}%
                  </div>
                  <div className="attribution-description">
                    Return from sector/asset class allocation decisions
                  </div>
                </div>
                
                <div className="attribution-bar">
                  <div className="attribution-label">Stock Selection</div>
                  <div className={`attribution-value ${getChangeColor(attribution.stockSelection)}`}>
                    {attribution.stockSelection >= 0 ? '+' : ''}{attribution.stockSelection.toFixed(2)}%
                  </div>
                  <div className="attribution-description">
                    Return from individual stock picking within sectors
                  </div>
                </div>
                
                <div className="attribution-bar">
                  <div className="attribution-label">Interaction Effect</div>
                  <div className={`attribution-value ${getChangeColor(attribution.interaction)}`}>
                    {attribution.interaction >= 0 ? '+' : ''}{attribution.interaction.toFixed(2)}%
                  </div>
                  <div className="attribution-description">
                    Combined effect of allocation and selection decisions
                  </div>
                </div>
              </div>
            </div>

            <div className="tracking-metrics">
              <h5 className="subsection-title">Risk Metrics</h5>
              <div className="tracking-grid">
                <div className="tracking-metric">
                  <div className="metric-label">Tracking Error</div>
                  <div className="metric-value">{attribution.trackingError.toFixed(2)}%</div>
                  <div className="metric-description">Standard deviation of active returns</div>
                </div>
                
                <div className="tracking-metric">
                  <div className="metric-label">Information Ratio</div>
                  <div className="metric-value">
                    {(attribution.activeReturn / attribution.trackingError).toFixed(3)}
                  </div>
                  <div className="metric-description">Active return per unit of tracking error</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioPanel;