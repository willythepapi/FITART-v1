import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface SimpleLineChartProps {
  data: number[];
  width: number;
  height: number;
  color?: string;
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ data, width, height, color = "#7FB7FF" }) => {
  if (!data || data.length < 2) {
    return <View style={{ width, height }} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min; // Avoid division by zero

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 5); // -5 for some padding
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
            <LinearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <Stop offset="100%" stopColor={color} stopOpacity="1" />
            </LinearGradient>
        </Defs>
        <Path d={pathData} stroke="url(#gradient)" strokeWidth={2.5} fill="none" />
      </Svg>
    </View>
  );
};

export default SimpleLineChart;
