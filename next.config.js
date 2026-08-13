/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // 旧式裸 slug → 真实分类路径（301 永久重定向）
  async redirects() {
    return [
      // base64
      { source: "/base64-encode", destination: "/developer-tools/base64", permanent: true },
      { source: "/base64-decode", destination: "/developer-tools/base64", permanent: true },
      { source: "/base64-encoder", destination: "/developer-tools/base64", permanent: true },
      // json
      { source: "/json-formatter", destination: "/developer-tools/json-formatter", permanent: true },
      { source: "/json-formatter-online", destination: "/developer-tools/json-formatter", permanent: true },
      { source: "/json-pretty", destination: "/developer-tools/json-formatter", permanent: true },
      { source: "/json-prettify", destination: "/developer-tools/json-formatter", permanent: true },
      // regex
      { source: "/regex-tester", destination: "/developer-tools/regex-tester", permanent: true },
      { source: "/regex-test", destination: "/developer-tools/regex-tester", permanent: true },
      // qrcode
      { source: "/qr-code-generator", destination: "/image-tools/qrcode-generator", permanent: true },
      { source: "/qrcode-generator", destination: "/image-tools/qrcode-generator", permanent: true },
      { source: "/qr-generator", destination: "/image-tools/qrcode-generator", permanent: true },
      // url
      { source: "/url-encode", destination: "/developer-tools/url-encoder-decoder", permanent: true },
      { source: "/url-decode", destination: "/developer-tools/url-encoder-decoder", permanent: true },
      { source: "/url-encoder", destination: "/developer-tools/url-encoder-decoder", permanent: true },
      // image
      { source: "/image-compressor", destination: "/image-tools/image-compressor", permanent: true },
      { source: "/image-resizer", destination: "/image-tools/image-resizer", permanent: true },
      // pdf
      { source: "/pdf-compressor", destination: "/pdf-tools/pdf-compressor", permanent: true },
      { source: "/pdf-to-image", destination: "/pdf-tools/pdf-to-image", permanent: true },
      { source: "/image-to-pdf", destination: "/pdf-tools/image-to-pdf", permanent: true },
      { source: "/pdf-watermark", destination: "/pdf-tools/pdf-watermark", permanent: true },
      // validators
      { source: "/json-validator", destination: "/validators/json-validator", permanent: true },
      { source: "/email-validator", destination: "/validators/email-validator", permanent: true },
      { source: "/url-validator", destination: "/validators/url-validator", permanent: true },
      // password / misc
      { source: "/password-generator", destination: "/utilities/password-generator", permanent: true },
      { source: "/random-password", destination: "/data-tools/random-password", permanent: true },
      { source: "/timestamp", destination: "/developer-tools/timestamp", permanent: true },
    ];
  },
};

module.exports = nextConfig;
