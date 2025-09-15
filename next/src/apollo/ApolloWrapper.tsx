"use client";

import { ApolloProvider } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { getApolloClient } from "./client";

export default function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const c = await getApolloClient();
      setClient(c);
    })();
  }, []);

  // ⏳ Don’t render until cache is ready
  if (!client) return <div className="flex items-center justify-center">Loading cache...</div>;

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}




