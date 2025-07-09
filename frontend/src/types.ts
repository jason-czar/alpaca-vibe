export type Indicator = {
  name: string;
  param: string;
  min: number;
  max: number;
  default: number;
  step?: number;
  custom?: boolean;
};

export type IndicatorState = {
  enabled: boolean;
  value: number;
}; 