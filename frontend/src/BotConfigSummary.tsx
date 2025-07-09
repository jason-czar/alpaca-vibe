import React from 'react';
import type { Indicator, IndicatorState } from './types';

function BotConfigSummary({ indicators, indicatorStates }: { indicators: Indicator[], indicatorStates: IndicatorState[] }) {
  const enabled = indicators
    .map((ind, idx) => ({ ...ind, value: indicatorStates[idx]?.value, enabled: indicatorStates[idx]?.enabled }))
    .filter(ind => ind.enabled);
  if (enabled.length === 0) {
    return (
      <div className="bot-config-summary empty">
        <div className="config-title">Bot Configuration</div>
        <p>No indicators enabled yet. Toggle some indicators above to get started!</p>
      </div>
    );
  }
  
  return (
    <div className="bot-config-summary">
      <div className="config-title">Active Configuration</div>
      <ul className="config-list">
        {enabled.map((ind, i) => (
          <li key={ind.name + i} className="config-item">
            {ind.name} ({ind.param !== 'N/A' ? `${ind.param}: ${ind.value}` : 'No parameter'})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BotConfigSummary; 