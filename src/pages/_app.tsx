import { useState } from 'react'
import { type AppType } from "next/dist/shared/lib/utils";
import {
  QueryClient,
  QueryClientProvider,
  Hydrate
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  const [queryClient] = useState(() => new QueryClient())
  return (
  <QueryClientProvider client={queryClient}>
    <Hydrate state={pageProps.dehydratedState}>
      <Component {...pageProps} />
    </Hydrate>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
  );
};

export default MyApp;
