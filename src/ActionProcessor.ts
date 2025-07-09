export interface ActionResult {
  success: boolean;
  action: string;
  details: string;
  data?: any;
}

export interface ParsedCommand {
  type: 'enable_indicator' | 'disable_indicator' | 'set_parameter' | 'add_indicator' | 'remove_indicator' | 'unknown';
  indicator?: string;
  parameter?: string;
  value?: number;
  data?: any;
}

export class ActionProcessor {
  private indicators: any[];
  private indicatorStates: any[];
  private setIndicatorStates: (states: any[]) => void;
  private setIndicators: (indicators: any[]) => void;

  constructor(
    indicators: any[],
    indicatorStates: any[],
    setIndicatorStates: (states: any[]) => void,
    setIndicators: (indicators: any[]) => void
  ) {
    this.indicators = indicators;
    this.indicatorStates = indicatorStates;
    this.setIndicatorStates = setIndicatorStates;
    this.setIndicators = setIndicators;
  }

  parseCommand(message: string): ParsedCommand {
    const lowerMessage = message.toLowerCase();

    // Enable indicator patterns
    if (lowerMessage.includes('enable') || lowerMessage.includes('turn on') || lowerMessage.includes('activate')) {
      const indicator = this.extractIndicatorName(message);
      if (indicator) {
        return { type: 'enable_indicator', indicator };
      }
    }

    // Disable indicator patterns
    if (lowerMessage.includes('disable') || lowerMessage.includes('turn off') || lowerMessage.includes('deactivate')) {
      const indicator = this.extractIndicatorName(message);
      if (indicator) {
        return { type: 'disable_indicator', indicator };
      }
    }

    // Set parameter patterns
    if (lowerMessage.includes('set') || lowerMessage.includes('change') || lowerMessage.includes('adjust')) {
      const indicator = this.extractIndicatorName(message);
      const value = this.extractNumber(message);
      if (indicator && value !== null) {
        return { type: 'set_parameter', indicator, value };
      }
    }

    // Add indicator patterns
    if (lowerMessage.includes('add') && (lowerMessage.includes('indicator') || lowerMessage.includes('rsi') || lowerMessage.includes('macd'))) {
      const indicator = this.extractIndicatorName(message);
      if (indicator) {
        return { type: 'add_indicator', indicator };
      }
    }

    // Remove indicator patterns
    if (lowerMessage.includes('remove') || lowerMessage.includes('delete')) {
      const indicator = this.extractIndicatorName(message);
      if (indicator) {
        return { type: 'remove_indicator', indicator };
      }
    }

    return { type: 'unknown' };
  }

  private extractIndicatorName(message: string): string | null {
    const indicators = [
      'rsi', 'relative strength index',
      'macd', 'moving average convergence divergence',
      'sma', 'simple moving average',
      'ema', 'exponential moving average',
      'bollinger bands', 'bollinger',
      'stochastic', 'stochastic oscillator',
      'atr', 'average true range',
      'cci', 'commodity channel index',
      'roc', 'rate of change',
      'williams', 'williams %r',
      'parabolic sar', 'sar',
      'ichimoku', 'ichimoku cloud',
      'vwap', 'volume weighted average price',
      'pivot points', 'pivot',
      'donchian', 'donchian channel',
      'keltner', 'keltner channel'
    ];

    const lowerMessage = message.toLowerCase();
    
    for (const indicator of indicators) {
      if (lowerMessage.includes(indicator)) {
        // Find the full indicator name from our indicators array
        const found = this.indicators.find(ind => 
          ind.name.toLowerCase().includes(indicator) || 
          indicator.includes(ind.name.toLowerCase().split(' ')[0])
        );
        return found ? found.name : null;
      }
    }

    return null;
  }

  private extractNumber(message: string): number | null {
    const numbers = message.match(/\b\d+(\.\d+)?\b/g);
    if (numbers && numbers.length > 0) {
      return parseFloat(numbers[numbers.length - 1]); // Take the last number found
    }
    return null;
  }

