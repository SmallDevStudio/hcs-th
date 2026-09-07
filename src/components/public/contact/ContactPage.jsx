"use client";

import { useTranslation } from "react-i18next";

import { ContactForm } from "@/components/public/contact/ContactForm";
import { ContactHero } from "@/components/public/contact/ContactHero";
import { ContactInformation } from "@/components/public/contact/ContactInformation";
import { ContactLocationSection } from "@/components/public/contact/ContactLocationSection";
import { ContactSupportSection } from "@/components/public/contact/ContactSupportSection";

const ENQUIRY_TYPE_KEYS = [
  "product",
  "project",
  "technical",
  "partnership",
  "general",
];

const PRODUCT_CATEGORY_KEYS = [
  "door-closers",
  "lever-handles",
  "locks-cylinders",
  "hinges",
  "panic-exit-hardware",
  "door-window-seals",
  "fire-doors",
  "electronic-locks",
  "other",
];

const SUPPORT_KEYS = ["product", "project", "technical", "partnership"];

const SOCIAL_KEYS = ["facebook", "instagram", "youtube", "linkedin", "line"];

export function ContactPage({ locale = "en", settings }) {
  const { t } = useTranslation("public");

  const currentLocale = locale === "th" ? "th" : "en";

  const enquiryTypes = Object.fromEntries(
    ENQUIRY_TYPE_KEYS.map((key) => [
      key,
      t(`contact.form.enquiryTypes.${key}`),
    ]),
  );

  const productCategories = Object.fromEntries(
    PRODUCT_CATEGORY_KEYS.map((key) => [
      key,
      t(`contact.form.productCategories.${key}`),
    ]),
  );

  const supportItems = Object.fromEntries(
    SUPPORT_KEYS.map((key) => [
      key,
      {
        title: t(`contact.support.items.${key}.title`),

        description: t(`contact.support.items.${key}.description`),
      },
    ]),
  );

  const socialLabels = Object.fromEntries(
    SOCIAL_KEYS.map((key) => [
      key,
      t(`contact.information.socialLabels.${key}`),
    ]),
  );

  return (
    <>
      <ContactHero
        locale={currentLocale}
        content={{
          breadcrumbHome: t("contact.hero.breadcrumbHome"),

          breadcrumbContact: t("contact.hero.breadcrumbContact"),

          breadcrumbLabel: t("contact.hero.breadcrumbLabel"),

          eyebrow: t("contact.hero.eyebrow"),

          title: t("contact.hero.title"),

          description: t("contact.hero.description"),

          imageAlt: t("contact.hero.imageAlt"),
        }}
      />

      <section className="bg-white py-12 sm:py-14 lg:py-16 dark:bg-background">
        <div className="container-hcs">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(300px,0.78fr)_minmax(0,1.22fr)] lg:gap-14">
            <ContactInformation
              locale={currentLocale}
              settings={settings}
              content={{
                eyebrow: t("contact.information.eyebrow"),

                title: t("contact.information.title"),

                description: t("contact.information.description"),

                callUs: t("contact.information.callUs"),

                emailUs: t("contact.information.emailUs"),

                visitUs: t("contact.information.visitUs"),

                officeHours: t("contact.information.officeHours"),

                followUs: t("contact.information.followUs"),

                secondaryPhone: t("contact.information.secondaryPhone"),

                salesEmail: t("contact.information.salesEmail"),

                socialLabels,
              }}
            />

            <ContactForm
              locale={currentLocale}
              content={{
                title: t("contact.form.title"),

                description: t("contact.form.description"),

                fields: {
                  fullName: t("contact.form.fields.fullName"),

                  fullNamePlaceholder: t(
                    "contact.form.fields.fullNamePlaceholder",
                  ),

                  company: t("contact.form.fields.company"),

                  companyPlaceholder: t(
                    "contact.form.fields.companyPlaceholder",
                  ),

                  email: t("contact.form.fields.email"),

                  emailPlaceholder: t("contact.form.fields.emailPlaceholder"),

                  phone: t("contact.form.fields.phone"),

                  phonePlaceholder: t("contact.form.fields.phonePlaceholder"),

                  enquiryType: t("contact.form.fields.enquiryType"),

                  enquiryTypePlaceholder: t(
                    "contact.form.fields.enquiryTypePlaceholder",
                  ),

                  productCategory: t("contact.form.fields.productCategory"),

                  productCategoryPlaceholder: t(
                    "contact.form.fields.productCategoryPlaceholder",
                  ),

                  projectName: t("contact.form.fields.projectName"),

                  projectNamePlaceholder: t(
                    "contact.form.fields.projectNamePlaceholder",
                  ),

                  projectLocation: t("contact.form.fields.projectLocation"),

                  projectLocationPlaceholder: t(
                    "contact.form.fields.projectLocationPlaceholder",
                  ),

                  message: t("contact.form.fields.message"),

                  messagePlaceholder: t(
                    "contact.form.fields.messagePlaceholder",
                  ),

                  attachment: t("contact.form.fields.attachment"),

                  attachmentAction: t("contact.form.fields.attachmentAction"),

                  attachmentHelp: t("contact.form.fields.attachmentHelp"),

                  removeAttachment: t("contact.form.fields.removeAttachment"),

                  privacyPrefix: t("contact.form.fields.privacyPrefix"),

                  privacyLink: t("contact.form.fields.privacyLink"),
                },

                enquiryTypes,
                productCategories,

                submit: t("contact.form.submit"),

                submitting: t("contact.form.submitting"),

                uploading: t("contact.form.uploading"),

                responseTime: t("contact.form.responseTime"),

                successTitle: t("contact.form.successTitle"),

                successDescription: t("contact.form.successDescription"),

                sendAnother: t("contact.form.sendAnother"),

                errors: {
                  required: t("contact.form.errors.required"),

                  email: t("contact.form.errors.email"),

                  message: t("contact.form.errors.message"),

                  privacy: t("contact.form.errors.privacy"),

                  attachmentType: t("contact.form.errors.attachmentType"),

                  attachmentSize: t("contact.form.errors.attachmentSize"),

                  attachmentUpload: t("contact.form.errors.attachmentUpload"),

                  submit: t("contact.form.errors.submit"),
                },
              }}
            />
          </div>
        </div>
      </section>

      <ContactSupportSection
        content={{
          eyebrow: t("contact.support.eyebrow"),

          title: t("contact.support.title"),

          items: supportItems,
        }}
      />

      <ContactLocationSection
        locale={currentLocale}
        settings={settings}
        content={{
          eyebrow: t("contact.location.eyebrow"),

          title: t("contact.location.title"),

          mapTitle: t("contact.location.mapTitle"),

          mapUnavailable: t("contact.location.mapUnavailable"),

          getDirections: t("contact.location.getDirections"),
        }}
      />
    </>
  );
}
