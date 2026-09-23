'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  Monitor,
  HardDrive,
  Zap,
  Box,
  Laptop,
} from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  CPU: <Cpu className='w-4 h-4' />,
  Mainboard: <CircuitBoard className='w-4 h-4' />,
  RAM: <MemoryStick className='w-4 h-4' />,
  VGA: <Monitor className='w-4 h-4' />,
  SSD: <HardDrive className='w-4 h-4' />,
  PSU: <Zap className='w-4 h-4' />,
  Case: <Box className='w-4 h-4' />,
  PC: <Laptop className='w-4 h-4' />,
};

const CategoryNav = ({ categories }: { categories: string[] }) => {
  const pathname = usePathname();
  if (pathname === '/search') return null;

  return (
    <nav className='hidden md:block bg-[hsl(210,50%,95%)] border-b'>
      <div className='wrapper py-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
        <ul className='flex min-w-full items-center justify-between gap-3 lg:gap-4 xl:justify-center xl:gap-5'>
          {categories.map((cat) => (
            <li key={cat} className='shrink-0'>
              <Link
                href={`/search?category=${cat}`}
                className='flex items-center gap-2 whitespace-nowrap rounded px-3 py-1.5 text-xs lg:text-sm font-medium text-[hsl(220,30%,15%)] transition-colors hover:bg-white/70 hover:text-[hsl(213,80%,25%)]'
              >
                {categoryIcons[cat]}
                {cat}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default CategoryNav;
