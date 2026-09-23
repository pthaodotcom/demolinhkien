import Link from 'next/link';
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

const categories = [
  { name: 'CPU', icon: Cpu, color: 'bg-blue-50 text-blue-600' },
  { name: 'Mainboard', icon: CircuitBoard, color: 'bg-green-50 text-green-600' },
  { name: 'RAM', icon: MemoryStick, color: 'bg-purple-50 text-purple-600' },
  { name: 'VGA', icon: Monitor, color: 'bg-red-50 text-red-600' },
  { name: 'SSD', icon: HardDrive, color: 'bg-orange-50 text-orange-600' },
  { name: 'PSU', icon: Zap, color: 'bg-yellow-50 text-yellow-600' },
  { name: 'Case', icon: Box, color: 'bg-teal-50 text-teal-600' },
  { name: 'PC', icon: Laptop, color: 'bg-indigo-50 text-indigo-600' },
];

const CategoryGrid = () => {
  return (
    <div className='my-10'>
      <h2 className='h2-bold mb-6 text-center'>Danh mục sản phẩm</h2>
      <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4'>
        {categories.map((cat) => {
          const IconComponent = cat.icon;
          return (
            <Link
              key={cat.name}
              href={`/search?category=${cat.name}`}
              className='flex flex-col items-center gap-3 p-4 rounded-xl hover:shadow-md transition-all duration-200 bg-white border hover:border-primary/30 group'
            >
              <div
                className={`p-3 rounded-full ${cat.color} group-hover:scale-110 transition-transform`}
              >
                <IconComponent className='w-6 h-6' />
              </div>
              <span className='text-sm font-medium text-center'>
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryGrid;
