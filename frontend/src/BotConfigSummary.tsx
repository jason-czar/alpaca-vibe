import React from 'react';
import type { Indicator, IndicatorState } from './types';

function BotConfigSummary({ indicators, indicatorStates }: { indicators: Indicator[], indicatorStates: IndicatorState[] }) {
  const enabled = indicators
    .map((ind, idx) => ({ ...ind, value: indicatorStates[idx]?.value, enabled: indicatorStates[idx]?.enabled }))
    .filter(ind => ind.enabled);
  if (enabled.length === 0) {
    return <div className="bot-config-summary empty">No indicators enabled yet.</div>;
  }
  return (
    <div className="bot-config-summary">
      <strong>Current Bot Configuration:</strong>
      <ul>
        {enabled.map((ind, i) => (
          <li key={ind.name + i}>
            {ind.name} ({ind.param !== 'N/A' ? `${ind.param}: ${ind.value}` : 'No parameter'})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BotConfigSummary; 