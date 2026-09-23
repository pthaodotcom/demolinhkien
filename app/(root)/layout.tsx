import Header from '@/components/shared/header';
import Footer from '@/components/footer';
import ContactBubble from '@/components/contact-bubble';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex min-h-screen flex-col'>
      <Header />
      <main className='flex-1'>{children}</main>
      <Footer />
      <ContactBubble
        facebook={process.env.NEXT_PUBLIC_FACEBOOK_URL}
        zalo={process.env.NEXT_PUBLIC_ZALO_URL}
      />
    </div>
  );
}
