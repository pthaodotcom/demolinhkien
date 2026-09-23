import ProductList from '@/components/shared/product/product-list';
import {
  getLatestProducts,
  getFeaturedProducts,
} from '@/lib/actions/product.actions';
import ViewAllProductsButton from '@/components/view-all-products-button';
import HeroBanner from '@/components/home/hero-banner';
import CategoryGrid from '@/components/home/category-grid';
import BrandList from '@/components/home/brand-list';

export const dynamic = 'force-dynamic';

const Homepage = async () => {
  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <HeroBanner />
      <BrandList />
      <div className='wrapper'>
        <CategoryGrid />
        {featuredProducts.length > 0 && (
          <ProductList
            data={featuredProducts}
            title='Sản phẩm nổi bật'
            limit={4}
          />
        )}
        <ProductList
          data={latestProducts}
          title='Sản phẩm mới nhất'
          limit={4}
        />
        <ViewAllProductsButton />
      </div>
    </>
  );
};

export default Homepage;