  executeCommand(command: ParsedCommand): ActionResult {
    try {
      switch (command.type) {
        case 'enable_indicator':
          return this.enableIndicator(command.indicator!);
        
        case 'disable_indicator':
          return this.disableIndicator(command.indicator!);
        
        case 'set_parameter':
          return this.setParameter(command.indicator!, command.value!);
        
        case 'add_indicator':
          return this.addIndicator(command.indicator!);
        
        case 'remove_indicator':
          return this.removeIndicator(command.indicator!);
        
        default:
          return {
            success: false,
            action: 'Unknown Command',
            details: 'I didn\'t understand that command. Try commands like "enable RSI", "set MACD period to 20", or "disable Bollinger Bands".'
          };
      }
    } catch (error) {
      return {
        success: false,
        action: 'Error',
        details: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private enableIndicator(indicatorName: string): ActionResult {
    const index = this.indicators.findIndex(ind => 
      ind.name.toLowerCase().includes(indicatorName.toLowerCase()) ||
      indicatorName.toLowerCase().includes(ind.name.toLowerCase().split(' ')[0])
    );

    if (index === -1) {
      return {
        success: false,
        action: 'Enable Indicator',
        details: `Indicator "${indicatorName}" not found. Available indicators: ${this.indicators.map(i => i.name).join(', ')}`
      };
    }

    const newStates = [...this.indicatorStates];
    newStates[index] = { ...newStates[index], enabled: true };
    this.setIndicatorStates(newStates);

    return {
      success: true,
      action: 'Enable Indicator',
      details: `✅ Enabled ${this.indicators[index].name} with ${this.indicators[index].param}: ${newStates[index].value}`,
      data: { indicator: this.indicators[index], state: newStates[index] }
    };
  }

  private disableIndicator(indicatorName: string): ActionResult {
    const index = this.indicators.findIndex(ind => 
      ind.name.toLowerCase().includes(indicatorName.toLowerCase()) ||
      indicatorName.toLowerCase().includes(ind.name.toLowerCase().split(' ')[0])
    );

    if (index === -1) {
      return {
        success: false,
        action: 'Disable Indicator',
        details: `Indicator "${indicatorName}" not found.`
      };
    }

    const newStates = [...this.indicatorStates];
    newStates[index] = { ...newStates[index], enabled: false };
    this.setIndicatorStates(newStates);

    return {
      success: true,
      action: 'Disable Indicator',
      details: `❌ Disabled ${this.indicators[index].name}`,
      data: { indicator: this.indicators[index], state: newStates[index] }
    };
  }

  private setParameter(indicatorName: string, value: number): ActionResult {
    const index = this.indicators.findIndex(ind => 
      ind.name.toLowerCase().includes(indicatorName.toLowerCase()) ||
      indicatorName.toLowerCase().includes(ind.name.toLowerCase().split(' ')[0])
    );

    if (index === -1) {
      return {
        success: false,
        action: 'Set Parameter',
        details: `Indicator "${indicatorName}" not found.`
      };
    }

    const indicator = this.indicators[index];
    
    // Validate value is within bounds
    if (value < indicator.min || value > indicator.max) {
      return {
        success: false,
        action: 'Set Parameter',
        details: `Value ${value} is out of range for ${indicator.name}. Valid range: ${indicator.min} - ${indicator.max}`
      };
    }

    const newStates = [...this.indicatorStates];
    newStates[index] = { ...newStates[index], value };
    this.setIndicatorStates(newStates);

    return {
      success: true,
      action: 'Set Parameter',
      details: `🔧 Set ${indicator.name} ${indicator.param} to ${value}`,
      data: { indicator, state: newStates[index] }
    };
  }

  private addIndicator(indicatorName: string): ActionResult {
    // Check if indicator already exists
    const exists = this.indicators.some(ind => 
      ind.name.toLowerCase().includes(indicatorName.toLowerCase())
    );

    if (exists) {
      return {
        success: false,
        action: 'Add Indicator',
        details: `Indicator "${indicatorName}" already exists in your configuration.`
      };
    }

    return {
      success: false,
      action: 'Add Indicator',
      details: `Adding custom indicators is not yet implemented. You can enable existing indicators instead.`
    };
  }

  private removeIndicator(indicatorName: string): ActionResult {
    const index = this.indicators.findIndex(ind => 
      ind.name.toLowerCase().includes(indicatorName.toLowerCase()) ||
      indicatorName.toLowerCase().includes(ind.name.toLowerCase().split(' ')[0])
    );

    if (index === -1) {
      return {
        success: false,
        action: 'Remove Indicator',
        details: `Indicator "${indicatorName}" not found.`
      };
    }

    return {
      success: false,
      action: 'Remove Indicator',
      details: `Removing indicators is not yet implemented. You can disable them instead.`
    };
  }

  processMessage(message: string): { response: string; actions: ActionResult[] } {
    const command = this.parseCommand(message);
    const actionResult = this.executeCommand(command);
    
    let response = '';
    
    if (actionResult.success) {
      response = `I've successfully ${actionResult.action.toLowerCase()}! ${actionResult.details}`;
      
      // Add contextual information
      if (command.type === 'enable_indicator' || command.type === 'set_parameter') {
        const enabledCount = this.indicatorStates.filter(state => state.enabled).length;
        response += `\n\nYou now have ${enabledCount} active indicator${enabledCount !== 1 ? 's' : ''} in your trading bot configuration.`;
      }
    } else {
      response = `I couldn't complete that action. ${actionResult.details}`;
      
      // Provide helpful suggestions
      if (command.type === 'unknown') {
        response += '\n\nTry commands like:\n• "Enable RSI"\n• "Set MACD period to 20"\n• "Disable Bollinger Bands"\n• "Change SMA to 50"';
      }
    }

    return {
      response,
      actions: [actionResult]
    };
  }
}