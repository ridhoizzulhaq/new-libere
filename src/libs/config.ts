const config = {
  env: {
    privy: {
      appId: import.meta.env.VITE_PRIVY_APP_ID,
      clientId: import.meta.env.VITE_PRIVY_CLIENT_ID,
    },
    pinata: {
      apiKey: import.meta.env.VITE_PINATA_API_KEY,
      secretApiKey: import.meta.env.VITE_PINATA_SECRET_API_KEY,
    },
    supabase: {
      baseUrl: import.meta.env.VITE_SUPABASE_URL,
      apiKey: import.meta.env.VITE_SUPABASE_API_KEY,
    }
  },
};

export default config;
