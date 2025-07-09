import React, { useState, useEffect } from 'react';
import { getIndicatorBuilder, CustomIndicator, IndicatorParameter } from './IndicatorBuilder';

interface CustomIndicatorPanelProps {
  onIndicatorCreated: (indicator: CustomIndicator) => void;
  onClose: () => void;
}

const CustomIndicatorPanel: React.FC<CustomIndicatorPanelProps> = ({ onIndicatorCreated, onClose }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'library' | 'templates'>('create');
  const [indicators, setIndicators] = useState<CustomIndicator[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<CustomIndicator | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Create form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    formula: '',
    category: 'custom' as CustomIndicator['category'],
    tags: ''
  });
  
  const [parameters, setParameters] = useState<IndicatorParameter[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const indicatorBuilder = getIndicatorBuilder();

  useEffect(() => {
    loadIndicators();
  }, []);

  const loadIndicators = () => {
    setIndicators(indicatorBuilder.getAllIndicators());
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const addParameter = () => {
    const newParam: IndicatorParameter = {
      name: '',
      type: 'number',
      defaultValue: 0,
      description: '',
      required: true
    };
    setParameters(prev => [...prev, newParam]);
  };

  const updateParameter = (index: number, field: string, value: any) => {
    setParameters(prev => prev.map((param, i) => 
      i === index ? { ...param, [field]: value } : param
    ));
  };

  const removeParameter = (index: number) => {
    setParameters(prev => prev.filter((_, i) => i !== index));
  };

  const validateFormula = () => {
    if (!formData.formula.trim()) {
      setValidationResult({ isValid: false, errors: ['Formula cannot be empty'] });
      return;
    }

    setLoading(true);
    
    // Simulate validation delay
    setTimeout(() => {
      const result = indicatorBuilder['validateIndicator'](formData.formula, parameters);
      setValidationResult(result);
      setLoading(false);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.formula.trim()) {
      setError('Name and formula are required');
      return;
    }

    setLoading(true);
    setError(null);

    const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const result = indicatorBuilder.createIndicator(
      formData.name,
      formData.description,
      formData.formula,
      parameters,
      formData.category,
      tags
    );

    if (result.success && result.indicator) {
      onIndicatorCreated(result.indicator);
      loadIndicators();
      resetForm();
      setActiveTab('library');
    } else {
      setError(result.errors.join(', '));
    }

    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      formula: '',
      category: 'custom',
      tags: ''
    });
    setParameters([]);
    setValidationResult(null);
    setError(null);
  };

  const handleEdit = (indicator: CustomIndicator) => {
    setFormData({
      name: indicator.name,
      description: indicator.description,
      formula: indicator.formula,
      category: indicator.category,
      tags: indicator.tags.join(', ')
    });
    setParameters([...indicator.parameters]);
    setSelectedIndicator(indicator);
    setIsEditing(true);
    setActiveTab('create');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this indicator?')) {
      indicatorBuilder.deleteIndicator(id);
      loadIndicators();
    }
  };

  const loadTemplate = (template: any) => {
    setFormData({
      name: template.name,
      description: template.description,
      formula: template.formula,
      category: template.category,
      tags: template.tags.join(', ')
    });
    setParameters([...template.parameters]);
    setActiveTab('create');
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'positive';
      case 'medium': return 'warning';
      case 'high': return 'negative';
      default: return '';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trend': return '📈';
      case 'momentum': return '⚡';
      case 'volatility': return '📊';
      case 'volume': return '📦';
      default: return '🔧';
    }
  };

  const templates = [
    {
      name: 'Simple Moving Average Crossover',
      description: 'Detects when fast MA crosses above/below slow MA',
      category: 'trend',
      tags: ['sma', 'crossover', 'trend'],
      formula: `fast_ma = SMA(CLOSE, fast_period)
slow_ma = SMA(CLOSE, slow_period)

crossover = IF(AND(fast_ma > slow_ma, fast_ma[1] <= slow_ma[1]), 1, 0)
crossunder = IF(AND(fast_ma < slow_ma, fast_ma[1] >= slow_ma[1]), -1, 0)

RETURN crossover + crossunder`,
      parameters: [
        { name: 'fast_period', type: 'integer', defaultValue: 10, min: 2, max: 50, description: 'Fast MA period', required: true },
        { name: 'slow_period', type: 'integer', defaultValue: 20, min: 5, max: 100, description: 'Slow MA period', required: true }
      ]
    },
    {
      name: 'Bollinger Band Squeeze',
      description: 'Detects when Bollinger Bands contract indicating low volatility',
      category: 'volatility',
      tags: ['bollinger', 'squeeze', 'volatility'],
      formula: `sma = SMA(CLOSE, period)
std_dev = STDEV(CLOSE, period)
upper_band = sma + (std_dev * multiplier)
lower_band = sma - (std_dev * multiplier)

band_width = (upper_band - lower_band) / sma * 100
avg_width = SMA(band_width, squeeze_period)

squeeze = IF(band_width < avg_width * squeeze_threshold, 1, 0)

RETURN squeeze`,
      parameters: [
        { name: 'period', type: 'integer', defaultValue: 20, min: 5, max: 50, description: 'BB period', required: true },
        { name: 'multiplier', type: 'number', defaultValue: 2.0, min: 1.0, max: 3.0, step: 0.1, description: 'BB multiplier', required: true },
        { name: 'squeeze_period', type: 'integer', defaultValue: 20, min: 5, max: 50, description: 'Squeeze detection period', required: true },
        { name: 'squeeze_threshold', type: 'number', defaultValue: 0.8, min: 0.5, max: 1.0, step: 0.1, description: 'Squeeze threshold', required: true }
      ]
    },
    {
      name: 'Volume-Weighted Momentum',
      description: 'Momentum indicator weighted by volume for better accuracy',
      category: 'momentum',
      tags: ['volume', 'momentum', 'weighted'],
      formula: `price_change = CLOSE - CLOSE[momentum_period]
volume_weighted_change = price_change * VOLUME
avg_volume = SMA(VOLUME, volume_period)

momentum = volume_weighted_change / avg_volume
smoothed_momentum = EMA(momentum, smoothing_period)

normalized = (smoothed_momentum - MIN(smoothed_momentum, normalization_period)) / 
            (MAX(smoothed_momentum, normalization_period) - MIN(smoothed_momentum, normalization_period)) * 100

RETURN normalized`,
      parameters: [
        { name: 'momentum_period', type: 'integer', defaultValue: 10, min: 1, max: 30, description: 'Momentum lookback', required: true },
        { name: 'volume_period', type: 'integer', defaultValue: 20, min: 5, max: 50, description: 'Volume average period', required: true },
        { name: 'smoothing_period', type: 'integer', defaultValue: 5, min: 2, max: 20, description: 'Smoothing period', required: true },
        { name: 'normalization_period', type: 'integer', defaultValue: 50, min: 20, max: 200, description: 'Normalization period', required: true }
      ]
    }
  ];

  return (
    <div className="custom-indicator-panel">
      <div className="panel-header">
        <h2 className="panel-title">Custom Indicator Builder</h2>
        <p className="panel-subtitle">Create and manage your own technical indicators</p>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      {/* Navigation Tabs */}
      <div className="indicator-tabs">
        <button 
          className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          🔧 Create
        </button>
        <button 
          className={`tab-button ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveTab('library')}
        >
          📚 Library ({indicators.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          📋 Templates
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'create' && (
          <div className="create-tab">
            <form onSubmit={handleSubmit} className="indicator-form">
              {/* Basic Information */}
              <div className="form-section">
                <h3 className="section-title">Basic Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="form-input"
                      placeholder="My Custom Indicator"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleFormChange('category', e.target.value)}
                      className="form-select"
                    >
                      <option value="custom">Custom</option>
                      <option value="trend">Trend</option>
                      <option value="momentum">Momentum</option>
                      <option value="volatility">Volatility</option>
                      <option value="volume">Volume</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="form-textarea"
                    placeholder="Describe what your indicator does and how it works..."
                    rows={3}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleFormChange('tags', e.target.value)}
                    className="form-input"
                    placeholder="rsi, momentum, overbought"
                  />
                </div>
              </div>

              {/* Parameters */}
              <div className="form-section">
                <div className="section-header">
                  <h3 className="section-title">Parameters</h3>
                  <button type="button" onClick={addParameter} className="add-param-btn">
                    + Add Parameter
                  </button>
                </div>
                
                {parameters.length === 0 ? (
                  <div className="no-parameters">
                    No parameters defined. Add parameters to make your indicator configurable.
                  </div>
                ) : (
                  <div className="parameters-list">
                    {parameters.map((param, index) => (
                      <div key={index} className="parameter-card">
                        <div className="param-header">
                          <input
                            type="text"
                            value={param.name}
                            onChange={(e) => updateParameter(index, 'name', e.target.value)}
                            className="param-name-input"
                            placeholder="Parameter name"
                          />
                          <select
                            value={param.type}
                            onChange={(e) => updateParameter(index, 'type', e.target.value)}
                            className="param-type-select"
                          >
                            <option value="number">Number</option>
                            <option value="integer">Integer</option>
                            <option value="boolean">Boolean</option>
                            <option value="select">Select</option>
                          </select>
                          <button 
                            type="button" 
                            onClick={() => removeParameter(index)}
                            className="remove-param-btn"
                          >
                            ×
                          </button>
                        </div>
                        
                        <div className="param-details">
                          <div className="param-row">
                            <label>Default Value:</label>
                            <input
                              type={param.type === 'integer' ? 'number' : 'text'}
                              value={param.defaultValue}
                              onChange={(e) => updateParameter(index, 'defaultValue', 
                                param.type === 'integer' ? parseInt(e.target.value) || 0 : 
                                param.type === 'number' ? parseFloat(e.target.value) || 0 : 
                                e.target.value
                              )}
                              className="param-input"
                            />
                          </div>
                          
                          {(param.type === 'number' || param.type === 'integer') && (
                            <>
                              <div className="param-row">
                                <label>Min:</label>
                                <input
                                  type="number"
                                  value={param.min || ''}
                                  onChange={(e) => updateParameter(index, 'min', parseFloat(e.target.value))}
                                  className="param-input"
                                />
                              </div>
                              <div className="param-row">
                                <label>Max:</label>
                                <input
                                  type="number"
                                  value={param.max || ''}
                                  onChange={(e) => updateParameter(index, 'max', parseFloat(e.target.value))}
                                  className="param-input"
                                />
                              </div>
                            </>
                          )}
                          
                          <div className="param-row full-width">
                            <label>Description:</label>
                            <input
                              type="text"
                              value={param.description}
                              onChange={(e) => updateParameter(index, 'description', e.target.value)}
                              className="param-input"
                              placeholder="Parameter description"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Formula Editor */}
              <div className="form-section">
                <div className="section-header">
                  <h3 className="section-title">Formula *</h3>
                  <button type="button" onClick={validateFormula} className="validate-btn">
                    🔍 Validate
                  </button>
                </div>
                
                <div className="formula-editor">
                  <textarea
                    value={formData.formula}
                    onChange={(e) => handleFormChange('formula', e.target.value)}
                    className="formula-textarea"
                    placeholder={`Enter your formula here...

Example:
sma_fast = SMA(CLOSE, fast_period)
sma_slow = SMA(CLOSE, slow_period)
signal = IF(sma_fast > sma_slow, 1, -1)

RETURN signal`}
                    rows={12}
                    required
                  />
                  
                  <div className="formula-help">
                    <h4>Available Functions:</h4>
                    <div className="function-list">
                      <span className="function-tag">SMA(values, period)</span>
                      <span className="function-tag">EMA(values, period)</span>
                      <span className="function-tag">RSI(values, period)</span>
                      <span className="function-tag">MACD(values, fast, slow)</span>
                      <span className="function-tag">STDEV(values, period)</span>
                      <span className="function-tag">MAX(values, period)</span>
                      <span className="function-tag">MIN(values, period)</span>
                      <span className="function-tag">IF(condition, true_val, false_val)</span>
                      <span className="function-tag">AND(...conditions)</span>
                      <span className="function-tag">OR(...conditions)</span>
                    </div>
                    
                    <h4>Price Variables:</h4>
                    <div className="function-list">
                      <span className="function-tag">OPEN</span>
                      <span className="function-tag">HIGH</span>
                      <span className="function-tag">LOW</span>
                      <span className="function-tag">CLOSE</span>
                      <span className="function-tag">VOLUME</span>
                      <span className="function-tag">TYPICAL</span>
                    </div>
                  </div>
                </div>
                
                {/* Validation Results */}
                {validationResult && (
                  <div className={`validation-result ${validationResult.isValid ? 'valid' : 'invalid'}`}>
                    <div className="validation-header">
                      <span className={`validation-status ${validationResult.isValid ? 'success' : 'error'}`}>
                        {validationResult.isValid ? '✅ Valid' : '❌ Invalid'}
                      </span>
                      <span className={`complexity-badge ${getComplexityColor(validationResult.complexity)}`}>
                        {validationResult.complexity} complexity
                      </span>
                      <span className="performance-info">
                        ~{validationResult.estimatedPerformance} ops/bar
                      </span>
                    </div>
                    
                    {validationResult.errors.length > 0 && (
                      <div className="validation-errors">
                        <h5>Errors:</h5>
                        <ul>
                          {validationResult.errors.map((error: string, i: number) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {validationResult.warnings.length > 0 && (
                      <div className="validation-warnings">
                        <h5>Warnings:</h5>
                        <ul>
                          {validationResult.warnings.map((warning: string, i: number) => (
                            <li key={i}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="form-actions">
                {isEditing && (
                  <button type="button" onClick={resetForm} className="cancel-btn">
                    Cancel
                  </button>
                )}
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? 'Creating...' : isEditing ? 'Update Indicator' : 'Create Indicator'}
                </button>
              </div>
              
              {error && <div className="form-error">{error}</div>}
            </form>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="library-tab">
            <div className="library-header">
              <h3 className="section-title">Your Custom Indicators</h3>
              <div className="library-stats">
                <span className="stat">Total: {indicators.length}</span>
                <span className="stat">Public: {indicators.filter(i => i.isPublic).length}</span>
              </div>
            </div>
            
            {indicators.length === 0 ? (
              <div className="empty-library">
                <div className="empty-icon">📊</div>
                <h4>No Custom Indicators Yet</h4>
                <p>Create your first custom indicator to get started with advanced technical analysis.</p>
                <button onClick={() => setActiveTab('create')} className="create-first-btn">
                  Create Your First Indicator
                </button>
              </div>
            ) : (
              <div className="indicators-grid">
                {indicators.map((indicator) => (
                  <div key={indicator.id} className="indicator-card">
                    <div className="card-header">
                      <div className="indicator-info">
                        <span className="category-icon">{getCategoryIcon(indicator.category)}</span>
                        <div>
                          <h4 className="indicator-name">{indicator.name}</h4>
                          <p className="indicator-category">{indicator.category}</p>
                        </div>
                      </div>
                      <div className="card-actions">
                        <button onClick={() => handleEdit(indicator)} className="edit-btn" title="Edit">
                          ✏️
                        </button>
                        <button onClick={() => handleDelete(indicator.id)} className="delete-btn" title="Delete">
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <p className="indicator-description">{indicator.description}</p>
                    
                    <div className="indicator-meta">
                      <div className="meta-row">
                        <span className="meta-label">Parameters:</span>
                        <span className="meta-value">{indicator.parameters.length}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">Complexity:</span>
                        <span className={`meta-value ${getComplexityColor(indicator.validation.complexity)}`}>
                          {indicator.validation.complexity}
                        </span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">Created:</span>
                        <span className="meta-value">{indicator.created.toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {indicator.tags.length > 0 && (
                      <div className="indicator-tags">
                        {indicator.tags.map((tag, i) => (
                          <span key={i} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    
                    <div className="card-footer">
                      <button 
                        onClick={() => onIndicatorCreated(indicator)} 
                        className="use-indicator-btn"
                      >
                        Use Indicator
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="templates-tab">
            <div className="templates-header">
              <h3 className="section-title">Indicator Templates</h3>
              <p className="templates-subtitle">Start with these pre-built templates and customize them</p>
            </div>
            
            <div className="templates-grid">
              {templates.map((template, index) => (
                <div key={index} className="template-card">
                  <div className="template-header">
                    <span className="category-icon">{getCategoryIcon(template.category)}</span>
                    <div>
                      <h4 className="template-name">{template.name}</h4>
                      <p className="template-category">{template.category}</p>
                    </div>
                  </div>
                  
                  <p className="template-description">{template.description}</p>
                  
                  <div className="template-meta">
                    <div className="meta-row">
                      <span className="meta-label">Parameters:</span>
                      <span className="meta-value">{template.parameters.length}</span>
                    </div>
                  </div>
                  
                  <div className="template-tags">
                    {template.tags.map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    ))}
                  </div>
                  
                  <div className="template-footer">
                    <button 
                      onClick={() => loadTemplate(template)} 
                      className="use-template-btn"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomIndicatorPanel;