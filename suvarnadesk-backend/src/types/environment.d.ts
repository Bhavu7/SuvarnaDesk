// types/environment.d.ts
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGODB_URI: string;
            METAL_PRICE_API_KEY?: string;
            METAL_PRICE_API_BASE_URL?: string;
            NODE_ENV: 'development' | 'production' | 'test';
            PORT?: string;
        }
    }
}

export { };