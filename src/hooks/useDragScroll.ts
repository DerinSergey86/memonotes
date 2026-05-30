import { useRef, useCallback, useState } from 'react';

export function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [isDragging, setIsDragging] = useState(false); // состояние для отслеживания перетаскивания

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    isDown.current = true;
    setIsDragging(false); // сбрасываем флаг перед началом
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    e.preventDefault(); // предотвращаем выделение текста и смену курсора
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDown.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 2; // скорость скролла
    if (Math.abs(walk) > 5) { // если мышь сдвинулась больше чем на 5px
      setIsDragging(true); // это перетаскивание
    }
    ref.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    isDown.current = false;
  }, []);

  const onMouseLeave = useCallback(() => {
    isDown.current = false;
  }, []);

  return { ref, isDragging, onMouseDown, onMouseLeave, onMouseUp, onMouseMove };
}