# HCS Thailand Website & CMS

Corporate website and Content Management System for HCS Thailand, an architectural door hardware and opening-solutions company.

The project includes a bilingual public website and a secure administration system for managing products, categories, company content, projects, standards, media, enquiries, users, permissions and audit history.

## Key Features

### Public Website

- English and Thai language support
- English as the default locale
- Responsive layouts for desktop, tablet and mobile
- Light and dark themes
- Dynamic company and contact information
- Dynamic SEO metadata
- Canonical and alternate-language URLs
- Open Graph and Twitter metadata
- Product catalogue with filters and pagination
- Product categories and product-detail pages
- Building and application solutions
- Project references and project-detail pages
- Standards and certifications
- Editable About page
- Contact form with file attachments
- Privacy Policy
- Terms of Use

### Administration System

- Firebase Authentication
- Secure HTTP-only administrator session
- Role-based and permission-based access control
- English and Thai Admin interface
- Administrator language preference
- Responsive Admin layout
- Light and dark themes
- Dashboard
- Home Hero management
- About Builder with draft, preview and publish workflow
- Site Settings and default SEO management
- Product category management
- Product management
- Product filtering and search
- Product result totals and pagination
- Bulk product selection
- Bulk publish, unpublish, deactivate and delete actions
- Direct Product status updates
- Product ordering
- Solution management
- Project-reference management
- Standards and certificate management
- Media Library with usage tracking
- Contact-message management
- Administrator management
- Permission-group management
- Audit Logs
- Trash, restore and permanent deletion workflows
- LINE account connection support
- SMTP and LINE configuration testing

## Technology Stack

| Area           | Technology                |
| -------------- | ------------------------- |
| Framework      | Next.js 16 App Router     |
| UI             | React 19                  |
| Language       | JavaScript                |
| Styling        | Tailwind CSS 4            |
| Authentication | Firebase Authentication   |
| Database       | Cloud Firestore           |
| File storage   | Firebase Storage          |
| Server SDK     | Firebase Admin SDK        |
| Validation     | Zod                       |
| Forms          | React Hook Form           |
| HTTP client    | Axios                     |
| Localization   | i18next and react-i18next |
| Rich text      | TipTap                    |
| Icons          | React Icons               |
| Notifications  | Sonner and SweetAlert2    |
| Data fetching  | SWR                       |
| Animation      | Framer Motion             |
| Sliders        | Swiper                    |
| Email          | Nodemailer                |
| Theme          | next-themes               |
| Deployment     | Vercel                    |

## Requirements

- Node.js 24 or a compatible supported Node.js release
- npm
- Firebase project
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Admin service account
- Vercel account for production deployment

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/SmallDevStudio/hcs-th.git
cd hcs-th
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the local environment file

PowerShell:

```powershell
Copy-Item ".env.example" ".env.local"
```

Command Prompt:

```cmd
copy .env.example .env.local
```

Linux or macOS:

```bash
cp .env.example .env.local
```

Fill in the required Firebase and authentication values before starting the application.

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The root route redirects to the English public website:

```text
http://localhost:3000/en
```

The Admin login page is available at:

```text
http://localhost:3000/admin/login
```

## Environment Variables

Use `.env.example` as the reference.

Never commit `.env.local`, service-account credentials, private keys or production secrets.

### Application

| Variable               | Description              |
| ---------------------- | ------------------------ |
| `NEXT_PUBLIC_SITE_URL` | Public base URL          |
| `NEXT_PUBLIC_APP_NAME` | Application display name |

### Firebase Client SDK

These values are used by the browser application.

