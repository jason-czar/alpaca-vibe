export type IndicatorState = {
   enabled: boolean;
   value: number;
}; 

export type ChatMessage = {
  sender: 'user' | 'bot';
  text: string;
  timestamp?: Date;
  actions?: any[];