import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';

const Search = () => {
  return (
    <form action='/search' method='GET'>
      <div className='flex w-full items-center space-x-2'>
        <Input
          name='q'
          type='text'
          placeholder='Tìm kiếm linh kiện...'
          className='min-w-0 flex-1'
        />
        <Button type='submit' size='icon' aria-label='Tìm kiếm'>
          <SearchIcon />
        </Button>
      </div>
    </form>
  );
};

export default Search;
