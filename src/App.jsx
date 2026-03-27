import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Footer from './components/Footer';
import FloatingButtons from './components/FloatingButtons';

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#111111',
            color: '#f5f5f5',
            border: '1px solid #2a2a2a',
            fontSize: '14px',
          },
        }}
      />
      <Navbar />
      <Home />
      <Footer />
      <FloatingButtons />
    </>
  );
}
