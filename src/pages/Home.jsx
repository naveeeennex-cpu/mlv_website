import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Products from '../components/Products';
import Testimonials from '../components/Testimonials';
import BookingForm from '../components/BookingForm';

export default function Home() {
  return (
    <main>
      <Hero />
      <Stats />
      <Products />
      <Testimonials />
      <BookingForm />
    </main>
  );
}
