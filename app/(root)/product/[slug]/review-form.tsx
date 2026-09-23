'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { reviewFormDefaultValues } from '@/lib/constants';
import { insertReviewSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { StarIcon } from 'lucide-react';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  createUpdateReview,
  getReviewByProductId,
} from '@/lib/actions/review.actions';

const ReviewForm = ({
  userId,
  productId,
  onReviewSubmitted,
}: {
  userId: string;
  productId: string;
  onReviewSubmitted: () => void;
}) => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof insertReviewSchema>>({
    resolver: zodResolver(insertReviewSchema),
    defaultValues: reviewFormDefaultValues,
  });

  // Open Form Handler
  const handleOpenForm = async () => {
    form.setValue('productId', productId);
    form.setValue('userId', userId);

    const review = await getReviewByProductId({ productId });

    if (review) {
      form.setValue('title', review.title);
      form.setValue('description', review.description);
      form.setValue('rating', review.rating);
    }

    setOpen(true);
  };

  // Submit Form Handler
  const onSubmit: SubmitHandler<z.infer<typeof insertReviewSchema>> = async (
    values
  ) => {
    const res = await createUpdateReview({ ...values, productId });

    if (!res.success) {
      return toast({
        variant: 'destructive',
        description: res.message,
      });
    }

    setOpen(false);

    onReviewSubmitted();

    toast({
      description: res.message,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={handleOpenForm} className='bg-[hsl(213,80%,25%)] hover:bg-[hsl(213,80%,20%)] text-white'>
        Viết đánh giá
      </Button>
      <DialogContent className='sm:max-w-[425px]'>
        <Form {...form}>
          <form method='post' onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Đánh giá sản phẩm</DialogTitle>
              <DialogDescription>
                Chia sẻ cảm nhận của bạn về sản phẩm này cho cộng đồng
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề</FormLabel>
                    <FormControl>
                      <Input placeholder='Ví dụ: Hiệu năng rất tốt, mát mẻ' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Nội dung chi tiết</FormLabel>
                      <FormControl>
                        <Textarea placeholder='Mô tả trải nghiệm sử dụng linh kiện...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name='rating'
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Điểm số (sao)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 5 }).map((_, index) => (
                            <SelectItem
                              key={index}
                              value={(index + 1).toString()}
                            >
                              {index + 1}{' '}
                              <StarIcon className='inline h-4 w-4 text-yellow-500 fill-current ml-1' />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
            <DialogFooter>
              <Button
                type='submit'
                size='lg'
                className='w-full bg-[hsl(213,80%,25%)] hover:bg-[hsl(213,80%,20%)] text-white'
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewForm;
