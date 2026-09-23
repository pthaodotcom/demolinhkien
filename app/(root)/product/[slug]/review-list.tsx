'use client';

import { useEffect, useState } from 'react';
import { Review } from '@/types';
import SignInDialog from '@/components/shared/auth/sign-in-dialog';
import ReviewForm from './review-form';
import { getReviews } from '@/lib/actions/review.actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, User } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import Rating from '@/components/shared/product/rating';

const ReviewList = ({
  userId,
  productId,
  productSlug,
}: {
  userId: string;
  productId: string;
  productSlug: string;
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const loadReviews = async () => {
      const res = await getReviews({ productId });
      setReviews(res.data);
    };

    loadReviews();
  }, [productId]);

  // Reload reviews after created or updated
  const reload = async () => {
    const res = await getReviews({ productId });
    setReviews([...res.data]);
  };

  return (
    <div className='space-y-4'>
      {reviews.length === 0 && (
        <div className='text-gray-500 py-4 bg-gray-50 rounded-lg text-center'>
          Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!
        </div>
      )}
      {userId ? (
        <ReviewForm
          userId={userId}
          productId={productId}
          onReviewSubmitted={reload}
        />
      ) : (
        <div className='p-4 bg-blue-50/50 rounded-lg text-sm text-blue-900'>
          Vui lòng{' '}
          <SignInDialog callbackUrl={`/product/${productSlug}`}>
            <button type='button' className='text-[hsl(213,80%,30%)] font-semibold underline hover:text-[hsl(213,80%,20%)]'>
              đăng nhập
            </button>
          </SignInDialog>{' '}
          để viết đánh giá sản phẩm.
        </div>
      )}
      <div className='flex flex-col gap-3'>
        {reviews.map((review) => (
          <Card key={review.id} className='shadow-none border'>
            <CardHeader className='pb-2'>
              <div className='flex justify-between items-start'>
                <CardTitle className='text-base font-semibold'>{review.title}</CardTitle>
                <Rating value={review.rating} />
              </div>
              <CardDescription className='text-gray-700 text-sm mt-1'>
                {review.description}
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='flex items-center gap-4 text-xs text-gray-500'>
                <div className='flex items-center'>
                  <User className='mr-1 h-3.5 w-3.5' />
                  {review.user ? review.user.name : 'Khách hàng'}
                </div>
                <div className='flex items-center'>
                  <Calendar className='mr-1 h-3.5 w-3.5' />
                  {formatDateTime(review.createdAt).dateTime}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
