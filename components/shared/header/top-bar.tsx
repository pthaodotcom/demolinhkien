import { Phone, Mail, MapPin } from 'lucide-react';
import { APP_PHONE, APP_EMAIL, APP_ADDRESS } from '@/lib/constants';

const TopBar = () => {
  return (
    <div className='bg-[hsl(213,80%,25%)] text-white text-xs'>
      <div className='wrapper flex-between py-1.5'>
        <div className='flex items-center gap-4'>
          <a
            href={`tel:${APP_PHONE.replace(/\s/g, '')}`}
            className='flex items-center gap-1 hover:text-[hsl(35,92%,52%)] transition-colors'
          >
            <Phone className='w-3 h-3' />
            <span>{APP_PHONE}</span>
          </a>
          <a
            href={`mailto:${APP_EMAIL}`}
            className='hidden sm:flex items-center gap-1 hover:text-[hsl(35,92%,52%)] transition-colors'
          >
            <Mail className='w-3 h-3' />
            <span>{APP_EMAIL}</span>
          </a>
        </div>
        <div className='hidden md:flex items-center gap-1 text-white/80'>
          <MapPin className='w-3 h-3' />
          <span>{APP_ADDRESS}</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
