import React, { useState, useEffect } from 'react';
import { getStrategyEngine, TradingStrategy, BotTemplate } from './StrategyEngine';
import type { Indicator, IndicatorState } from './types';

interface StrategyTemplatePanelProps {
  onTemplateApplied: (indicators: Indicator[], indicatorStates: IndicatorState[], strategy: TradingStrategy) => void;
  onClose: () => void;
}

const StrategyTemplatePanel: React.FC<StrategyTemplatePanelProps> = ({ onTemplateApplied, onClose }) => {
  const [activeTab, setActiveTab] = useState<'bot_templates' | 'strategies' | 'create'>('bot_templates');
  const [botTemplates, setBotTemplates] = useState<BotTemplate[]>([]);
  const [strategies, setStrategies] = useState<TradingStrategy[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<BotTemplate | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<TradingStrategy | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const strategyEngine = getStrategyEngine();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setBotTemplates(strategyEngine.getAllBotTemplates());
    setStrategies(strategyEngine.getAllStrategies());
  };

  const handleApplyBotTemplate = async (template: BotTemplate) => {
    setLoading(true);
    
    try {
      const result = strategyEngine.applyBotTemplate(template.id);
      
      if (result.success && result.indicators && result.strategy) {
        // Convert template indicators to standard format
        const indicators: Indicator[] = result.indicators.map(ind => ({
          name: ind.name,
          param: Object.keys(ind.parameters)[0] || 'Value',
          min: 1,
          max: 100,
          default: Object.values(ind.parameters)[0] as number || 14,
          step: 1
        }));

        const indicatorStates: IndicatorState[] = result.indicators.map(ind => ({
          enabled: ind.enabled,
          value: Object.values(ind.parameters)[0] as number || 14
        }));

        onTemplateApplied(indicators, indicatorStates, result.strategy);
        onClose();
      }
    } catch (error) {
      console.error('Failed to apply template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyStrategy = (strategy: TradingStrategy) => {
    // Convert strategy to indicators format
    const indicators: Indicator[] = strategy.parameters.map(param => ({
      name: param.name,
      param: param.description,
      min: param.min || 0,
      max: param.max || 100,
      default: param.defaultValue,
      step: param.step || 1
    }));

    const indicatorStates: IndicatorState[] = strategy.parameters.map(param => ({
      enabled: true,
      value: param.defaultValue
    }));

    onTemplateApplied(indicators, indicatorStates, strategy);
    onClose();
  };

  const filteredBotTemplates = botTemplates.filter(template => {
    const categoryMatch = filterCategory === 'all' || template.category === filterCategory;
    const difficultyMatch = filterDifficulty === 'all' || template.difficulty === filterDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const filteredStrategies = strategies.filter(strategy => {
    return filterCategory === 'all' || strategy.category === filterCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'positive';
      case 'medium': return 'warning';
      case 'hard': return 'negative';
      case 'expert': return 'error';
      default: return '';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'conservative': return 'positive';
      case 'moderate': return 'warning';
      case 'aggressive': return 'negative';
      case 'high_risk': return 'error';
      default: return '';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'beginner': return '🌱';
      case 'intermediate': return '📈';
      case 'advanced': return '⚡';
      case 'professional': return '🏆';
      case 'momentum': return '🚀';
      case 'mean_reversion': return '🔄';
      case 'breakout': return '💥';
      case 'trend_following': return '📊';
      case 'scalping': return '⚡';
      case 'swing': return '🌊';
      default: return '🔧';
    }
  };

  return (
    <div className="strategy-template-panel">
      <div className="panel-header">
        <h2 className="panel-title">Strategy Templates & Bot Presets</h2>
        <p className="panel-subtitle">Choose from professional trading strategies and pre-configured bots</p>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      {/* Navigation Tabs */}
      <div className="template-tabs">
        <button 
          className={`tab-button ${activeTab === 'bot_templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('bot_templates')}
        >
          🤖 Bot Templates ({botTemplates.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'strategies' ? 'active' : ''}`}
          onClick={() => setActiveTab('strategies')}
        >
          📊 Strategies ({strategies.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          🔧 Create Custom
        </button>
      </div>

      {/* Filters */}
      <div className="template-filters">
        <div className="filter-group">
          <label className="filter-label">Category:</label>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {activeTab === 'bot_templates' ? (
              <>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="professional">Professional</option>
              </>
            ) : (
              <>
                <option value="momentum">Momentum</option>
                <option value="mean_reversion">Mean Reversion</option>
                <option value="breakout">Breakout</option>
                <option value="trend_following">Trend Following</option>
                <option value="scalping">Scalping</option>
                <option value="swing">Swing</option>
              </>
            )}
          </select>
        </div>
        
        {activeTab === 'bot_templates' && (
          <div className="filter-group">
            <label className="filter-label">Difficulty:</label>
            <select 
              value={filterDifficulty} 
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'bot_templates' && (
          <div className="bot-templates-tab">
            <div className="templates-grid">
              {filteredBotTemplates.map((template) => (
                <div key={template.id} className="template-card bot-template">
                  <div className="template-header">
                    <div className="template-info">
                      <span className="category-icon">{getCategoryIcon(template.category)}</span>
                      <div>
                        <h4 className="template-name">{template.name}</h4>
                        <p className="template-category">{template.category}</p>
                      </div>
                    </div>
                    <div className="template-badges">
                      <span className={`difficulty-badge ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </span>
                      <span className={`risk-badge ${getRiskColor(template.riskProfile)}`}>
                        {template.riskProfile}
                      </span>
                    </div>
                  </div>
                  
                  <p className="template-description">{template.description}</p>
                  
                  <div className="template-metrics">
                    <div className="metric-row">
                      <span className="metric-label">Expected Return:</span>
                      <span className="metric-value positive">{template.expectedReturn}%</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Volatility:</span>
                      <span className="metric-value">{template.expectedVolatility}%</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Min Capital:</span>
                      <span className="metric-value">${template.recommendedCapital.toLocaleString()}</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Time Commitment:</span>
                      <span className="metric-value">{template.timeCommitment}</span>
                    </div>
                  </div>
                  
                  <div className="template-indicators">
                    <h5 className="indicators-title">Included Indicators ({template.indicators.length})</h5>
                    <div className="indicators-list">
                      {template.indicators.map((ind, i) => (
                        <span key={i} className={`indicator-chip ${ind.enabled ? 'enabled' : 'disabled'}`}>
                          {ind.name.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="template-tags">
                    {template.tags.map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    ))}
                  </div>
                  
                  <div className="template-actions">
                    <button 
                      onClick={() => setSelectedTemplate(template)} 
                      className="preview-btn"
                    >
                      📖 Learn More
                    </button>
                    <button 
                      onClick={() => handleApplyBotTemplate(template)}
                      disabled={loading}
                      className="apply-template-btn"
                    >
                      {loading ? 'Applying...' : '🚀 Use This Bot'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'strategies' && (
          <div className="strategies-tab">
            <div className="strategies-grid">
              {filteredStrategies.map((strategy) => (
                <div key={strategy.id} className="strategy-card">
                  <div className="strategy-header">
                    <div className="strategy-info">
                      <span className="category-icon">{getCategoryIcon(strategy.category)}</span>
                      <div>
                        <h4 className="strategy-name">{strategy.name}</h4>
                        <p className="strategy-category">{strategy.category.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="strategy-badges">
                      <span className={`complexity-badge ${strategy.validation.complexity === 'low' ? 'positive' : strategy.validation.complexity === 'medium' ? 'warning' : 'negative'}`}>
                        {strategy.validation.complexity}
                      </span>
                      <span className="risk-badge">
                        Risk: {strategy.validation.riskScore}/10
                      </span>
                    </div>
                  </div>
                  
                  <p className="strategy-description">{strategy.description}</p>
                  
                  <div className="strategy-details">
                    <div className="detail-row">
                      <span className="detail-label">Entry Rules:</span>
                      <span className="detail-value">{strategy.entryRules.length}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Exit Rules:</span>
                      <span className="detail-value">{strategy.exitRules.length}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Parameters:</span>
                      <span className="detail-value">{strategy.parameters.length}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Timeframes:</span>
                      <span className="detail-value">{strategy.timeframes.join(', ')}</span>
                    </div>
                  </div>
                  
                  <div className="strategy-indicators">
                    <h5 className="indicators-title">Required Indicators</h5>
                    <div className="indicators-list">
                      {strategy.requiredIndicators.map((ind, i) => (
                        <span key={i} className="indicator-chip required">{ind}</span>
                      ))}
                      {strategy.optionalIndicators.map((ind, i) => (
                        <span key={i} className="indicator-chip optional">{ind}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="strategy-tags">
                    {strategy.tags.map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    ))}
                  </div>
                  
                  <div className="strategy-actions">
                    <button 
                      onClick={() => setSelectedStrategy(strategy)} 
                      className="preview-btn"
                    >
                      📊 View Details
                    </button>
                    <button 
                      onClick={() => handleApplyStrategy(strategy)}
                      className="apply-strategy-btn"
                    >
                      ⚡ Use Strategy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="create-tab">
            <div className="create-options">
              <div className="create-option">
                <div className="option-icon">🤖</div>
                <h4 className="option-title">Create Custom Bot</h4>
                <p className="option-description">
                  Build your own trading bot from scratch with custom indicators and strategies
                </p>
                <button className="option-btn">Start Building</button>
              </div>
              
              <div className="create-option">
                <div className="option-icon">📊</div>
                <h4 className="option-title">Create Custom Strategy</h4>
                <p className="option-description">
                  Design a new trading strategy with custom entry/exit rules and risk management
                </p>
                <button className="option-btn">Create Strategy</button>
              </div>
              
              <div className="create-option">
                <div className="option-icon">🔧</div>
                <h4 className="option-title">Modify Existing</h4>
                <p className="option-description">
                  Take an existing template and customize it to fit your trading style
                </p>
                <button className="option-btn">Browse Templates</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="template-modal-overlay" onClick={() => setSelectedTemplate(null)}>
          <div className="template-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedTemplate.name}</h3>
              <button className="modal-close" onClick={() => setSelectedTemplate(null)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="tutorial-section">
                <h4 className="section-title">Overview</h4>
                <p>{selectedTemplate.tutorial.overview}</p>
              </div>
              
              <div className="tutorial-section">
                <h4 className="section-title">How It Works</h4>
                <p>{selectedTemplate.tutorial.howItWorks}</p>
              </div>
              
              <div className="tutorial-section">
                <h4 className="section-title">When to Use</h4>
                <p>{selectedTemplate.tutorial.whenToUse}</p>
              </div>
              
              <div className="tutorial-section">
                <h4 className="section-title">Risks</h4>
                <ul className="risk-list">
                  {selectedTemplate.tutorial.risks.map((risk, i) => (
                    <li key={i} className="risk-item">⚠️ {risk}</li>
                  ))}
                </ul>
              </div>
              
              <div className="tutorial-section">
                <h4 className="section-title">Tips for Success</h4>
                <ul className="tips-list">
                  {selectedTemplate.tutorial.tips.map((tip, i) => (
                    <li key={i} className="tip-item">💡 {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => handleApplyBotTemplate(selectedTemplate)}
                disabled={loading}
                className="apply-modal-btn"
              >
                {loading ? 'Applying...' : '🚀 Use This Bot'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strategy Detail Modal */}
      {selectedStrategy && (
        <div className="template-modal-overlay" onClick={() => setSelectedStrategy(null)}>
          <div className="template-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedStrategy.name}</h3>
              <button className="modal-close" onClick={() => setSelectedStrategy(null)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="strategy-details-section">
                <h4 className="section-title">Description</h4>
                <p>{selectedStrategy.description}</p>
              </div>
              
              <div className="strategy-details-section">
                <h4 className="section-title">Entry Rules</h4>
                <div className="rules-list">
                  {selectedStrategy.entryRules.map((rule, i) => (
                    <div key={i} className="rule-item">
                      <div className="rule-name">{rule.name}</div>
                      <div className="rule-condition">{rule.condition}</div>
                      <div className="rule-description">{rule.description}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="strategy-details-section">
                <h4 className="section-title">Exit Rules</h4>
                <div className="rules-list">
                  {selectedStrategy.exitRules.map((rule, i) => (
                    <div key={i} className="rule-item">
                      <div className="rule-name">{rule.name}</div>
                      <div className="rule-condition">{rule.condition}</div>
                      <div className="rule-description">{rule.description}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="strategy-details-section">
                <h4 className="section-title">Risk Management</h4>
                <div className="risk-details">
                  <div className="risk-item">
                    <span className="risk-label">Stop Loss:</span>
                    <span className="risk-value">
                      {selectedStrategy.riskManagement.stopLoss.enabled 
                        ? `${selectedStrategy.riskManagement.stopLoss.value}% (${selectedStrategy.riskManagement.stopLoss.type})`
                        : 'Disabled'
                      }
                    </span>
                  </div>
                  <div className="risk-item">
                    <span className="risk-label">Take Profit:</span>
                    <span className="risk-value">
                      {selectedStrategy.riskManagement.takeProfit.enabled 
                        ? `${selectedStrategy.riskManagement.takeProfit.value}% (${selectedStrategy.riskManagement.takeProfit.type})`
                        : 'Disabled'
                      }
                    </span>
                  </div>
                  <div className="risk-item">
                    <span className="risk-label">Position Size:</span>
                    <span className="risk-value">
                      {selectedStrategy.riskManagement.positionSizing.value}% (max: {selectedStrategy.riskManagement.positionSizing.maxPositionSize}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => handleApplyStrategy(selectedStrategy)}
                className="apply-modal-btn"
              >
                ⚡ Use This Strategy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyTemplatePanel;