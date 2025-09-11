"use client";
 
import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
import { persistCache } from "apollo3-cache-persist";
import localForage from "localforage";
import QueueLink from "apollo-link-queue";
import { onError } from "@apollo/client/link/error";
 
const cache = new InMemoryCache();
 
// ✅ Persist cache in IndexedDB for offline support
(async () => {
  await persistCache({
    cache,
    storage: localForage,
  });
})();
 
// ✅ Queue for offline mutations
const queueLink = new QueueLink();
 
// ✅ Error handling
const errorLink = onError(({ networkError }) => {
  if (networkError) {
    console.log("⚠️ Network error, mutations will be queued until online.");
  }
});
 
// ✅ GraphQL endpoint (backend running locally)
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL + "/graphql",
});
 
// ✅ Apollo Client instance
const client = new ApolloClient({
  link: ApolloLink.from([errorLink, queueLink, httpLink]),
  cache,
});
 
// ✅ Handle online/offline state
if (typeof window !== "undefined") {
  window.addEventListener("offline", () => queueLink.close());
  window.addEventListener("online", () => queueLink.open());
}
 
export default client;