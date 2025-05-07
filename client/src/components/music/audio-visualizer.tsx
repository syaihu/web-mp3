import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  audioContext?: AudioContext;
  analyser?: AnalyserNode;
  className?: string;
}

export function AudioVisualizer({ audioContext, analyser, className = "" }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const previousDataRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser || !audioContext) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create smooth animation by interpolating between frames
    const smoothValue = (current: number, target: number, alpha = 0.3) => {
      return alpha * target + (1 - alpha) * current;
    };

    // Initialize previous data array
    if (!previousDataRef.current) {
      const bufferLength = analyser.frequencyBinCount;
      previousDataRef.current = new Uint8Array(bufferLength).fill(0);
    }

    // Animation function for modern soundwave visualization
    const animate = () => {
      if (!ctx || !analyser) return;

      animationRef.current = requestAnimationFrame(animate);
      
      // Get frequency and time domain data
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const timeDataArray = new Uint8Array(bufferLength);
      
      analyser.getByteFrequencyData(dataArray);
      analyser.getByteTimeDomainData(timeDataArray);
      
      // Smooth the data
      if (previousDataRef.current) {
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = smoothValue(previousDataRef.current[i], dataArray[i], 0.3);
        }
        previousDataRef.current = new Uint8Array(dataArray);
      }
      
      // Clear canvas with gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, 'rgba(40, 40, 40, 0.4)');
      bgGradient.addColorStop(1, 'rgba(30, 30, 30, 0.4)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Center line
      const centerY = canvas.height / 2;
      
      // Draw wave form in the middle (time domain data)
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      
      // Set line style
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(29, 185, 84, 0.6)'; // Primary color with transparency
      
      // Calculate point spacing
      const sliceWidth = canvas.width / bufferLength;
      
      // Draw the waveform
      for (let i = 0; i < bufferLength; i++) {
        const x = i * sliceWidth;
        const v = timeDataArray[i] / 128.0; // normalize to 0-2 range
        const y = v * (canvas.height / 4) + centerY;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      
      // Draw frequency bars from the center (symmetrical)
      const barCount = 64;
      const barWidth = Math.max(2, Math.floor(canvas.width / barCount));
      const barGap = 1;
      const maxBarHeight = canvas.height / 2;
      
      for (let i = 0; i < barCount; i++) {
        // Map bar index to frequency data index
        const dataIndex = Math.floor(i * bufferLength / barCount);
        
        // Use frequency data or gentle random data if not playing
        const value = dataArray[dataIndex] || Math.random() * 10 + 5;
        
        // Calculate height based on frequency value (use square root to enhance lower values)
        const heightPercentage = Math.sqrt(value / 255);
        const height = heightPercentage * maxBarHeight * 0.9;
        
        // Position each bar
        const x = i * (barWidth + barGap) + canvas.width / 2 - (barCount * (barWidth + barGap)) / 2;
        
        // Create gradient for top bars
        const gradientTop = ctx.createLinearGradient(0, centerY - height, 0, centerY);
        gradientTop.addColorStop(0, 'rgba(78, 234, 161, 0.9)'); // Lighter green at top
        gradientTop.addColorStop(1, 'rgba(29, 185, 84, 0.5)'); // Primary green at center
        
        // Create gradient for bottom bars (mirrored)
        const gradientBottom = ctx.createLinearGradient(0, centerY, 0, centerY + height);
        gradientBottom.addColorStop(0, 'rgba(29, 185, 84, 0.5)'); // Primary green at center
        gradientBottom.addColorStop(1, 'rgba(78, 234, 161, 0.9)'); // Lighter green at bottom
        
        // Draw top bar with rounded top
        ctx.fillStyle = gradientTop;
        ctx.beginPath();
        ctx.moveTo(x, centerY - height + barWidth / 2);
        ctx.lineTo(x, centerY);
        ctx.lineTo(x + barWidth, centerY);
        ctx.lineTo(x + barWidth, centerY - height + barWidth / 2);
        ctx.arc(x + barWidth / 2, centerY - height + barWidth / 2, barWidth / 2, 0, Math.PI, true);
        ctx.closePath();
        ctx.fill();
        
        // Draw bottom bar with rounded bottom
        ctx.fillStyle = gradientBottom;
        ctx.beginPath();
        ctx.moveTo(x, centerY);
        ctx.lineTo(x + barWidth, centerY);
        ctx.lineTo(x + barWidth, centerY + height - barWidth / 2);
        ctx.arc(x + barWidth / 2, centerY + height - barWidth / 2, barWidth / 2, 0, Math.PI, false);
        ctx.lineTo(x, centerY);
        ctx.closePath();
        ctx.fill();
      }
      
      // Add glow effect in the center
      const centerGlow = ctx.createRadialGradient(
        canvas.width / 2, centerY, 0,
        canvas.width / 2, centerY, canvas.width / 3
      );
      centerGlow.addColorStop(0, 'rgba(29, 185, 84, 0.2)');
      centerGlow.addColorStop(1, 'rgba(29, 185, 84, 0)');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw thin center line
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvas.width, centerY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    };

    // Start animation
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioContext, analyser]);

  return (
    <div className={`relative rounded-lg overflow-hidden shadow-inner ${className}`}>
      <div className="absolute inset-0 bg-dark-lighter/70 backdrop-blur-sm"></div>
      <canvas 
        ref={canvasRef} 
        className="visualizer-canvas w-full h-full relative z-10"
      />
    </div>
  );
}
