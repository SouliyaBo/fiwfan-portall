export const API_BASE_URL = process.env.NODE_ENV === 'development'
    ? "http://localhost:8000"
    : (process.env.NEXT_PUBLIC_API_URL || "https://api.phusao.com");
// export const API_BASE_URL = "http://localhost:8000";
