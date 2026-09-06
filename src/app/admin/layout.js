export const metadata = {
  title: {
    default: "Admin",
    template: "%s | HCS Admin",
  },
  description: "ระบบจัดการเว็บไซต์ HCS Thailand",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminRootLayout({ children }) {
  return children;
}
