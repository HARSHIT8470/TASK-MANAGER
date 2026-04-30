import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-60 overflow-y-auto">
        <div className="p-6 min-h-screen animate-fade-in">
          {children}
        </div>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#ffffff', color: '#1f2937', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
          success: { iconTheme: { primary: '#059669', secondary: '#ffffff' } },
          error:   { iconTheme: { primary: '#dc2626', secondary: '#ffffff' } },
        }}
      />
    </div>
  );
}