| Variable                                   |
| ------------------------------------------ |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`      |

### Firebase Admin SDK

These values are server-only and must never use the `NEXT_PUBLIC_` prefix.

| Variable                        |
| ------------------------------- |
| `FIREBASE_ADMIN_PROJECT_ID`     |
| `FIREBASE_ADMIN_CLIENT_EMAIL`   |
| `FIREBASE_ADMIN_PRIVATE_KEY`    |
| `FIREBASE_ADMIN_STORAGE_BUCKET` |

`FIREBASE_ADMIN_PRIVATE_KEY` may contain escaped `\n` newline characters.

### Authentication

| Variable                   | Description                                      |
| -------------------------- | ------------------------------------------------ |
| `AUTH_SESSION_COOKIE_NAME` | Admin session-cookie name                        |
| `AUTH_SESSION_MAX_AGE`     | Session lifetime in seconds                      |
| `AUTH_SECRET`              | Secret used for secure authentication operations |

Generate a secure value:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Revalidation and scheduled jobs

| Variable            | Description                                      |
| ------------------- | ------------------------------------------------ |
| `REVALIDATE_SECRET` | Secret reserved for protected cache revalidation |
| `CRON_SECRET`       | Secret used to protect scheduled-job endpoints   |

Generate different values for each secret.

### Initial Super Admin

| Variable                   | Description                |
| -------------------------- | -------------------------- |
| `BOOTSTRAP_ADMIN_EMAIL`    | Initial Super Admin email  |
| `BOOTSTRAP_ADMIN_PASSWORD` | Temporary initial password |
| `BOOTSTRAP_ADMIN_NAME`     | Initial administrator name |

Remove `BOOTSTRAP_ADMIN_PASSWORD` after the initial Super Admin has been created.

Do not configure bootstrap credentials in Vercel Production after setup is complete.

### Email configuration

| Variable                       | Description                                        |
| ------------------------------ | -------------------------------------------------- |
| `SMTP_SETTINGS_ENCRYPTION_KEY` | Encryption key for SMTP settings stored by the CMS |

SMTP server details are managed through Admin Site Settings.

### Optional integrations

| Variable                               | Description                     |
| -------------------------------------- | ------------------------------- |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google verification fallback    |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION`   | Bing verification fallback      |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`        | Google Analytics measurement ID |

Primary search-engine and integration settings can be managed through Admin Site Settings.

## Available Scripts

| Command                   | Description                         |
| ------------------------- | ----------------------------------- |
| `npm run dev`             | Start the development server        |
| `npm run build`           | Create a production build           |
| `npm run start`           | Start the production server         |
| `npm run lint`            | Run ESLint                          |
| `npm run bootstrap:admin` | Create the initial Super Admin      |
| `npm run seed:categories` | Seed the initial product categories |
| `npm run seed:about`      | Seed the initial About page content |

## Initial Setup

### Create the initial Super Admin

Add the bootstrap credentials to `.env.local`, then run:

```bash
npm run bootstrap:admin
```

After successful creation:

1. Remove `BOOTSTRAP_ADMIN_PASSWORD` from `.env.local`.
2. Sign in at `/admin/login`.
3. Change the initial password when required.
4. Confirm the Super Admin permissions.
5. Configure company and contact information in Site Settings.

### Seed product categories

```bash
npm run seed:categories
```

The seed is designed to avoid unintentionally overwriting existing Admin content.

### Seed the About page

```bash
npm run seed:about
```

The About seed will stop when an existing document contains Admin content unless an explicitly supported replacement condition is met.

## Public Routes

All public routes are locale-aware.

Replace `[locale]` with `en` or `th`.

| Route                                        | Description                                     |
| -------------------------------------------- | ----------------------------------------------- |
| `/[locale]`                                  | Home page                                       |
| `/[locale]/about`                            | About HCS                                       |
| `/[locale]/products`                         | Product catalogue                               |
| `/[locale]/products/category/[categorySlug]` | Products by category                            |
| `/[locale]/products/[slug]`                  | Product details                                 |
| `/[locale]/solutions`                        | Solutions                                       |
| `/[locale]/projects`                         | Project references                              |
| `/[locale]/projects/[slug]`                  | Project details                                 |
| `/[locale]/standards`                        | Standards and certifications                    |
| `/[locale]/contact`                          | Contact HCS                                     |
| `/[locale]/privacy`                          | Privacy Policy                                  |
| `/[locale]/terms`                            | Terms of Use                                    |
| `/[locale]/privacy-policy`                   | Legacy alias redirecting to `/[locale]/privacy` |

## Admin Routes

| Route                    | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `/admin/login`           | Administrator login                            |
| `/admin/dashboard`       | Dashboard                                      |
| `/admin/home`            | Home Hero management                           |
| `/admin/about`           | About Builder                                  |
| `/admin/about/preview`   | About draft preview                            |
| `/admin/site-settings`   | Company, contact, SEO and integration settings |
| `/admin/categories`      | Product categories                             |
| `/admin/products`        | Products and bulk management                   |
| `/admin/solutions`       | Solutions                                      |
| `/admin/projects`        | Project references                             |
| `/admin/standards`       | Standards and certificates                     |
| `/admin/media`           | Media Library                                  |
| `/admin/messages`        | Contact messages                               |
| `/admin/users`           | Administrators                                 |
| `/admin/user-groups`     | Permission groups                              |
| `/admin/account`         | Current administrator account                  |
| `/admin/audit-logs`      | Audit history                                  |
| `/admin/trash`           | Deleted records                                |
| `/admin/change-password` | Required password-change flow                  |

## Roles and Permissions

The system supports the following primary roles:

| Role         | Description                                                           |
| ------------ | --------------------------------------------------------------------- |
| `superadmin` | Full system access, including sensitive administration operations     |
| `admin`      | Content and administrator management according to granted permissions |
| `editor`     | Content access according to assigned permissions and groups           |

Permissions are enforced by server-side API routes and page authorization.

Hiding a menu or button in the browser does not replace server-side permission checks.

## Content Workflows

### Draft and publish

Content that supports publishing should be prepared and reviewed before it becomes visible publicly.

The About Builder provides:

- Draft editing
- Automatic saving
- Optimistic version control
- Preview of unpublished content
- Publish
- Unpublish
- Media relationship tracking
- Audit logging

### Product management

Admin Product Management includes:

- Search and filters
- Filtered result totals
- Configurable page sizes
- Cursor-based pagination
- Direct status selection
- Multiple-row selection
- Bulk publish
- Bulk unpublish
- Bulk deactivate
- Bulk delete
- Product ordering when the active view allows it

### Deletion

Normal deletion uses a recoverable Trash workflow where supported.

Permanent deletion requires the appropriate permission and should be used only when recovery is no longer required.

### Audit Logs

Important administrator operations are recorded with information such as:

- Acting administrator
- Action
- Entity type
- Entity ID
- Previous values
- Updated values
- Date and time
- Request metadata where available

## Project Structure

```text
src/
├── app/
│   ├── [locale]/
│   │   ├── about/
│   │   ├── contact/
│   │   ├── privacy/
│   │   ├── privacy-policy/
│   │   ├── products/
│   │   ├── projects/
│   │   ├── solutions/
│   │   ├── standards/
│   │   └── terms/
│   ├── admin/
│   │   ├── (auth)/
│   │   └── (dashboard)/
│   └── api/
│       ├── cron/
│       └── v1/
├── components/
│   ├── admin/
│   ├── common/
│   ├── content/
│   └── public/
├── config/
├── constants/
├── content/
├── i18n/
│   └── locales/
│       ├── admin/
│       └── public/
├── lib/
│   ├── api/
│   ├── auth/
│   └── firebase/
├── modules/
├── services/
└── styles/
```

Additional root-level configuration includes:

```text
firebase.json
firestore.indexes.json
firestore.rules
storage.rules
vercel.json
```

## API Design

Administrative API routes use the `/api/v1` prefix.

Examples:

```text
/api/v1/auth
/api/v1/about
/api/v1/categories
/api/v1/contact-messages
/api/v1/home/heroes
/api/v1/media
/api/v1/products
/api/v1/projects
/api/v1/site-settings
/api/v1/solutions
/api/v1/standards
/api/v1/trash
/api/v1/user-groups
/api/v1/users
```

API responses follow a consistent structure:

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {},
  "meta": {}
}
```

Validation errors use HTTP status `422`, while authentication and permission failures use the appropriate `401` or `403` response.

## Firebase

The project uses:

- Firebase Authentication for administrator identities
- Cloud Firestore for content and system records
- Firebase Storage for images and documents
- Firebase Admin SDK for trusted server operations

Deploy Firebase configuration when rules or indexes change:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Review all security rules before production deployment.

## Quality Checks

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Both commands should pass before deployment.

## Deployment

### GitHub

Review the pending changes:

```bash
git status
```

Stage the intended files:

```bash
git add .
```

Commit:

```bash
git commit -m "feat: update HCS website and CMS"
```

Push to the production branch:

```bash
git push origin master
```

### Vercel

When Vercel is connected to the GitHub repository, pushing to `master` starts the configured deployment automatically.

Production environment variables must be configured in Vercel separately from `.env.local`.

Never commit production secrets to Git.

## Security Notes

- Keep Firebase Admin credentials server-only.
- Never expose server secrets with the `NEXT_PUBLIC_` prefix.
- Do not commit `.env.local`.
- Use different secure values for authentication, revalidation and cron secrets.
- Remove bootstrap passwords after initial setup.
- Enforce permissions in server-side routes and services.
- Validate all request data.
- Restrict media types and upload sizes.
- Review Audit Logs regularly.
- Review Trash before permanent deletion.
- Review Firestore and Storage rules before deployment.
- Treat Privacy Policy and Terms content as legal documents requiring company review.

## Legal Content

The website includes:

- Privacy Policy at `/en/privacy` and `/th/privacy`
- Terms of Use at `/en/terms` and `/th/terms`
- A compatibility redirect from `/[locale]/privacy-policy`

The legal text supplied in the repository is a general website template. HCS should review and confirm:

- Registered company name
- Registered address
- Privacy contact
- Data-retention periods
- Analytics and cookie usage
- External service providers
- International data transfers
- Applicable contractual terms

Legal review should be completed before the final production launch.

## Maintenance

Recommended recurring maintenance:

- Keep dependencies and security patches current.
- Review administrator accounts and permission groups.
- Review Audit Logs for unexpected actions.
- Review deleted records in Trash.
- Remove expired or unused media.
- Test public contact submissions.
- Test SMTP and LINE integrations.
- Verify Firebase backups and security rules.
- Confirm legal content after business or regulatory changes.
- Update `CHANGELOG.md` for every production release.

## Repository

```text
https://github.com/SmallDevStudio/hcs-th
```
