import '@/styles/globals.css'
import NavigationBar from '@/components/NavigationBar';
import { SessionProvider } from "next-auth/react"

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <NavigationBar />
      <Component {...pageProps} />
    </SessionProvider>
  );
}
