// Dev: đi qua CRA proxy (xem "proxy" trong package.json) để tránh CORS preflight redirect.
// Production: gọi thẳng domain backend.
export const API_BASE =
    process.env.NODE_ENV === 'production'
        ? 'https://rosieorderr.kinhdoanh.website'
        : '';
