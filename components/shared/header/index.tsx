import Image from 'next/image';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import Menu from './menu';
import Search from './search';
import TopBar from './top-bar';
import CategoryNav from './category-nav';
import { getAllCategories } from '@/lib/actions/product.actions';

const Header = async () => {
  const categories = (await getAllCategories()).map((item) => item.category);

  return (
    <header className='sticky top-0 z-50 w-full bg-white'>
      <TopBar />
      <div className='bg-white border-b'>
        <div className='wrapper flex-between py-3'>
          <div className='flex-start'>
            <Link href='/' className='flex-start'>
              <Image
                src='/images/logo.jpg'
                alt={`${APP_NAME} logo`}
                height={48}
                width={48}
                className='rounded'
                priority={true}
              />
              <div className='hidden lg:block ml-3'>
                <span className='font-bold text-xl text-[hsl(213,80%,25%)]'>
                  {APP_NAME}
                </span>
                <p className='text-xs text-muted-foreground'>Tận Tâm</p>
              </div>
            </Link>
          </div>
          <div className='hidden md:block flex-1 max-w-xl mx-6'>
            <Search />
          </div>
          <Menu categories={categories} />
        </div>
      </div>
      <CategoryNav categories={categories} />
    </header>
  );
};

export default Header;
