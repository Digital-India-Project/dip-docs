# Service Catalogue and Product Guide

**Audience:** Customers, Partners, Operators, Business Users, Developers  
**Access Class:** Public  
**Owner:** `DIPINDIA` maintainers  
**Implementation Status:** Implemented and verified (`DIPINDIA/src/data/catalogue/categories.ts`)  
**Last Verified:** 2026-11-27

## 1. Important Positioning Notice

> [!NOTE]
> Digital India Project provides private assistance, form preparation, document coordination, and digital templates. Processing times, eligibility criteria, statutory approvals, and government fees depend on the applicable external authority and specific service configuration in the live catalogue. This documentation never invents pricing, eligibility rules, or official turnaround guarantees.

## 2. Verified Eight-Category Catalogue (`CAT_A` – `CAT_H`)

The `DIPINDIA` catalogue organizes all services and digital products into eight primary categories (`CATALOGUE_CATEGORIES`) plus bundled `SERVICE_PACKAGES`:

| Code | Slug | English Name | Hindi Name (`nameHi`) | Subcategories |
|---|---|---|---|---|
| `CAT_A` | `personal` | Personal & Citizen Services | व्यक्तिगत एवं नागरिक सेवाएं | PAN & Identity, Passport & Travel, Voter & Transport, State Certificates, Gazette & Digital Vault |
| `CAT_B` | `business-registration` | Business Registration & Startup | व्यवसाय पंजीकरण एवं स्टार्टअप सेवाएं | MSME & GST, Company & Firm Setup, Startup, DSC & Tax IDs, State & Food Licences, IP, GeM & Non-Profits |
| `CAT_C` | `tax-compliance` | Taxation & Compliance | कराधान एवं अनुपालन सेवाएं | Income Tax (ITR), GST Returns & Notices, TDS & Accounting, Payroll & Labour Law, ROC & Corporate Filings |
| `CAT_D` | `education-career` | Education & Career Services | शिक्षा एवं करियर सहायता सेवाएं | Admissions & Scholarships, Exams & Academic Docs, Verification Services, Career & Recruitment |
| `CAT_E` | `documentation` | Documentation & Legal Support | दस्तावेज़ीकरण एवं कानूनी सहायता | Affidavits & Declarations, Agreements & Deeds, Translation & Attestation, Coordination Support |
| `CAT_F` | `digital-products` | Digital Products & Downloads | डिजिटल उत्पाद एवं डाउनलोड टेम्प्लेट्स | Billing & Letterheads, Excel & Tax Spreadsheets, Checklists & Workbooks, Career Templates, Starter Bundles |
| `CAT_G` | `digital-technology` | Digital & Technology Services | डिजिटल एवं टेक्नोलॉजी सेवाएं | Websites & Stores, Domains, Email & Hosting, Automation & Chatbots, Marketing & SEO, Custom Engineering & APIs |
| `CAT_H` | `b2b-partner` | B2B, Partner & Reseller Services | बी2बी, पार्टनर एवं रीसेलर सेवाएं | Partner Onboarding, Bulk & API Verification, White-Label & Tools, Referral & Fulfilment |

Legacy v1 category slugs (`pan-identity`, `digilocker-docs`, `business-reg`, `taxation-compliance`, etc.) resolve automatically through `CATEGORY_SLUG_ALIASES` in `resolveCategorySlug()`.

## 3. Standard Service Submission Journey

1. **Catalogue Discovery:** Query `GET /api/v1/services` (or browse `/services` in `DIPINDIA`) to inspect `required_documents`, dynamic form fields, and current pricing.
2. **Application Creation:** Submit form data via `POST /api/v1/applications` (validated server-side by `validateFormSubmission`).
3. **Document Submission:** Upload supporting files (`application/pdf`, `image/jpeg`, `image/png`, `image/webp`) validated by magic-byte signature verification (`validateFileSignatureAndExtension`).
4. **Checkout & Payment:** Create an order (`POST /api/v1/payments/orders`) and verify payment confirmation before officer assignment.
5. **Review & Status Tracking:** Track progress from `Under Review` through `Completed` via `TrackPage` or `GET /api/v1/applications/:applicationId`.
6. **Digital Products (`CAT_F`):** Instant-download products are purchased (`POST /api/v1/products/:slug/purchase`) and downloaded (`GET /api/v1/products/:slug/download`) directly after payment verification.

## 4. Common Errors & Support Process

| Error Scenario | Cause | Resolution |
|---|---|---|
| Form validation failure | Missing required field or format mismatch in `ServiceFormField` | Correct highlighted fields using the service's schema requirements. |
| Unsupported file upload | Non-PDF/JPEG/PNG/WEBP file or spoofed extension | Export a valid PDF or image file matching its file signature. |
| Status paused at `Documents Required` / `Correction Required` | Blurry scan, expired proof, or mismatched name/details | Re-upload requested proof to move status to `Resubmitted`. |
| Payment stuck at `Payment Pending` | Webhook delay or incomplete gateway session | Run status sync (`GET /api/v1/payments/orders/:orderId/status`) or open a support ticket. |

**Support Escalation:** Authenticated users can open and track support tickets directly via `GET` / `POST /api/v1/tickets` and `POST /api/v1/tickets/:id/reply`.
