import { motion } from 'framer-motion';
import { FiTrendingUp, FiAlertTriangle, FiClock, FiPieChart } from 'react-icons/fi';
import { pageVariants } from './LessonShared';
import { IconType } from 'react-icons';

const iconMap: Record<string, IconType> = {
  TrendUp: FiTrendingUp,
  Warning: FiAlertTriangle,
  Clock: FiClock,
  ChartPie: FiPieChart,
};

interface Props {
  title: string;
  subtitle: string;
  iconName: string;
  iconColor: string;
  iconBgColor: string;
  mainText: string;
  secondaryText: string;
  onNext: () => void;
}

const ExplanationStep = ({
  title,
  subtitle,
  iconName,
  iconColor,
  iconBgColor,
  mainText,
  secondaryText,
  onNext,
}: Props) => {
  const IconComp = iconMap[iconName] ?? FiTrendingUp;

  return (
    <motion.div
      key="explanation"
      variants={pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="flex-1 flex flex-col px-6 pb-8"
    >
      {/* Header */}
      <div className="text-center mb-8 mt-2">
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: iconBgColor }}
        >
          <IconComp size={34} style={{ color: iconColor }} />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground text-sm mt-1 font-body">{subtitle}</p>
      </div>

      {/* Text */}
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <p className="text-foreground text-lg leading-relaxed font-body">{mainText}</p>
        <p className="text-muted-foreground text-[15px] leading-relaxed font-body mt-5">
          {secondaryText}
        </p>
      </div>

      {/* CTA */}
      <div className="max-w-sm mx-auto w-full mt-6">
        <motion.button
          onClick={onNext}
          whileTap={{ scale: 0.96 }}
          className="w-full h-14 rounded-full bg-primary text-primary-foreground font-display font-bold text-base shadow-soft"
        >
          Continue
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ExplanationStep;
