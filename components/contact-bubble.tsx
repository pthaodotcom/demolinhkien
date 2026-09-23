'use client';

import { useEffect, useState } from 'react';
import { MessageCircleMore, X } from 'lucide-react';
import Image from 'next/image';

type ContactBubbleProps = {
  facebook?: string;
  zalo?: string;
};

const contactLink = (value?: string) => {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};

function ContactAction({ href, label, children }: {
  href?: string;
  label: string;
  children: React.ReactNode;
}) {
  const className = 'flex h-12 w-12 items-center justify-center rounded-full bg-[#0866ff] text-white shadow-[0_6px_18px_rgba(0,0,0,0.22)] transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:h-14 sm:w-14';

  return href ? (
    <a href={href} target='_blank' rel='noopener noreferrer' aria-label={label} title={label} className={className}>
      {children}
    </a>
  ) : (
    <button type='button' disabled aria-label={`${label} chưa được cấu hình`} title={`${label} chưa được cấu hình`} className={`${className} cursor-not-allowed`}>
      {children}
    </button>
  );
}

export default function ContactBubble({ facebook, zalo }: ContactBubbleProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 640px)');
    const updateForScreen = () => setExpanded(desktop.matches);
    updateForScreen();
    desktop.addEventListener('change', updateForScreen);
    return () => desktop.removeEventListener('change', updateForScreen);
  }, []);

  return (
    <aside aria-label='Liên hệ nhanh' className='fixed bottom-4 right-3 z-40 flex flex-col items-center gap-2 sm:bottom-5 sm:right-4 sm:gap-3'>
      {expanded && (
        <div className='flex flex-col items-center gap-2 sm:gap-3'>
          <ContactAction href={contactLink(facebook)} label='Liên hệ qua Facebook'>
            <Image src='/images/brands/facebook.svg' alt='' width={26} height={26} aria-hidden='true' />
          </ContactAction>
          <ContactAction href={contactLink(zalo)} label='Liên hệ qua Zalo'>
            <span className='text-sm font-bold'>Zalo</span>
          </ContactAction>
        </div>
      )}
      <button
        type='button'
        onClick={() => setExpanded((value) => !value)}
        aria-label={expanded ? 'Thu gọn liên hệ nhanh' : 'Mở liên hệ nhanh'}
        aria-expanded={expanded}
        title={expanded ? 'Thu gọn liên hệ nhanh' : 'Mở liên hệ nhanh'}
        className='flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#173d61] bg-white text-[#173d61] shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:h-12 sm:w-12'
      >
        {expanded ? <X className='h-5 w-5' aria-hidden='true' /> : <MessageCircleMore className='h-5 w-5' aria-hidden='true' />}
      </button>
    </aside>
  );
}
