import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';
import sampleData from '@/db/sample-data';
require('dotenv').config();

PurchaseReceiptEmail.PreviewProps = {
  order: {
    id: crypto.randomUUID(),
    userId: '123',
    user: {
      name: 'Nguyễn Văn An',
      email: 'user@example.com',
    },
    paymentMethod: 'CashOnDelivery',
    shippingAddress: {
      fullName: 'Nguyễn Văn An',
      streetAddress: '123 Đường Nguyễn Huệ',
      city: 'TP. Phước Long',
      postalCode: '83000',
      country: 'Việt Nam',
    },
    createdAt: new Date(),
    totalPrice: '5290000',
    taxPrice: '0',
    shippingPrice: '0',
    itemsPrice: '5290000',
    orderitems: sampleData.products.slice(0, 1).map((x) => ({
      name: x.name,
      orderId: '123',
      productId: '123',
      slug: x.slug,
      qty: 1,
      image: x.images[0],
      price: x.price.toString(),
    })),
    isDelivered: false,
    deliveredAt: null,
    isPaid: false,
    paidAt: null,
    paymentResult: {
      id: 'cod-123',
      status: 'pending',
      email_address: 'user@example.com',
      pricePaid: '5290000',
    },
  },
} satisfies OrderInformationProps;

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' });

type OrderInformationProps = {
  order: Order;
};

export default function PurchaseReceiptEmail({ order }: OrderInformationProps) {
  return (
    <Html>
      <Preview>Xác nhận đơn hàng Vi Tính Phước Long #{order.id}</Preview>
      <Tailwind>
        <Head />
        <Body className='font-sans bg-white'>
          <Container className='max-w-xl p-4'>
            <Heading className='text-xl font-bold text-[hsl(213,80%,25%)]'>
              Xác nhận đơn hàng - Vi Tính Phước Long
            </Heading>
            <Section className='my-4'>
              <Row>
                <Column>
                  <Text className='mb-0 mr-4 text-gray-500 whitespace-nowrap text-xs'>
                    Mã đơn hàng
                  </Text>
                  <Text className='mt-0 mr-4 text-sm font-semibold'>{order.id.toString()}</Text>
                </Column>
                <Column>
                  <Text className='mb-0 mr-4 text-gray-500 whitespace-nowrap text-xs'>
                    Ngày đặt
                  </Text>
                  <Text className='mt-0 mr-4 text-sm font-semibold'>
                    {dateFormatter.format(order.createdAt)}
                  </Text>
                </Column>
                <Column>
                  <Text className='mb-0 mr-4 text-gray-500 whitespace-nowrap text-xs'>
                    Tổng thanh toán
                  </Text>
                  <Text className='mt-0 mr-4 text-sm font-bold text-[hsl(35,95%,45%)]'>
                    {formatCurrency(order.totalPrice)}
                  </Text>
                </Column>
              </Row>
            </Section>
            <Section className='border border-solid border-gray-200 rounded-xl p-4 md:p-6 my-4'>
              {order.orderitems.map((item) => (
                <Row key={item.productId} className='mt-4'>
                  <Column className='w-20'>
                    <Img
                      width='70'
                      alt={item.name}
                      className='rounded border'
                      src={
                        item.image.startsWith('/')
                          ? `${process.env.NEXT_PUBLIC_SERVER_URL}${item.image}`
                          : item.image
                      }
                    />
                  </Column>
                  <Column className='align-top text-sm pl-2'>
                    {item.name} x {item.qty}
                  </Column>
                  <Column align='right' className='align-top font-semibold text-sm'>
                    {formatCurrency(item.price)}
                  </Column>
                </Row>
              ))}
              <div className='border-t border-gray-200 mt-4 pt-2'>
                {[
                  { name: 'Tạm tính', price: order.itemsPrice },
                  { name: 'Thuế VAT', price: order.taxPrice },
                  { name: 'Phí vận chuyển', price: order.shippingPrice },
                  { name: 'Tổng cộng', price: order.totalPrice },
                ].map(({ name, price }) => (
                  <Row key={name} className='py-1 text-sm'>
                    <Column align='right' className='text-gray-500'>{name}: </Column>
                    <Column align='right' width={100} className='align-top font-medium'>
                      <Text className='m-0'>{formatCurrency(price)}</Text>
                    </Column>
                  </Row>
                ))}
              </div>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
