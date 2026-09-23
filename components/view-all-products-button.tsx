import { Button } from './ui/button';
import Link from 'next/link';

const ViewAllProductsButton = () => {
  return (
    <div className='flex justify-center my-8'>
      <Button asChild className='px-8 py-3'>
        <Link href='/search'>Xem tất cả sản phẩm</Link>
      </Button>
    </div>
  );
};

export default ViewAllProductsButton;
