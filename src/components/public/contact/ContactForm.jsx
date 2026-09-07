"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  TbCheck,
  TbFileText,
  TbLoader2,
  TbPaperclip,
  TbSend,
  TbTrash,
  TbUpload,
} from "react-icons/tb";

import {
  submitContactMessage,
  uploadContactAttachment,
  validateContactAttachmentFile,
} from "@/services/http/contact-messages.api";

const INITIAL_FORM = {
  fullName: "",
  company: "",
  email: "",
  phone: "",
  enquiryType: "",
  productCategory: "",
  projectName: "",
  projectLocation: "",
  message: "",
  privacyAccepted: false,
  website: "",
};

const ENQUIRY_TYPES = [
  "product",
  "project",
  "technical",
  "partnership",
  "general",
];

const PRODUCT_CATEGORIES = [
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

function formatFileSize(bytes = 0) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ContactForm({ locale, content }) {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(INITIAL_FORM);

  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());

  const [attachment, setAttachment] = useState(null);

  const [uploadProgress, setUploadProgress] = useState(0);

  const [dragActive, setDragActive] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  function updateField(event) {
    const { name, value, type, checked } = event.currentTarget;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrorMessage("");
  }

  function selectAttachment(file) {
    if (!file) {
      return;
    }

    try {
      validateContactAttachmentFile(file);
      setAttachment(file);
      setUploadProgress(0);
      setErrorMessage("");
    } catch (error) {
      setAttachment(null);

      setErrorMessage(
        error?.code === "FILE_TOO_LARGE"
          ? content.errors.attachmentSize
          : content.errors.attachmentType,
      );
    }
  }

  function handleFileChange(event) {
    selectAttachment(event.currentTarget.files?.[0]);

    event.currentTarget.value = "";
  }

  function removeAttachment() {
    setAttachment(null);
    setUploadProgress(0);
  }

  function validateForm() {
    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.enquiryType ||
      !form.message.trim()
    ) {
      return content.errors.required;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return content.errors.email;
    }

    if (form.message.trim().length < 10) {
      return content.errors.message;
    }

    if (!form.privacyAccepted) {
      return content.errors.privacy;
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const abortController = new AbortController();

    setSubmitting(true);
    setErrorMessage("");

    try {
      let attachmentUploadToken = "";

      if (attachment) {
        const uploaded = await uploadContactAttachment({
          file: attachment,
          signal: abortController.signal,

          onProgress: ({ percentage }) => {
            setUploadProgress(percentage);
          },
        });

        attachmentUploadToken = uploaded.uploadToken;
      }

      await submitContactMessage({
        signal: abortController.signal,

        input: {
          fullName: form.fullName.trim(),
          company: form.company.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),

          enquiryType: form.enquiryType,

          productCategory: form.productCategory,

          projectName: form.projectName.trim(),

          projectLocation: form.projectLocation.trim(),

          message: form.message.trim(),

          attachmentUploadToken,

          locale,
          privacyAccepted: form.privacyAccepted,

          website: form.website,

          formStartedAt,
        },
      });

      setSubmitted(true);
      setForm(INITIAL_FORM);
      setAttachment(null);
      setUploadProgress(0);
    } catch (error) {
      setErrorMessage(
        attachment && uploadProgress < 100
          ? content.errors.attachmentUpload
          : error?.message || content.errors.submit,
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setSubmitted(false);
    setForm(INITIAL_FORM);
    setAttachment(null);
    setUploadProgress(0);
    setErrorMessage("");
    setFormStartedAt(Date.now());
  }

  if (submitted) {
    return (
      <section className="flex min-h-[450px] flex-col items-center justify-center rounded-md border border-[#d3e1eb] bg-white px-6 py-12 text-center shadow-sm dark:border-border dark:bg-surface">
        <span className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
          <TbCheck aria-hidden="true" className="size-8" />
        </span>

        <h2 className="mt-6 text-2xl font-extrabold text-[#071b30] dark:text-white">
          {content.successTitle}
        </h2>

        <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
          {content.successDescription}
        </p>

        <button
          type="button"
          onClick={resetForm}
          className="mt-6 min-h-11 rounded bg-primary px-6 text-sm font-bold text-white transition hover:bg-primary-hover"
        >
          {content.sendAnother}
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-[#d3e1eb] bg-white p-5 shadow-sm dark:border-border dark:bg-surface sm:p-6">
      <h2 className="text-2xl font-extrabold uppercase leading-none text-[#071b30] dark:text-white">
        {content.title}
      </h2>

      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {content.description}
      </p>

      <form onSubmit={handleSubmit} className="mt-5" noValidate>
        <input
          type="text"
          name="website"
          value={form.website}
          onChange={updateField}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[10000px] h-px w-px overflow-hidden"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            name="fullName"
            value={form.fullName}
            onChange={updateField}
            label={content.fields.fullName}
            placeholder={content.fields.fullNamePlaceholder}
            required
          />

          <FormInput
            name="company"
            value={form.company}
            onChange={updateField}
            label={content.fields.company}
            placeholder={content.fields.companyPlaceholder}
          />

          <FormInput
            type="email"
            name="email"
            value={form.email}
            onChange={updateField}
            label={content.fields.email}
            placeholder={content.fields.emailPlaceholder}
            required
          />

          <FormInput
            type="tel"
            name="phone"
            value={form.phone}
            onChange={updateField}
            label={content.fields.phone}
            placeholder={content.fields.phonePlaceholder}
          />

          <FormSelect
            name="enquiryType"
            value={form.enquiryType}
            onChange={updateField}
            label={content.fields.enquiryType}
            placeholder={content.fields.enquiryTypePlaceholder}
            required
            options={ENQUIRY_TYPES.map((value) => ({
              value,
              label: content.enquiryTypes[value],
            }))}
          />

          <FormSelect
            name="productCategory"
            value={form.productCategory}
            onChange={updateField}
            label={content.fields.productCategory}
            placeholder={content.fields.productCategoryPlaceholder}
            options={PRODUCT_CATEGORIES.map((value) => ({
              value,
              label: content.productCategories[value],
            }))}
          />

          <FormInput
            name="projectName"
            value={form.projectName}
            onChange={updateField}
            label={content.fields.projectName}
            placeholder={content.fields.projectNamePlaceholder}
          />

          <FormInput
            name="projectLocation"
            value={form.projectLocation}
            onChange={updateField}
            label={content.fields.projectLocation}
            placeholder={content.fields.projectLocationPlaceholder}
          />
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-bold text-[#18334d] dark:text-foreground">
            {content.fields.message}

            <span aria-hidden="true" className="ml-1 text-red-500">
              *
            </span>
          </span>

          <textarea
            name="message"
            value={form.message}
            onChange={updateField}
            rows={4}
            maxLength={5000}
            placeholder={content.fields.messagePlaceholder}
            required
            className="mt-1.5 w-full resize-y rounded border border-[#cbdbe7] bg-white px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-border dark:bg-background"
          />
        </label>

        <div className="mt-4">
          <p className="text-xs font-bold text-[#18334d] dark:text-foreground">
            {content.fields.attachment}
          </p>

          {attachment ? (
            <div className="mt-1.5 rounded border border-[#cbdbe7] bg-[#f6f9fb] p-3 dark:border-border dark:bg-background">
              <div className="flex items-center gap-3">
                <TbFileText
                  aria-hidden="true"
                  className="size-7 shrink-0 text-primary"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-foreground">
                    {attachment.name}
                  </p>

                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={removeAttachment}
                  disabled={submitting}
                  aria-label={content.fields.removeAttachment}
                  className="flex size-9 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/30"
                >
                  <TbTrash aria-hidden="true" className="size-5" />
                </button>
              </div>

              {submitting && uploadProgress > 0 ? (
                <div className="mt-3">
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-primary transition-[width]"
                      style={{
                        width: `${uploadProgress}%`,
                      }}
                    />
                  </div>

                  <p className="mt-1.5 text-right text-[10px] font-bold text-primary">
                    {uploadProgress}%
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragActive(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);

                selectAttachment(event.dataTransfer.files?.[0]);
              }}
              className={`mt-1.5 flex min-h-[70px] w-full items-center justify-center gap-3 rounded border border-dashed px-4 text-center transition ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-[#b9cddd] bg-[#f8fbfd] hover:border-primary dark:border-border dark:bg-background"
              }`}
            >
              <TbUpload aria-hidden="true" className="size-5 text-primary" />

              <span>
                <span className="block text-xs font-bold text-primary">
                  {content.fields.attachmentAction}
                </span>

                <span className="mt-1 block text-[10px] text-muted-foreground">
                  {content.fields.attachmentHelp}
                </span>
              </span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            name="privacyAccepted"
            checked={form.privacyAccepted}
            onChange={updateField}
            className="mt-0.5 size-4 rounded border-[#aebfcd] accent-primary"
          />

          <span className="text-[11px] leading-5 text-muted-foreground">
            {content.fields.privacyPrefix}{" "}
            <Link
              href={`/${locale}/privacy-policy`}
              className="font-bold text-primary hover:underline"
            >
              {content.fields.privacyLink}
            </Link>
          </span>
        </label>

        {errorMessage ? (
          <p
            role="alert"
            className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          >
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 items-center justify-center gap-3 rounded bg-primary px-6 text-xs font-extrabold uppercase tracking-[0.04em] text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <TbLoader2
                aria-hidden="true"
                className="size-[18px] animate-spin"
              />
            ) : attachment ? (
              <TbPaperclip aria-hidden="true" className="size-[18px]" />
            ) : (
              <TbSend aria-hidden="true" className="size-[18px]" />
            )}

            <span>
              {submitting
                ? attachment && uploadProgress < 100
                  ? content.uploading
                  : content.submitting
                : content.submit}
            </span>
          </button>

          <p className="text-[10px] leading-5 text-muted-foreground">
            {content.responseTime}
          </p>
        </div>
      </form>
    </section>
  );
}

function FormInput({
  type = "text",
  name,
  value,
  onChange,
  label,
  placeholder,
  required = false,
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-[#18334d] dark:text-foreground">
        {label}

        {required ? (
          <span aria-hidden="true" className="ml-1 text-red-500">
            *
          </span>
        ) : null}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={200}
        className="mt-1.5 h-10 w-full rounded border border-[#cbdbe7] bg-white px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-border dark:bg-background"
      />
    </label>
  );
}

function FormSelect({
  name,
  value,
  onChange,
  label,
  placeholder,
  options,
  required = false,
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-[#18334d] dark:text-foreground">
        {label}

        {required ? (
          <span aria-hidden="true" className="ml-1 text-red-500">
            *
          </span>
        ) : null}
      </span>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1.5 h-10 w-full rounded border border-[#cbdbe7] bg-white px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-border dark:bg-background"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
