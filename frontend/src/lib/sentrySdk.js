// Trozo aparte con el SDK de Sentry (dist/assets/sentrySdk-*.js): no se
// precachea y solo se descarga si la PWA se compiló con VITE_SENTRY_DSN.
export * from '@sentry/react';
