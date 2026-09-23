import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { APP_PHONE } from '@/lib/constants';
import { Phone, ArrowRight } from 'lucide-react';
import IconBoxes from '@/components/icon-boxes';

const HeroBanner = () => {
  return (
    <section className='relative bg-gradient-to-r from-[hsl(213,80%,20%)] to-[hsl(213,80%,30%)] text-white overflow-hidden'>
      {/* Background pattern */}
      <div className='absolute inset-0 opacity-10'>
        <div className='absolute top-10 left-10 w-32 h-32 border border-white/30 rounded-full' />
        <div className='absolute bottom-20 right-20 w-48 h-48 border border-white/20 rounded-full' />
        <div className='absolute top-1/2 left-1/3 w-24 h-24 border border-white/20 rounded-full' />
      </div>

      <div className='wrapper relative z-10 py-12 md:py-16'>
        <div className='max-w-2xl'>
          <p className='text-[hsl(35,92%,52%)] font-semibold text-sm uppercase tracking-wider mb-4'>
            Lập Trình Viên – Tận Tâm
          </p>
          <h1 className='text-3xl md:text-5xl font-bold leading-tight mb-6'>
            Linh kiện máy tính
            <br />
            <span className='text-[hsl(35,92%,52%)]'>chính hãng</span> giá tốt
          </h1>
          <p className='text-lg text-white/80 mb-8 max-w-lg'>
            Chuyên cung cấp CPU, VGA, RAM, SSD và các linh kiện PC chính hãng.
            Dịch vụ ráp máy tính, nâng cấp PC theo yêu cầu.
          </p>
          <div className='flex flex-wrap gap-4'>
            <Button
              asChild
              size='lg'
              className='bg-[hsl(35,92%,52%)] hover:bg-[hsl(35,92%,45%)] text-white font-semibold'
            >
              <Link href='/search'>
                Xem sản phẩm <ArrowRight className='w-4 h-4 ml-2' />
              </Link>
            </Button>
            <Button
              asChild
              variant='outline'
              size='lg'
              className='border-white/60 bg-transparent text-white hover:bg-white hover:text-[hsl(213,80%,20%)]'
            >
              <a href={`tel:${APP_PHONE.replace(/\s/g, '')}`}>
                <Phone className='w-4 h-4 mr-2' /> Gọi tư vấn
              </a>
            </Button>
          </div>
        </div>
      </div>
      <IconBoxes />
    </section>
  );
};

export default HeroBanner;
