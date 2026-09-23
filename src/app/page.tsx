import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function HomePage() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('auth_session')?.value;

  if (!sessionToken) {
    redirect('/login');
  }

  redirect('/admin');
}
