// pages/_app.js
export default function App({ Component, pageProps }) {
  // ambil pageTitle dari static property di masing-masing page (atau default 'Dashboard')
  const title = Component.pageTitle || 'Dashboard'

  // kita hanya render page-nya saja, tanpa pakai Layout di sini
  return <Component {...pageProps} pageTitle={title} />
}
