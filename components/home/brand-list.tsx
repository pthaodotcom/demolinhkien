'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { PointerEvent } from 'react';

const brands = [
  { name: 'Intel', logo: 'intel.svg' },
  { name: 'AMD', logo: 'amd.svg' },
  { name: 'ASUS', logo: 'asus.svg' },
  { name: 'MSI', logo: 'msi.svg' },
  { name: 'Gigabyte', logo: 'gigabyte.svg' },
  { name: 'Corsair', logo: 'corsair.svg' },
  { name: 'Kingston', logo: 'kingstontechnology.svg' },
  { name: 'Samsung', logo: 'samsung.svg' },
  { name: 'NVIDIA', logo: 'nvidia.svg' },
  { name: 'Western Digital', logo: 'westerndigital.svg' },
];

const BrandList = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const lastPointerX = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let lastTime = 0;

    const animate = (time: number) => {
      if (!draggingRef.current && !reducedMotion.matches) {
        const loopWidth = track.scrollWidth / 4;
        if (loopWidth > 0) {
          track.scrollLeft = (track.scrollLeft + Math.min(time - (lastTime || time), 50) * 0.04) % loopWidth;
        }
      }
      lastTime = time;
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    lastPointerX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const track = event.currentTarget;
    const loopWidth = track.scrollWidth / 4;
    if (loopWidth > 0) {
      track.scrollLeft = (track.scrollLeft + lastPointerX.current - event.clientX + loopWidth) % loopWidth;
    }
    lastPointerX.current = event.clientX;
  };

  const onPointerUp = () => {
    draggingRef.current = false;
  };

  return (
    <section className='w-full border-b bg-white py-4' aria-label='Thương hiệu nổi bật'>
      <div
        ref={trackRef}
        className='w-full overflow-hidden cursor-grab active:cursor-grabbing select-none touch-pan-y'
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className='flex w-max items-center'>
          {[0, 1, 2, 3].map((copy) => (
            <div key={copy} aria-hidden={copy !== 0} className='flex shrink-0 items-center gap-4 pr-4 sm:gap-6 sm:pr-6'>
              {brands.map((brand) => (
                <div
                  key={brand.name}
                  className='flex h-16 w-32 sm:w-40 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-2 transition-all hover:border-slate-300 hover:bg-white hover:shadow-sm'
                >
                  <Image
                    src={`/images/brands/${brand.logo}`}
                    alt={brand.name}
                    width={144}
                    height={64}
                    className='h-10 w-full object-contain pointer-events-none select-none'
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandList;
