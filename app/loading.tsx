const LoadingPage = () => {
  return (
    <div className='flex flex-col justify-center items-center h-screen w-screen bg-white'>
      <div className='relative w-16 h-16'>
        <div className='absolute inset-0 rounded-full border-4 border-gray-200'></div>
        <div className='absolute inset-0 rounded-full border-4 border-[hsl(213,80%,25%)] border-t-transparent animate-spin'></div>
      </div>
      <p className='mt-4 text-sm font-medium text-gray-600 animate-pulse'>
        Đang tải dữ liệu...
      </p>
    </div>
  );
};

export default LoadingPage;
