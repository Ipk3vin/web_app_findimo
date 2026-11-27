export const ORIGEN_API = typeof window === 'undefined'
  || ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)
  ? 'http://localhost:8080'
  : '';
