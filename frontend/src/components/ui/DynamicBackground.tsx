import React, { useEffect, useRef } from 'react';

const DynamicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const createGradientWithRipple = (time: number) => {
      const width = canvas.width;
      const height = canvas.height;

      // Create multiple gradient layers for water ripple effect
      const gradient1 = ctx.createLinearGradient(0, 0, width, height);
      const gradient2 = ctx.createRadialGradient(
        width / 2 + Math.sin(time * 0.0005) * 100,
        height / 2 + Math.cos(time * 0.0005) * 100,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );

      // Animate gradient colors with wave-like motion
      const hue1 = (time * 0.002) % 360; // 降低速度：从0.01减少到0.002
      const hue2 = (time * 0.003 + 120) % 360; // 降低速度：从0.015减少到0.003
      const hue3 = (time * 0.004 + 240) % 360; // 降低速度：从0.02减少到0.004

      // Primary gradient with ripple effect
      gradient1.addColorStop(0, `hsla(${hue1}, 70%, 20%, 0.8)`);
      gradient1.addColorStop(0.5, `hsla(${hue2}, 60%, 15%, 0.8)`);
      gradient1.addColorStop(1, `hsla(${hue3}, 70%, 25%, 0.8)`);

      // Secondary ripple gradient
      gradient2.addColorStop(0, `hsla(${(hue1 + 60) % 360}, 80%, 30%, 0.3)`);
      gradient2.addColorStop(0.5, `hsla(${(hue2 + 60) % 360}, 70%, 20%, 0.3)`);
      gradient2.addColorStop(1, `hsla(${(hue3 + 60) % 360}, 80%, 35%, 0.3)`);

      // Apply gradients with wave distortion
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, width, height);

      // Create water ripple effect
      ctx.fillStyle = gradient2;

      // Draw multiple ripple circles
      for (let i = 0; i < 3; i++) {
        const rippleTime = time * 0.001 + i * 2;
        const rippleX = width / 2 + Math.sin(rippleTime) * 150;
        const rippleY = height / 2 + Math.cos(rippleTime * 0.7) * 100;
        const rippleRadius = (Math.sin(rippleTime * 0.5) + 1) * 200 + 100;

        const rippleGradient = ctx.createRadialGradient(
          rippleX, rippleY, 0,
          rippleX, rippleY, rippleRadius
        );

        const rippleHue = (hue1 + i * 30) % 360;
        rippleGradient.addColorStop(0, `hsla(${rippleHue}, 70%, 40%, 0.2)`);
        rippleGradient.addColorStop(0.5, `hsla(${rippleHue}, 60%, 30%, 0.1)`);
        rippleGradient.addColorStop(1, `hsla(${rippleHue}, 70%, 20%, 0)`);

        ctx.fillStyle = rippleGradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Add wave distortion lines
      ctx.strokeStyle = `hsla(${(hue1 + 180) % 360}, 50%, 50%, 0.1)`;
      ctx.lineWidth = 2;

      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 10) {
          const waveY = y + Math.sin((x * 0.01) + (time * 0.001)) * 20;
          if (x === 0) {
            ctx.moveTo(x, waveY);
          } else {
            ctx.lineTo(x, waveY);
          }
        }
        ctx.stroke();
      }
    };

    const animate = () => {
      time += 4; // 降低动画速度，从16减少到4
      createGradientWithRipple(time);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)'
      }}
    />
  );
};

export default DynamicBackground;