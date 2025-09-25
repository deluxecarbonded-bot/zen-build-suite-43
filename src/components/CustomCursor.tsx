import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/use-theme';

export function CustomCursor() {
  const { cursorTheme, zenMode } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.matches(
        'button, [role="button"], a, input, textarea, select, .btn-zen, .tab'
      );
      setIsHovering(isInteractive);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Hide cursor in zen mode or use system cursor for default
  if (cursorTheme === 'zen' || cursorTheme === 'default') {
    return null;
  }

  const getCursorSize = () => {
    if (cursorTheme === 'minimal') return isHovering ? 16 : 8;
    if (cursorTheme === 'calm') return isHovering ? 24 : 16;
    return isHovering ? 20 : 12; // default
  };

  const getCursorVariant = () => {
    if (isClicking) return 'clicking';
    if (isHovering) return 'hovering';
    return 'default';
  };

  return (
    <motion.div
      className="custom-cursor"
      style={{
        left: mousePosition.x,
        top: mousePosition.y,
      }}
      animate={getCursorVariant()}
      variants={{
        default: {
          scale: 1,
          opacity: zenMode ? 0.3 : 0.8,
        },
        hovering: {
          scale: 1.5,
          opacity: zenMode ? 0.5 : 1,
        },
        clicking: {
          scale: 0.8,
          opacity: zenMode ? 0.7 : 1,
        },
      }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 28,
      }}
    >
      {cursorTheme === 'minimal' && (
        <div className="cursor-minimal-dot" style={{ width: getCursorSize(), height: getCursorSize() }} />
      )}
      
      {cursorTheme === 'calm' && (
        <div className="cursor-calm-circle" style={{ width: getCursorSize(), height: getCursorSize() }}>
          <div className="cursor-calm-inner" />
        </div>
      )}
    </motion.div>
  );
}