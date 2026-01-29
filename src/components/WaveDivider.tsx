interface WaveDividerProps {
  fromColor?: string;
  toColor?: string;
  className?: string;
}

const WaveDivider = ({ 
  fromColor = '#3B82F6', 
  toColor = '#F6F5F4',
  className = '' 
}: WaveDividerProps) => {
  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ backgroundColor: fromColor }}>
      <svg
        className="relative block w-full h-[60px] sm:h-[80px] md:h-[100px]"
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
