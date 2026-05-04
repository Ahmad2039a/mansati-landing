/** @type {import('next').NextConfig} */
const nextConfig = {
  // السماح للمصادر المحلية (الـ proxy في المعاينة) بالوصول لموارد التطوير
  // + السماح لـ Cloudflare Tunnel + localtunnel + ngrok للمشاركة الخارجية
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "*.localhost",
    "*.trycloudflare.com",
    "*.loca.lt",
    "*.ngrok.io",
    "*.ngrok-free.app",
  ],
};

export default nextConfig;
