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
    <section className="bot-builder-panel" aria-label="Bot Builder Panel">
      <BotConfigSummary indicators={indicators} indicatorStates={indicatorStates} />
      <h2 tabIndex={0}>Bot Builder</h2>
      <div className="indicators-list" role="list" aria-label="Indicators List">
        {indicators.map((ind, idx) => (
          <div key={ind.name + idx} className="indicator-row" role="listitem">
            <label>
              <input
                type="checkbox"
                checked={indicatorStates[idx]?.enabled}
                onChange={() => handleToggle(idx)}
                aria-checked={indicatorStates[idx]?.enabled}
                aria-label={`Toggle ${ind.name}`}
                tabIndex={0}
              />
              <span className="indicator-name">{ind.name}</span>
            </label>
            {ind.param !== 'N/A' && (
              <input
                type="range"
                min={ind.min}
                max={ind.max}
                step={ind.step || 1}
                value={indicatorStates[idx]?.value}
                disabled={!indicatorStates[idx]?.enabled}
                onChange={e => handleSlider(idx, Number(e.target.value))}
                className="indicator-slider"
                aria-label={`${ind.name} ${ind.param} slider`}
                tabIndex={0}
              />
            )}
            {ind.param !== 'N/A' && (
              <span className="indicator-param">
                {ind.param}: {indicatorStates[idx]?.value}
              </span>
            )}
            <button className="remove-indicator-btn" onClick={() => handleRemove(idx)} title="Remove indicator" aria-label={`Remove ${ind.name}`} tabIndex={0}>✕</button>
          </div>
        ))}
        <form className="add-indicator-form" onSubmit={handleAdd} aria-label="Add Custom Indicator">
          <h4 tabIndex={0}>Add Custom Indicator</h4>
          <div className="add-fields">
            <input name="name" placeholder="Name" value={addForm.name} onChange={handleAddChange} required aria-label="Indicator Name" tabIndex={0} />
            <input name="param" placeholder="Parameter" value={addForm.param} onChange={handleAddChange} required aria-label="Parameter" tabIndex={0} />
            <input name="min" placeholder="Min" value={addForm.min} onChange={handleAddChange} required type="number" aria-label="Min" tabIndex={0} />
            <input name="max" placeholder="Max" value={addForm.max} onChange={handleAddChange} required type="number" aria-label="Max" tabIndex={0} />
            <input name="defaultVal" placeholder="Default" value={addForm.defaultVal} onChange={handleAddChange} required type="number" aria-label="Default" tabIndex={0} />
            <input name="step" placeholder="Step (opt)" value={addForm.step} onChange={handleAddChange} type="number" aria-label="Step" tabIndex={0} />
            <button type="submit" tabIndex={0}>Add</button>
          </div>
          {addError && <div className="add-error" aria-live="polite">{addError}</div>}
        </form>
      </div>
    </section>
  );
}

export default BotBuilderPanel; 