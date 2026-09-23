import { Monitor, ArrowUpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ServiceSection = () => {
  return (
    <div className='my-10 bg-[hsl(210,50%,95%)] rounded-2xl p-8'>
      <h2 className='h2-bold mb-6 text-center'>Dịch vụ của chúng tôi</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card className='border-0 shadow-sm'>
          <CardContent className='p-6'>
            <div className='flex items-start gap-4'>
              <div className='p-3 rounded-xl bg-[hsl(213,80%,25%)] text-white shrink-0'>
                <Monitor className='w-6 h-6' />
              </div>
              <div>
                <h3 className='font-bold text-lg mb-2'>Ráp máy tính</h3>
                <p className='text-muted-foreground text-sm leading-relaxed'>
                  Tư vấn cấu hình và ráp máy tính theo nhu cầu: gaming, đồ họa,
                  văn phòng. Cam kết linh kiện chính hãng, bảo hành đầy đủ.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='border-0 shadow-sm'>
          <CardContent className='p-6'>
            <div className='flex items-start gap-4'>
              <div className='p-3 rounded-xl bg-[hsl(35,92%,52%)] text-white shrink-0'>
                <ArrowUpCircle className='w-6 h-6' />
              </div>
              <div>
                <h3 className='font-bold text-lg mb-2'>Nâng cấp máy tính</h3>
                <p className='text-muted-foreground text-sm leading-relaxed'>
                  Nâng cấp RAM, SSD, VGA cho PC và Laptop. Kiểm tra tương thích
                  miễn phí. Thi công tại cửa hàng hoặc tận nơi.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceSection;
