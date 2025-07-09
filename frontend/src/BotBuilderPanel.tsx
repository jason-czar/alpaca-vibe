import React, { useState } from 'react';
import type { Indicator, IndicatorState } from './types';
import BotConfigSummary from './BotConfigSummary';

function BotBuilderPanel({
  indicators,
  indicatorStates,
  setIndicators,
  setIndicatorStates,
  token,
  onAddIndicator,
  onRemoveIndicator,
  onToggle,
  onSlider,
}: {
  indicators: Indicator[],
  indicatorStates: IndicatorState[],
  setIndicators: React.Dispatch<React.SetStateAction<Indicator[]>>,
  setIndicatorStates: React.Dispatch<React.SetStateAction<IndicatorState[]>>,
  token: string | null,
  onAddIndicator: (indicator: any) => void,
  onRemoveIndicator: (name: string, idx: number) => void,
  onToggle: (idx: number) => void,
  onSlider: (idx: number, value: number) => void,
}) {
  const [addForm, setAddForm] = useState({
    name: '',
    param: '',
    min: '',
    max: '',
    defaultVal: '',
    step: '',
  });
  const [addError, setAddError] = useState('');

  const handleToggle = (idx: number) => {
    onToggle(idx);
  };

  const handleSlider = (idx: number, value: number) => {
    onSlider(idx, value);
  };

  const handleRemove = (idx: number) => {
    onRemoveIndicator(indicators[idx].name, idx);
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddForm(f => ({ ...f, [name]: value }));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    const { name, param, min, max, defaultVal, step } = addForm;
    if (!name || !param || !min || !max || !defaultVal) {
      setAddError('All fields except step are required.');
      return;
    }
    const minNum = Number(min), maxNum = Number(max), defNum = Number(defaultVal), stepNum = step ? Number(step) : 1;
    if (isNaN(minNum) || isNaN(maxNum) || isNaN(defNum) || (step && isNaN(stepNum))) {
      setAddError('Min, max, default, and step must be numbers.');
      return;
    }
    if (minNum >= maxNum) {
      setAddError('Min must be less than max.');
      return;
    }
    onAddIndicator({ name, param, min: minNum, max: maxNum, default: defNum, step: stepNum });
    setAddForm({ name: '', param: '', min: '', max: '', defaultVal: '', step: '' });
  };

  return (
    <section className="bot-builder-panel">
      <div className="panel-header">
        <h1 className="panel-title">Bot Builder</h1>
        <p className="panel-subtitle">Configure your trading indicators and parameters</p>
      </div>
      
      <BotConfigSummary indicators={indicators} indicatorStates={indicatorStates} />
      
      <div className="indicators-section">
        <div className="section-header">
          <h2 className="section-title">Active Indicators</h2>
          <span className="indicators-count">
            {indicatorStates.filter(state => state.enabled).length}
          </span>
        </div>
        
        <div className="indicators-list">
        {indicators.map((ind, idx) => (
          <div 
            key={ind.name + idx} 
            className={`indicator-card ${indicatorStates[idx]?.enabled ? 'enabled' : ''}`}
          >
            <div className="indicator-header">
              <div className="indicator-toggle" onClick={() => handleToggle(idx)}>
                <div className={`toggle-switch ${indicatorStates[idx]?.enabled ? 'active' : ''}`}></div>
                <span className="indicator-name">{ind.name}</span>
              </div>
              <button 
                className="remove-btn" 
                onClick={() => handleRemove(idx)}
                title="Remove indicator"
              >
                ×
              </button>
            </div>
            
            {ind.param !== 'N/A' && (
              <div className="indicator-controls">
                <div className="slider-container">
                  <span className="slider-label">{ind.param}</span>
                  <input
                    type="range"
                    min={ind.min}
                    max={ind.max}
                    step={ind.step || 1}
                    value={indicatorStates[idx]?.value}
                    disabled={!indicatorStates[idx]?.enabled}
                    onChange={e => handleSlider(idx, Number(e.target.value))}
                    className="indicator-slider"
                  />
                  <span className="slider-value">{indicatorStates[idx]?.value}</span>
                </div>
              </div>
            )}
          </div>
        ))}
        </div>
        
        <form className="add-indicator-form" onSubmit={handleAdd} aria-label="Add Custom Indicator">
          <h3 className="form-title">Add Custom Indicator</h3>
          <div className="form-grid">
            <input 
              name="name" 
              placeholder="Indicator Name" 
              value={addForm.name} 
              onChange={handleAddChange} 
              required 
              className="form-input"
            />
            <input 
              name="param" 
              placeholder="Parameter" 
              value={addForm.param} 
              onChange={handleAddChange} 
              required 
              className="form-input"
            />
            <input 
              name="min" 
              placeholder="Min Value" 
              value={addForm.min} 
              onChange={handleAddChange} 
              required 
              type="number" 
              className="form-input"
            />
            <input 
              name="max" 
              placeholder="Max Value" 
              value={addForm.max} 
              onChange={handleAddChange} 
              required 
              type="number" 
              className="form-input"
            />
            <input 
              name="defaultVal" 
              placeholder="Default Value" 
              value={addForm.defaultVal} 
              onChange={handleAddChange} 
              required 
              type="number" 
              className="form-input"
            />
            <input 
              name="step" 
              placeholder="Step (optional)" 
              value={addForm.step} 
              onChange={handleAddChange} 
              type="number" 
              className="form-input"
            />
          </div>
          <button type="submit" className="add-btn">Add Indicator</button>
          {addError && <div className="add-error" aria-live="polite">{addError}</div>}
          {addError && <div className="form-error">{addError}</div>}
        </form>
      </div>
    </section>
  );
}

export default BotBuilderPanel; 