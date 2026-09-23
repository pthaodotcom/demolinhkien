import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import {
  APP_NAME,
  APP_PHONE,
  APP_EMAIL,
  APP_ADDRESS,
  APP_WORKING_HOURS,
  PRODUCT_CATEGORIES,
} from '@/lib/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-[hsl(213,80%,20%)] text-white'>
      {/* Main Footer */}
      <div className='wrapper py-10'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {/* Column 1: About */}
          <div>
            <div className='flex items-center gap-3 mb-4'>
              <Image
                src='/images/logo.jpg'
                alt={APP_NAME}
                width={48}
                height={48}
                className='rounded'
              />
              <div>
                <h3 className='font-bold text-lg'>{APP_NAME}</h3>
                <p className='text-xs text-white/70'>Tận Tâm</p>
              </div>
            </div>
            <p className='text-sm text-white/80 leading-relaxed'>
              Chuyên cung cấp linh kiện máy tính chính hãng, dịch vụ ráp máy và
              nâng cấp PC tại Phước Long, Bình Phước.
            </p>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h3 className='font-bold text-lg mb-4'>Danh mục sản phẩm</h3>
            <ul className='space-y-2'>
              {PRODUCT_CATEGORIES.slice(0, 8).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/search?category=${cat}`}
                    className='text-sm text-white/80 hover:text-[hsl(35,92%,52%)] transition-colors'
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div>
            <h3 className='font-bold text-lg mb-4'>Chính sách</h3>
            <ul className='space-y-2'>
              <li>
                <span className='text-sm text-white/80'>
                  Bảo hành chính hãng
                </span>
              </li>
              <li>
                <span className='text-sm text-white/80'>Đổi trả 7 ngày</span>
              </li>
              <li>
                <span className='text-sm text-white/80'>
                  Giao hàng nội thành
                </span>
              </li>
              <li>
                <span className='text-sm text-white/80'>
                  Tư vấn miễn phí
                </span>
              </li>
              <li>
                <span className='text-sm text-white/80'>
                  Hỗ trợ kỹ thuật 24/7
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className='font-bold text-lg mb-4'>Liên hệ</h3>
            <ul className='space-y-3'>
              <li className='flex items-start gap-2'>
                <MapPin className='w-4 h-4 mt-0.5 shrink-0 text-[hsl(35,92%,52%)]' />
                <span className='text-sm text-white/80'>{APP_ADDRESS}</span>
              </li>
              <li className='flex items-center gap-2'>
                <Phone className='w-4 h-4 shrink-0 text-[hsl(35,92%,52%)]' />
                <a
                  href={`tel:${APP_PHONE.replace(/\s/g, '')}`}
                  className='text-sm text-white/80 hover:text-[hsl(35,92%,52%)] transition-colors'
                >
                  {APP_PHONE}
                </a>
              </li>
              <li className='flex items-center gap-2'>
                <Mail className='w-4 h-4 shrink-0 text-[hsl(35,92%,52%)]' />
                <a
                  href={`mailto:${APP_EMAIL}`}
                  className='text-sm text-white/80 hover:text-[hsl(35,92%,52%)] transition-colors'
                >
                  {APP_EMAIL}
                </a>
              </li>
              <li className='flex items-center gap-2'>
                <Clock className='w-4 h-4 shrink-0 text-[hsl(35,92%,52%)]' />
                <span className='text-sm text-white/80'>
                  {APP_WORKING_HOURS}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className='border-t border-white/10'>
        <div className='wrapper py-4'>
          <p className='text-center text-sm text-white/60'>
            © {currentYear} {APP_NAME}. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
