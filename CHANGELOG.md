# Changelog

All notable changes to the HCS Thailand Website & CMS will be documented in this file.

The project follows a simplified form of Semantic Versioning:

- `MAJOR` — incompatible architecture, API or data changes
- `MINOR` — new backward-compatible features
- `PATCH` — backward-compatible fixes and improvements

## [Unreleased]

### Added

### Changed

### Fixed

### Security

## [1.0.0] - 2026-09-14

### Added

#### Public Website

- English and Thai localized public routes
- English default locale
- Responsive public layout
- Light and dark themes
- Dynamic Header and Footer
- Dynamic company and contact information
- Home page content sections
- Product catalogue
- Product category pages
- Product detail pages
- Product filters
- Product pagination
- Solution pages
- Project-reference catalogue
- Project detail pages
- Standards and certification pages
- Contact page
- Contact enquiry form
- Contact file attachments
- Dynamic SEO metadata
- Canonical links
- Alternate-language metadata
- Open Graph metadata
- Twitter metadata
- Search-engine verification support
- Added general privacy, retention, disclosure and data-subject-right information for company reviews
- Contact-form Privacy Policy URL compatibility
- Privacy Policy pages for English and Thai
- Terms of Use pages for English and Thai
- Legacy Privacy Policy URL redirect

#### Administration

- Firebase administrator authentication
- Secure HTTP-only Admin session
- Required password-change workflow
- English and Thai Admin interface
- User language preference
- Role-based access control
- Permission-based access control
- Permission-based Admin navigation
- Responsive Admin layout
- Admin light and dark themes
- Dashboard
- Home Hero management
- Hero ordering
- About Builder
- TipTap rich-text editor
- Reusable rich-text component
- About draft auto-save
- About draft preview
- About publish and unpublish workflows
- Optimistic About draft version control
- Site Settings
- Company information management
- Contact information management
- Social-link management
- Default SEO management
- SMTP configuration and testing
- LINE integration configuration and testing
- Product category management
- Product category ordering
- Product management
- Product media relationships
- Product specifications
- Product finishes
- Product standards
- Product search and filtering
- Product result totals
- Product page-size selection
- Product cursor pagination
- Product multiple selection
- Bulk Product publish
- Bulk Product unpublish
- Bulk Product deactivate
- Bulk Product delete
- Direct Product status changes
- Product ordering
- Solution management
- Project-reference management
- Standards and certificate management
- Media Library
- Media upload workflow
- Media metadata editing
- Media usage tracking
- Contact-message management
- Administrator management
- Password-reset workflow
- Permission-group management
- Audit Logs
- Trash
- Record restoration
- Permission-controlled permanent deletion
- LINE account connection routes
- Scheduled media-cleanup endpoint
- Updated project documentation for the current Public Website and CMS scope

#### Platform

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Admin SDK
- Axios API client
- Zod request validation
- React Hook Form
- i18next localization
- TipTap rich-text editing
- SWR data fetching
- Sonner notifications
- SweetAlert2 confirmation dialogs
- Firestore rules
- Firestore indexes
- Firebase Storage rules
- Vercel deployment configuration
- Health-check endpoints
- Firebase health-check endpoint
- Super Admin bootstrap script
- Product-category seed script
- About-page seed script

### Changed

- Product Admin list changed from load-more behaviour to page navigation
- Product list supports configurable page sizes of 10, 20, 50 and 100
- Product API pagination includes filtered `total` and `totalPages`
- Published About content is separated from editable draft content
- Public About page retains fallback content until the first Admin publication
- Media usage is tracked across content relationships
- Admin permissions are enforced on server-side routes

### Fixed

- Product pagination displaying zero products despite loaded records
- Product pagination displaying incorrect total page count
- Product Next and Previous navigation
- Product Query and Project Query service separation
- Missing `getPublicHomeProjects` export
- About Builder auto-save loop
- React ref access during render in About Builder
- Missing React keys in rich-text rendering
- Product seed validation and script errors
- About seed protection for existing Admin content
- About draft preview availability

### Security

- Server-side Admin permission validation
- HTTP-only administrator sessions
- Zod API request validation
- Media-type and status validation
- Media relationship validation
- Optimistic version checks for About publishing
- Audit logging for administrative operations
- Recoverable deletion through Trash
- Permission-controlled permanent deletion
- Protected scheduled-job endpoint
- Server-only Firebase Admin configuration
