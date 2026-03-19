import type React from 'react';
import PizzaVisual from './PizzaVisual';
import ScaleVisual from './ScaleVisual';
import RiskChartsVisual from './RiskChartsVisual';
import TimeChartVisual from './TimeChartVisual';
import CrashVisual from './CrashVisual';

export const visualRegistry: Record<string, React.ComponentType<{ onNext: () => void }>> = {
  pizza: PizzaVisual,
  scale: ScaleVisual,
  riskCharts: RiskChartsVisual,
  timeChart: TimeChartVisual,
  crash: CrashVisual,
};
