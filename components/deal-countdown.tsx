'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Dynamic target date: 7 days from now or end of current month
const getTargetDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Function to calculate the time remaining
const calculateTimeRemaining = (targetDate: Date) => {
  const currentTime = new Date();
  const timeDifference = Math.max(Number(targetDate) - Number(currentTime), 0);
  return {
    days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
    hours: Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    ),
    minutes: Math.floor((timeDifference % (1000 * 60)) / (1000 * 60)),
    seconds: Math.floor((timeDifference % (1000 * 60)) / 1000),
  };
};

const DealCountdown = () => {
  const [targetDate] = useState<Date>(() => getTargetDate());
  const [time, setTime] = useState<ReturnType<typeof calculateTimeRemaining>>();

  useEffect(() => {
    setTime(calculateTimeRemaining(targetDate));

    const timerInterval = setInterval(() => {
      const newTime = calculateTimeRemaining(targetDate);
      setTime(newTime);

      if (
        newTime.days === 0 &&
        newTime.hours === 0 &&
        newTime.minutes === 0 &&
        newTime.seconds === 0
      ) {
        clearInterval(timerInterval);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [targetDate]);

  if (!time) {
    return (
      <section className='grid grid-cols-1 md:grid-cols-2 my-12 bg-white rounded-2xl p-8 border'>
        <div className='flex flex-col gap-2 justify-center'>
          <h3 className='text-3xl font-bold text-[hsl(213,80%,25%)]'>Đang tải ưu đãi...</h3>
        </div>
      </section>
    );
  }

  return (
    <section className='grid grid-cols-1 md:grid-cols-2 my-12 bg-white rounded-2xl p-8 border shadow-sm items-center'>
      <div className='flex flex-col gap-4 justify-center'>
        <div className='inline-block bg-[hsl(35,95%,55%)]/15 text-[hsl(35,95%,40%)] font-semibold text-xs px-3 py-1 rounded-full w-fit'>
          Ưu đãi số lượng có hạn
        </div>
        <h3 className='text-3xl font-bold text-[hsl(213,80%,25%)]'>Khuyến Mãi Linh Kiện Tuần Này</h3>
        <p className='text-gray-600 leading-relaxed'>
          Nâng cấp dàn PC của bạn với giá ưu đãi cực sốc! Giảm giá đến 30% cho CPU, VGA và SSD chính hãng từ Intel, AMD, ASUS, MSI. Miễn phí công lắp ráp khi mua trọn bộ.
        </p>
        <ul className='grid grid-cols-4 gap-2 my-2'>
          <StatBox label='Ngày' value={time.days} />
          <StatBox label='Giờ' value={time.hours} />
          <StatBox label='Phút' value={time.minutes} />
          <StatBox label='Giây' value={time.seconds} />
        </ul>
        <div>
          <Button asChild className='bg-[hsl(213,80%,25%)] hover:bg-[hsl(213,80%,20%)] px-8'>
            <Link href='/search'>Xem Sản Phẩm Khuyến Mãi</Link>
          </Button>
        </div>
      </div>
      <div className='flex justify-center p-4'>
        <Image
          src='/images/promo.jpg'
          alt='Khuyến mãi Lập Trình Viên'
          width={400}
          height={300}
          className='rounded-xl object-cover shadow-sm'
        />
      </div>
    </section>
  );
};

const StatBox = ({ label, value }: { label: string; value: number }) => (
  <li className='p-3 bg-gray-50 border rounded-lg text-center'>
    <p className='text-2xl font-bold text-[hsl(213,80%,25%)]'>{value}</p>
    <p className='text-xs text-gray-500 font-medium'>{label}</p>
  </li>
);

export default DealCountdown;
