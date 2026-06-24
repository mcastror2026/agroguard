import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { RiskCategory } from '../utils/riskCalculations';
import { Tooltip } from './Tooltip';

interface RiskIndicatorProps extends RiskCategory {
  title: string;
  tooltipText?: string;
}

interface RiskIndicatorPropsWithSeverity extends RiskIndicatorProps {
  severity?: 0 | 1 | 2 | 3 | 4;
}

export function RiskIndicator({ title, level, color, tip, tooltipText, severity }: RiskIndicatorPropsWithSeverity) {
  const getRiskIcon = () => {
    if (severity === 0 || severity === 1) {
      return <CheckCircle className="w-7 h-7 md:w-10 md:h-10" strokeWidth={1.5} />;
    } else if (severity === 2) {
      return <AlertCircle className="w-7 h-7 md:w-10 md:h-10" strokeWidth={1.5} />;
    }
    return <AlertTriangle className="w-7 h-7 md:w-10 md:h-10" strokeWidth={1.5} />;
  };

  const riskScore = severity ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl md:rounded-3xl p-4 md:p-6 border ${color} relative overflow-hidden bg-white`}
    >
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wide opacity-70 font-light mb-1 flex items-center gap-2">
              <span>{title}</span>
              {tooltipText && <Tooltip text={tooltipText} />}
            </div>
          </div>
          <div className="opacity-40">
            {getRiskIcon()}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-2xl sm:text-3xl md:text-4xl font-light mb-2 md:mb-3 leading-tight tracking-tight">
            {level}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-[10px] md:text-xs font-light opacity-50 uppercase tracking-wider">Nivel</div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((dot) => (
                <div
                  key={dot}
                  className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all ${
                    dot <= riskScore ? 'bg-current' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="text-xs md:text-sm opacity-70 leading-relaxed border-t border-gray-100 pt-3 font-light">
          {tip}
        </div>
      </div>
    </motion.div>
  );
}
