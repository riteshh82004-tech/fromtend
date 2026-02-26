import React, { useEffect, useRef } from "react";
import { useDeviceStore } from "../../store/deviceStore";

interface WaveformProps {
  color?: string;
  height?: number;
  width?: number;
  animated?: boolean;
  showGrid?: boolean;
  samples?: number[]; // Optional: if provided, use these samples instead of device store
}

export const Waveform: React.FC<WaveformProps> = ({
  color = "#ef4444",
  height = 200,
  width = 800,
  animated = true,
  showGrid = true,
  samples: propSamples,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const deviceStore = useDeviceStore();
  const ecgData = propSamples || deviceStore.ecgData;
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawWaveform = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw grid (medical ECG style)
      if (showGrid) {
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1;

        // Horizontal lines (voltage)
        const gridSpacing = 20; // 0.5mV per grid (typical ECG)
        for (let y = 0; y <= height; y += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Vertical lines (time)
        for (let x = 0; x <= width; x += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
      }

      if (ecgData.length === 0) {
        // Draw placeholder if no data
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        return;
      }

      // Scale ECG data to canvas
      const centerY = height / 2;
      const maxValue = 1024; // Arduino ADC max value
      const scale = (height * 0.8) / maxValue; // Use 80% of height for waveform

      // Calculate points to display (show last N samples that fit in width)
      const samplesToShow = Math.min(ecgData.length, Math.floor(width / 2));
      const startIndex = Math.max(0, ecgData.length - samplesToShow);
      const stepX = width / samplesToShow;

      // Draw ECG waveform
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();

      for (let i = 0; i < samplesToShow; i++) {
        const dataIndex = startIndex + i;
        const value = ecgData[dataIndex];
        const x = i * stepX;
        // Invert Y axis (ECG baseline at center, positive values go up)
        const y = centerY - (value - 512) * scale;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Draw baseline indicator
      ctx.strokeStyle = "#9ca3af";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    if (animated) {
      const animate = () => {
        drawWaveform();
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    } else {
      drawWaveform();
    }
  }, [ecgData, color, height, width, animated, showGrid]);

  return (
    <div className="flex items-center justify-center bg-white rounded-lg p-2">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-200 rounded"
      />
    </div>
  );
};
