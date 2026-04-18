import './globals.css';
import ClientLayout from '../components/ClientLayout';

export const metadata = {
  title: 'AcademyAI - Modern Learning Experience',
  description: 'AI-Powered Learning Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
