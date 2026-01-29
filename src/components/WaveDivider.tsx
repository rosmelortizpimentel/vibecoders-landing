interface WaveDividerProps {
  fromColor?: string;
  toColor?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const WaveDivider = ({ 
  fromColor = '#3B82F6', 
  toColor = '#F6F5F4',
  className = '',
  size = 'md'
}: WaveDividerProps) => {
  const sizeClasses = {
    sm: 'h-[30px] sm:h-[40px] md:h-[50px]',
    md: 'h-[60px] sm:h-[80px] md:h-[100px]',
    lg: 'h-[80px] sm:h-[100px] md:h-[120px]',
  };

  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ backgroundColor: fromColor }}>
      <svg
        className={`relative block w-full ${sizeClasses[size]}`}
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,0 C300,100 900,20 1200,80 L1200,120 L0,120 Z"
          fill={toColor}
        />
      </svg>
    </div>
  );
};

export default WaveDivider;
