import { Shield, Truck, Headset, Wrench } from 'lucide-react';

const IconBoxes = () => {
  const items = [
    {
      icon: Truck,
      title: 'Giao hàng tận nơi',
      description: 'Miễn phí nội thành Phước Long',
    },
    {
      icon: Shield,
      title: 'Bảo hành chính hãng',
      description: 'Cam kết hàng chính hãng 100%',
    },
    {
      icon: Wrench,
      title: 'Ráp máy miễn phí',
      description: 'Tư vấn và ráp PC theo yêu cầu',
    },
    {
      icon: Headset,
      title: 'Hỗ trợ kỹ thuật',
      description: 'Tư vấn miễn phí mọi lúc',
    },
  ];

  return (
    <div className='border-t border-white/20 bg-[hsl(213,80%,16%)]'>
      <div className='wrapper grid grid-cols-2 gap-x-5 gap-y-6 py-6 lg:grid-cols-4 lg:gap-8'>
        {items.map((item) => (
          <div key={item.title} className='flex min-w-0 items-start gap-3'>
            <item.icon className='mt-0.5 h-6 w-6 shrink-0 text-[hsl(35,92%,52%)]' aria-hidden='true' />
            <div className='min-w-0'>
              <h3 className='text-sm font-semibold leading-snug text-white'>{item.title}</h3>
              <p className='mt-1 text-xs leading-relaxed text-white/80'>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IconBoxes;
