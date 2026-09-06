# HCS Thailand Website & CMS

เว็บไซต์บริษัท HCS Thailand สำหรับนำเสนออุปกรณ์ประตู ระบบรักษาความปลอดภัย โซลูชัน และโครงการอ้างอิง พร้อมระบบ Content Management System สำหรับผู้ดูแลเว็บไซต์

## Technology Stack

- Next.js 16 App Router
- React 19
- JavaScript
- Tailwind CSS 4
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Admin SDK
- Vercel
- i18next / react-i18next
- React Hook Form
- Zod
- Axios
- React Icons
- next-themes
- Sonner
- SweetAlert2
- SWR
- Framer Motion
- Swiper

## Main Features

### Public Website

- English and Thai
- English is the default locale
- Locale routes: `/en` and `/th`
- Responsive design
- Light and Dark Mode
- Product categories
- Featured products
- Solutions by building type
- Standards and certifications
- Project references
- Company contact information
- Dynamic SEO metadata
- Canonical and hreflang links
- Open Graph and Twitter metadata
- Search engine verification support

### Administration System

- Secure Firebase Authentication
- HTTP-only session cookie
- Role-based access control
- Permission-based navigation
- English and Thai Admin UI
- User preferred language
- Site Settings management
- Default SEO management
- Audit Logs
- Cursor pagination
- Audit filters
- Trash and restore architecture
- Permanent delete permission
- Responsive Admin layout
- Light and Dark Mode
- Error, loading, forbidden and not-found states

## Supported Roles

| Role         | Description                                                     |
| ------------ | --------------------------------------------------------------- |
| `superadmin` | Full system access                                              |
| `admin`      | Content and administrator management without permanent deletion |
| `editor`     | Content editing based on assigned permissions                   |

All API routes verify permissions on the server. Hiding an Admin menu does not replace server-side authorization.

## Project Structure

```text
src/
├── app/
│   ├── [locale]/
│   ├── admin/
│   └── api/v1/
├── components/
│   ├── admin/
│   ├── common/
│   └── public/
├── config/
├── constants/
├── i18n/
│   └── locales/
│       ├── admin/
│       └── public/
├── lib/
│   ├── api/
│   ├── auth/
│   └── firebase/
├── modules/
└── services/
```
