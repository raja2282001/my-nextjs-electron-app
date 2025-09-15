"use client";

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import { persistCache } from "apollo3-cache-persist";
import localForage from "localforage";
import QueueLink from "apollo-link-queue";
import { onError } from "@apollo/client/link/error";

let clientPromise: Promise<ApolloClient<any>> | null = null;

export function getApolloClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const cache = new InMemoryCache();

      // ✅ Wait until cache is restored (important for offline reloads)
      await persistCache({
        cache,
        storage: localForage,
      });

      // ✅ Offline mutation queue
      const queueLink = new QueueLink();

      // ✅ Error handling
      const errorLink = onError(({ networkError }) => {
        if (networkError) {
          console.log("⚠️ Network error, mutations will be queued until online.");
        }
      });

      // ✅ GraphQL endpoint (Render)
      const httpLink = new HttpLink({
        uri: process.env.NEXT_PUBLIC_API_URL + "/graphql",
      });

      // ✅ Apollo Client instance
      return new ApolloClient({
        link: ApolloLink.from([errorLink, queueLink, httpLink]),
        cache,
        connectToDevTools: true,
      });
    })();
  }

  return clientPromise;
}


