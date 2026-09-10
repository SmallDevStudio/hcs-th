import { randomUUID } from "node:crypto";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const PROJECT_ROOT = process.cwd();

const ALLOW_REPLACE_EMPTY = process.argv.includes("--replace-empty");

const ABOUT_PAGE_ID = "about";

const COLLECTIONS = Object.freeze({
  PAGES: "pages",
  MEDIA: "media",
  AUDIT_LOGS: "auditLogs",
});

const ACTOR = Object.freeze({
  uid: "system:about-seed",
  email: null,
  displayName: "About Page Seed",
  role: "system",
});

const ABOUT_IMAGES = Object.freeze({
  hero: {
    fileName: "about-hero.jpg",

    folder: "about",

    title: {
      en: "About HCS Hero",
      th: "รูป Hero หน้าเกี่ยวกับ HCS",
    },

    altText: {
      en: "Modern commercial building entrance representing HCS architectural hardware solutions",
      th: "ทางเข้าอาคารพาณิชย์สมัยใหม่ที่สะท้อนโซลูชันอุปกรณ์ประตูสถาปัตยกรรมจาก HCS",
    },

    references: ["draft.seo.image", "draft.sections.about-hero.image"],
  },

  story: {
    fileName: "about-story.jpg",

    folder: "about",

    title: {
      en: "HCS Story",
      th: "เรื่องราวของ HCS",
    },

    altText: {
      en: "HCS specialists consulting with architects on architectural hardware specifications",
      th: "ผู้เชี่ยวชาญ HCS ให้คำปรึกษาแก่สถาปนิกเกี่ยวกับข้อกำหนดอุปกรณ์ประตู",
    },

    references: ["draft.sections.about-story.image"],
  },

  capabilities: {
    fileName: "about-capabilities.jpg",

    folder: "about",

    title: {
      en: "HCS Capabilities",
      th: "ความสามารถของ HCS",
    },

    altText: {
      en: "Precision architectural door hardware installed on a modern glass door",
      th: "อุปกรณ์ประตูสถาปัตยกรรมที่ติดตั้งอย่างแม่นยำบนประตูกระจกสมัยใหม่",
    },

    references: ["draft.sections.about-capabilities.image"],
  },

  commitment: {
    fileName: "about-commitment.jpg",

    folder: "about",

    title: {
      en: "HCS Quality Commitment",
      th: "คำมั่นสัญญาด้านคุณภาพของ HCS",
    },

    altText: {
      en: "Modern commercial building using quality architectural opening solutions",
      th: "อาคารพาณิชย์สมัยใหม่ที่ใช้โซลูชันระบบประตูคุณภาพสูง",
    },

    references: ["draft.sections.about-commitment.image"],
  },
});

function requireEnvironmentVariable(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function normalizePrivateKey(value) {
  return value.replace(/^"(.*)"$/s, "$1").replace(/\\n/g, "\n");
}

function initializeFirebaseAdmin() {
  const projectId = requireEnvironmentVariable("FIREBASE_ADMIN_PROJECT_ID");

  const clientEmail = requireEnvironmentVariable("FIREBASE_ADMIN_CLIENT_EMAIL");

  const privateKey = normalizePrivateKey(
    requireEnvironmentVariable("FIREBASE_ADMIN_PRIVATE_KEY"),
  );

  const storageBucket = requireEnvironmentVariable(
    "FIREBASE_ADMIN_STORAGE_BUCKET",
  );

  const app =
    getApps()[0] ||
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),

      storageBucket,
    });

  return {
    db: getFirestore(app),
    bucket: getStorage(app).bucket(),
  };
}

function createFirebaseDownloadUrl({ bucketName, storagePath, downloadToken }) {
  return [
    `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/`,
    encodeURIComponent(storagePath),
    `?alt=media&token=${downloadToken}`,
  ].join("");
}

function createLocalizedText(en = "", th = "") {
  return {
    en,
    th,
  };
}

function createTextNode(text) {
  return {
    type: "text",
    text,
  };
}

function createParagraphNode(text = "") {
  if (!text) {
    return {
      type: "paragraph",
    };
  }

  return {
    type: "paragraph",

    content: [createTextNode(text)],
  };
}

function createParagraphDocument(paragraphs = []) {
  const normalizedParagraphs = paragraphs
    .map((paragraph) => String(paragraph || "").trim())
    .filter(Boolean);

  return {
    type: "doc",

    content: normalizedParagraphs.length
      ? normalizedParagraphs.map(createParagraphNode)
      : [createParagraphNode()],
  };
}

function createBulletListNode(items = []) {
  return {
    type: "bulletList",

    content: items.map((item) => ({
      type: "listItem",

      content: [createParagraphNode(item)],
    })),
  };
}

function createDescriptionWithListDocument({ description, items }) {
  const content = [];

  if (description) {
    content.push(createParagraphNode(description));
  }

  const normalizedItems = items
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  if (normalizedItems.length) {
    content.push(createBulletListNode(normalizedItems));
  }

  return {
    type: "doc",

    content: content.length ? content : [createParagraphNode()],
  };
}

function createAction({ id, labelEn, labelTh, href, style = "primary" }) {
  return {
    id,

    label: createLocalizedText(labelEn, labelTh),

    href,

    style,

    openInNewTab: false,
  };
}

function createFeatureItem({
  id,
  titleEn,
  titleTh,
  descriptionEn,
  descriptionTh,
  valueEn = "",
  valueTh = "",
  icon = "",
  sortOrder,
}) {
  return {
    id,

    title: createLocalizedText(titleEn, titleTh),

    content: {
      en: createParagraphDocument([descriptionEn]),

      th: createParagraphDocument([descriptionTh]),
    },

    value: createLocalizedText(valueEn, valueTh),

    icon,

    imageMediaId: null,

    imageAlt: createLocalizedText(),

    sortOrder,
  };
}

function createLayout({
  variant,
  imagePosition = "none",
  imageRatio = "4/3",
  contentAlignment = "left",
  background = "white",
}) {
  return {
    variant,
    imagePosition,
    imageRatio,
    contentAlignment,
    background,
  };
}

function createMediaSearchTokens({ originalName, title, altText }) {
  const values = [
    originalName,
    title.en,
    title.th,
    altText.en,
    altText.th,
    "about",
    "hcs thailand",
  ];

  const tokens = values.flatMap((value) =>
    String(value || "")
      .toLocaleLowerCase()
      .split(/[\s,._\-()[\]{}]+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2),
  );

  return [...new Set(tokens)].slice(0, 100);
}

function createMediaSnapshot({
  mediaId,
  publicUrl,
  storagePath,
  originalName,
  title,
  altText,
}) {
  return {
    id: mediaId,
    publicUrl,
    storagePath,
    originalName,
    mimeType: "image/jpeg",
    width: null,
    height: null,
    title,
    altText,
  };
}

function createUsageReference(field) {
  return {
    entityType: "page",
    entityId: ABOUT_PAGE_ID,
    field,
  };
}

function createAuditDocument({
  action,
  entityType,
  entityId,
  before = null,
  after = null,
  metadata = {},
}) {
  return {
    actor: ACTOR,

    action,
    entityType,
    entityId,

    before,
    after,

    metadata: {
      source: "seed-about-page",
      ...metadata,
    },

    createdAt: Timestamp.now(),
  };
}

async function assertAboutImagesExist() {
  for (const image of Object.values(ABOUT_IMAGES)) {
    const filePath = path.join(
      PROJECT_ROOT,
      "public",
      "images",
      "about",
      image.fileName,
    );

    await access(filePath);
  }
}

async function uploadAboutImage({ bucket, imageKey, image }) {
  const mediaId = randomUUID();

  const downloadToken = randomUUID();

  const localPath = path.join(
    PROJECT_ROOT,
    "public",
    "images",
    "about",
    image.fileName,
  );

  const fileBuffer = await readFile(localPath);

  const fileStat = await stat(localPath);

  const storagePath = [
    "media",
    "images",
    "about",
    "seed",
    `${mediaId}.jpg`,
  ].join("/");

  const storageFile = bucket.file(storagePath);

  await storageFile.save(fileBuffer, {
    resumable: false,

    validation: "md5",

    metadata: {
      contentType: "image/jpeg",

      cacheControl: "public, max-age=31536000, immutable",

      metadata: {
        firebaseStorageDownloadTokens: downloadToken,

        source: "seed-about-page",

        imageKey,
      },
    },
  });

  const publicUrl = createFirebaseDownloadUrl({
    bucketName: bucket.name,
    storagePath,
    downloadToken,
  });

  return {
    mediaId,
    storageFile,
    storagePath,
    publicUrl,
    size: fileStat.size,

    snapshot: createMediaSnapshot({
      mediaId,
      publicUrl,
      storagePath,
      originalName: image.fileName,
      title: image.title,
      altText: image.altText,
    }),
  };
}

function createMediaDocument({ image, upload, now }) {
  const usedBy = image.references.map(createUsageReference);

  return {
    type: "image",
    status: "active",
    folder: image.folder,

    originalName: image.fileName,

    storagePath: upload.storagePath,
    publicUrl: upload.publicUrl,

    mimeType: "image/jpeg",
    extension: "jpg",
    size: upload.size,

    width: null,
    height: null,

    title: image.title,
    altText: image.altText,

    caption: createLocalizedText(),

    keywords: ["about", "hcs", "hcs thailand"],

    searchTokens: createMediaSearchTokens({
      originalName: image.fileName,
      title: image.title,
      altText: image.altText,
    }),

    isUsed: usedBy.length > 0,
    usageCount: usedBy.length,
    usedBy,

    checksum: null,

    isDeleted: false,
    deletedAt: null,
    deletedBy: null,

    failureReason: null,

    uploadExpiresAt: null,
    uploadedAt: now,

    createdAt: now,
    createdBy: ACTOR.uid,

    updatedAt: now,
    updatedBy: ACTOR.uid,
  };
}

function createAboutDraft({ media, now }) {
  return {
    seo: {
      title: createLocalizedText("About HCS", "เกี่ยวกับ HCS"),

      description: createLocalizedText(
        "Learn about HCS Thailand, our architectural hardware expertise, international standards and commitment to complete opening solutions.",
        "รู้จัก HCS Thailand ผู้เชี่ยวชาญด้านอุปกรณ์ประตูสถาปัตยกรรม มาตรฐานสากล และโซลูชันการเปิดประตูแบบครบวงจร",
      ),

      imageMediaId: media.hero.mediaId,

      image: media.hero.snapshot,

      imageAlt: createLocalizedText(
        "Modern commercial building entrance representing HCS architectural hardware solutions",
        "ทางเข้าอาคารพาณิชย์สมัยใหม่ที่สะท้อนโซลูชันอุปกรณ์ประตูสถาปัตยกรรมจาก HCS",
      ),
    },

    sections: [
      {
        id: "about-hero",

        type: "hero",

        enabled: true,

        internalLabel: createLocalizedText(
          "About Hero",
          "Hero หน้าเกี่ยวกับเรา",
        ),

        eyebrow: createLocalizedText("About HCS", "เกี่ยวกับ HCS"),

        title: createLocalizedText(
          "Engineered for Every Opening",
          "ออกแบบอย่างแม่นยำ สำหรับทุกช่องเปิด",
        ),

        content: {
          en: createParagraphDocument([
            "HCS (Thailand) delivers architectural door hardware and security solutions that make buildings safer, smarter and more people-friendly.",
          ]),

          th: createParagraphDocument([
            "HCS (ประเทศไทย) ส่งมอบอุปกรณ์ประตูสถาปัตยกรรมและระบบรักษาความปลอดภัยที่ช่วยให้อาคารปลอดภัย ชาญฉลาด และเป็นมิตรต่อผู้ใช้งานมากยิ่งขึ้น",
          ]),
        },

        imageMediaId: media.hero.mediaId,

        image: media.hero.snapshot,

        imageAlt: createLocalizedText(
          "Modern commercial building entrance representing HCS architectural hardware solutions",
          "ทางเข้าอาคารพาณิชย์สมัยใหม่ที่สะท้อนโซลูชันอุปกรณ์ประตูสถาปัตยกรรมจาก HCS",
        ),

        layout: createLayout({
          variant: "full-width",
          imagePosition: "background",
          imageRatio: "16/9",
          contentAlignment: "left",
          background: "dark",
        }),

        actions: [],

        items: [],

        sortOrder: 10,
      },

      {
        id: "about-story",

        type: "rich-content",

        enabled: true,

        internalLabel: createLocalizedText("Our Story", "เรื่องราวของเรา"),

        eyebrow: createLocalizedText("Our Story", "เรื่องราวของเรา"),

        title: createLocalizedText(
          "Hardware Consultancy Services",
          "ผู้เชี่ยวชาญด้านอุปกรณ์ประตูสถาปัตยกรรม",
        ),

        content: {
          en: createParagraphDocument([
            "Established in Thailand, HCS has grown to be a trusted partner for architects, consultants, contractors and building owners across the region. We provide complete architectural door hardware and security solutions, combining international standards with local expertise and dedicated support.",

            "From specification to after-sales, our team works closely with you to ensure every opening performs beautifully, safely and reliably — for today and for the future.",
          ]),

          th: createParagraphDocument([
            "HCS ก่อตั้งขึ้นในประเทศไทยและเติบโตเป็นพันธมิตรที่ได้รับความไว้วางใจจากสถาปนิก ที่ปรึกษา ผู้รับเหมา และเจ้าของอาคารทั่วภูมิภาค เรานำเสนอโซลูชันอุปกรณ์ประตูสถาปัตยกรรมและระบบรักษาความปลอดภัยแบบครบวงจร โดยผสานมาตรฐานสากลเข้ากับความเชี่ยวชาญในประเทศและการบริการอย่างใกล้ชิด",

            "ตั้งแต่การให้คำปรึกษาด้านข้อกำหนดไปจนถึงบริการหลังการขาย ทีมงานของเราทำงานร่วมกับลูกค้าอย่างใกล้ชิด เพื่อให้ทุกช่องเปิดมีความสวยงาม ปลอดภัย และทำงานได้อย่างน่าเชื่อถือ ทั้งในวันนี้และอนาคต",
          ]),
        },

        imageMediaId: media.story.mediaId,

        image: media.story.snapshot,

        imageAlt: createLocalizedText(
          "HCS specialists consulting with architects on architectural hardware specifications",
          "ผู้เชี่ยวชาญ HCS ให้คำปรึกษาแก่สถาปนิกเกี่ยวกับข้อกำหนดอุปกรณ์ประตู",
        ),

        layout: createLayout({
          variant: "split",
          imagePosition: "right",
          imageRatio: "4/3",
          contentAlignment: "left",
          background: "white",
        }),

        actions: [
          createAction({
            id: "about-story-action",

            labelEn: "Our History",
            labelTh: "ประวัติของเรา",

            href: "#values",

            style: "outline",
          }),
        ],

        items: [
          createFeatureItem({
            id: "about-story-experience",

            titleEn: "Years of Experience",
            titleTh: "ปีแห่งประสบการณ์",

            descriptionEn: "A proven track record in Thailand and beyond.",

            descriptionTh:
              "ผลงานที่ได้รับการยอมรับทั้งในประเทศไทยและต่างประเทศ",

            valueEn: "25+",
            valueTh: "25+",

            icon: "experience",

            sortOrder: 10,
          }),
        ],

        sortOrder: 20,
      },

      {
        id: "about-values",

        type: "feature-grid",

        enabled: true,

        internalLabel: createLocalizedText("Our Values", "คุณค่าของเรา"),

        eyebrow: createLocalizedText("Our Values", "คุณค่าของเรา"),

        title: createLocalizedText("What Drives Us", "สิ่งที่ขับเคลื่อนเรา"),

        content: {
          en: createParagraphDocument([]),
          th: createParagraphDocument([]),
        },

        imageMediaId: null,
        image: null,

        imageAlt: createLocalizedText(),

        layout: createLayout({
          variant: "grid",
          imagePosition: "none",
          imageRatio: "1/1",
          contentAlignment: "left",
          background: "muted",
        }),

        actions: [],

        items: [
          createFeatureItem({
            id: "about-value-total-solutions",

            titleEn: "Total Solutions",
            titleTh: "โซลูชันครบวงจร",

            descriptionEn:
              "Complete architectural hardware and security solutions for every type of building.",

            descriptionTh:
              "อุปกรณ์ประตูสถาปัตยกรรมและระบบรักษาความปลอดภัยที่ครบถ้วนสำหรับอาคารทุกประเภท",

            icon: "settings",

            sortOrder: 10,
          }),

          createFeatureItem({
            id: "about-value-international-standards",

            titleEn: "International Standards",
            titleTh: "มาตรฐานระดับสากล",

            descriptionEn:
              "Products and systems that meet global performance and safety standards.",

            descriptionTh:
              "ผลิตภัณฑ์และระบบที่ผ่านข้อกำหนดด้านประสิทธิภาพและความปลอดภัยระดับโลก",

            icon: "world",

            sortOrder: 20,
          }),

          createFeatureItem({
            id: "about-value-technical-expertise",

            titleEn: "Technical Expertise",
            titleTh: "ความเชี่ยวชาญทางเทคนิค",

            descriptionEn:
              "Experienced specialists who understand complex building requirements.",

            descriptionTh:
              "ทีมผู้เชี่ยวชาญที่มีประสบการณ์และเข้าใจข้อกำหนดของอาคารที่มีความซับซ้อน",

            icon: "building",

            sortOrder: 30,
          }),

          createFeatureItem({
            id: "about-value-trusted-partnership",

            titleEn: "Trusted Partnership",
            titleTh: "พันธมิตรที่ไว้วางใจได้",

            descriptionEn:
              "Long-term relationships built on integrity, responsiveness and service.",

            descriptionTh:
              "ความสัมพันธ์ระยะยาวที่สร้างขึ้นจากความซื่อสัตย์ การตอบสนอง และการบริการ",

            icon: "users",

            sortOrder: 40,
          }),
        ],

        sortOrder: 30,
      },

      {
        id: "about-capabilities",

        type: "rich-content",

        enabled: true,

        internalLabel: createLocalizedText(
          "Our Capabilities",
          "ความสามารถของเรา",
        ),

        eyebrow: createLocalizedText("Our Capabilities", "ความสามารถของเรา"),

        title: createLocalizedText(
          "Built on Knowledge. Delivered with Precision.",
          "สร้างจากองค์ความรู้ ส่งมอบด้วยความแม่นยำ",
        ),

        content: {
          en: createDescriptionWithListDocument({
            description:
              "We combine product knowledge, application experience and project support to help you achieve the right solution for every opening.",

            items: [
              "Specification support and product consultation",
              "Complete range of architectural door hardware",
              "Integration with access control and security systems",
              "Project coordination and on-site support",
              "After-sales service and maintenance guidance",
            ],
          }),

          th: createDescriptionWithListDocument({
            description:
              "เราผสานความรู้ด้านผลิตภัณฑ์ ประสบการณ์ในการประยุกต์ใช้งาน และการสนับสนุนโครงการ เพื่อช่วยให้คุณได้โซลูชันที่เหมาะสมสำหรับทุกช่องเปิด",

            items: [
              "ให้คำปรึกษาด้านข้อกำหนดและการเลือกผลิตภัณฑ์",
              "ผลิตภัณฑ์อุปกรณ์ประตูสถาปัตยกรรมที่ครบถ้วน",
              "รองรับการเชื่อมต่อกับระบบควบคุมการเข้าออกและความปลอดภัย",
              "ประสานงานโครงการและสนับสนุนการทำงานในพื้นที่",
              "บริการหลังการขายและคำแนะนำด้านการบำรุงรักษา",
            ],
          }),
        },

        imageMediaId: media.capabilities.mediaId,

        image: media.capabilities.snapshot,

        imageAlt: createLocalizedText(
          "Precision architectural door hardware installed on a modern glass door",
          "อุปกรณ์ประตูสถาปัตยกรรมที่ติดตั้งอย่างแม่นยำบนประตูกระจกสมัยใหม่",
        ),

        layout: createLayout({
          variant: "split",
          imagePosition: "left",
          imageRatio: "4/3",
          contentAlignment: "left",
          background: "white",
        }),

        actions: [],

        items: [],

        sortOrder: 40,
      },

      {
        id: "about-statistics",

        type: "statistics",

        enabled: true,

        internalLabel: createLocalizedText(
          "Company Statistics",
          "สถิติของบริษัท",
        ),

        eyebrow: createLocalizedText(),

        title: createLocalizedText("HCS in Numbers", "HCS ในตัวเลข"),

        content: {
          en: createParagraphDocument([]),
          th: createParagraphDocument([]),
        },

        imageMediaId: null,
        image: null,

        imageAlt: createLocalizedText(),

        layout: createLayout({
          variant: "grid",
          imagePosition: "none",
          imageRatio: "auto",
          contentAlignment: "center",
          background: "brand",
        }),

        actions: [],

        items: [
          createFeatureItem({
            id: "about-stat-experience",

            titleEn: "Years of Experience",
            titleTh: "ปีแห่งประสบการณ์",

            descriptionEn: "A proven track record in Thailand and beyond.",

            descriptionTh:
              "ผลงานที่ได้รับการยอมรับทั้งในประเทศไทยและต่างประเทศ",

            valueEn: "25+",
            valueTh: "25+",

            sortOrder: 10,
          }),

          createFeatureItem({
            id: "about-stat-projects",

            titleEn: "Projects",
            titleTh: "โครงการ",

            descriptionEn: "From commercial towers to public infrastructure.",

            descriptionTh: "ตั้งแต่อาคารพาณิชย์ไปจนถึงโครงสร้างพื้นฐานสาธารณะ",

            valueEn: "1,000+",
            valueTh: "1,000+",

            sortOrder: 20,
          }),

          createFeatureItem({
            id: "about-stat-partners",

            titleEn: "Partners",
            titleTh: "พันธมิตร",

            descriptionEn: "Trusted global brands and local collaborators.",

            descriptionTh: "แบรนด์ระดับโลกและพันธมิตรในประเทศที่ไว้วางใจเรา",

            valueEn: "100+",
            valueTh: "100+",

            sortOrder: 30,
          }),

          createFeatureItem({
            id: "about-stat-markets",

            titleEn: "Core Markets",
            titleTh: "ตลาดหลัก",

            descriptionEn:
              "Commercial, Hospitality, Healthcare and Infrastructure.",

            descriptionTh:
              "อาคารพาณิชย์ โรงแรมและที่พัก สถานพยาบาล และโครงสร้างพื้นฐาน",

            valueEn: "4",
            valueTh: "4",

            sortOrder: 40,
          }),
        ],

        sortOrder: 50,
      },

      {
        id: "about-commitment",

        type: "cta",

        enabled: true,

        internalLabel: createLocalizedText(
          "Our Commitment",
          "คำมั่นสัญญาของเรา",
        ),

        eyebrow: createLocalizedText("Our Commitment", "คำมั่นสัญญาของเรา"),

        title: createLocalizedText(
          "Quality Without Compromise",
          "คุณภาพที่ไม่ประนีประนอม",
        ),

        content: {
          en: createParagraphDocument([
            "We work with leading international manufacturers and follow recognized standards to ensure safety, durability and long-term performance. Our solutions are selected and supported with a focus on compliance, reliability and total cost of ownership.",
          ]),

          th: createParagraphDocument([
            "เราร่วมงานกับผู้ผลิตชั้นนำระดับสากลและยึดถือมาตรฐานที่ได้รับการยอมรับ เพื่อให้มั่นใจในความปลอดภัย ความทนทาน และประสิทธิภาพในระยะยาว ทุกโซลูชันได้รับการคัดเลือกและสนับสนุนโดยให้ความสำคัญกับการปฏิบัติตามมาตรฐาน ความน่าเชื่อถือ และต้นทุนการเป็นเจ้าของตลอดอายุการใช้งาน",
          ]),
        },

        imageMediaId: media.commitment.mediaId,

        image: media.commitment.snapshot,

        imageAlt: createLocalizedText(
          "Modern commercial building using quality architectural opening solutions",
          "อาคารพาณิชย์สมัยใหม่ที่ใช้โซลูชันระบบประตูคุณภาพสูง",
        ),

        layout: createLayout({
          variant: "split",
          imagePosition: "left",
          imageRatio: "16/9",
          contentAlignment: "left",
          background: "white",
        }),

        actions: [
          createAction({
            id: "about-commitment-action",

            labelEn: "View Standards",
            labelTh: "ดูมาตรฐาน",

            href: "/standards",

            style: "outline",
          }),
        ],

        items: [],

        sortOrder: 60,
      },
    ],

    updatedAt: now,
    updatedBy: ACTOR.uid,

    publishedAt: null,
    publishedBy: null,
  };
}

function isEmptyAboutPage(data) {
  if (!data) {
    return true;
  }

  if (data.published || Number(data.publishedVersion || 0) > 0) {
    return false;
  }

  const sections = Array.isArray(data.draft?.sections)
    ? data.draft.sections
    : [];

  if (sections.length > 0) {
    return false;
  }

  if (data.draft?.seo?.imageMediaId) {
    return false;
  }

  return true;
}

async function seedAboutPage() {
  console.log("Checking whether About page already exists...");

  const { db, bucket } = initializeFirebaseAdmin();

  const pageReference = db.collection(COLLECTIONS.PAGES).doc(ABOUT_PAGE_ID);

  const existingPage = await pageReference.get();

  const existingPageData = existingPage.exists ? existingPage.data() : null;

  const replacingEmptyPage =
    existingPage.exists &&
    ALLOW_REPLACE_EMPTY &&
    isEmptyAboutPage(existingPageData);

  if (existingPage.exists && !replacingEmptyPage) {
    const sectionCount = Array.isArray(existingPageData?.draft?.sections)
      ? existingPageData.draft.sections.length
      : 0;

    throw new Error(
      [
        "About page already exists.",
        "The seed was stopped to prevent overwriting Admin content.",
        "",
        `Document: ${COLLECTIONS.PAGES}/${ABOUT_PAGE_ID}`,
        `Draft version: ${Number(existingPageData?.draftVersion || 0)}`,
        `Published version: ${Number(existingPageData?.publishedVersion || 0)}`,
        `Draft sections: ${sectionCount}`,
        "",
        isEmptyAboutPage(existingPageData)
          ? "The document is empty. Run again with --replace-empty."
          : "The document contains content and cannot be replaced by this seed.",
      ].join("\n"),
    );
  }

  if (replacingEmptyPage) {
    console.log("[REPLACE] Existing empty About draft will be replaced.");
  }

  console.log("Checking About image files...");

  await assertAboutImagesExist();

  console.log("Uploading About images to Media Library...");

  const uploads = {};

  try {
    for (const [imageKey, image] of Object.entries(ABOUT_IMAGES)) {
      console.log(`[UPLOAD] ${image.fileName}`);

      uploads[imageKey] = await uploadAboutImage({
        bucket,
        imageKey,
        image,
      });
    }

    const now = Timestamp.now();

    const draft = createAboutDraft({
      media: uploads,
      now,
    });

    const pageData = {
      pageType: ABOUT_PAGE_ID,

      draftVersion: 1,
      publishedVersion: 0,

      draft,
      published: null,

      isDeleted: false,
      deletedAt: null,
      deletedBy: null,

      createdAt: existingPageData?.createdAt || now,

      createdBy: existingPageData?.createdBy || ACTOR.uid,

      updatedAt: now,
      updatedBy: ACTOR.uid,
    };

    const batch = db.batch();

    for (const [imageKey, image] of Object.entries(ABOUT_IMAGES)) {
      const upload = uploads[imageKey];

      const mediaData = createMediaDocument({
        image,
        upload,
        now,
      });

      const mediaReference = db
        .collection(COLLECTIONS.MEDIA)
        .doc(upload.mediaId);

      const mediaAuditReference = db
        .collection(COLLECTIONS.AUDIT_LOGS)
        .doc(randomUUID());

      batch.create(mediaReference, mediaData);

      batch.create(
        mediaAuditReference,
        createAuditDocument({
          action: "MEDIA_UPLOAD",

          entityType: "media",

          entityId: upload.mediaId,

          after: mediaData,

          metadata: {
            page: ABOUT_PAGE_ID,
            imageKey,
            originalName: image.fileName,
            storagePath: upload.storagePath,
          },
        }),
      );
    }

    if (replacingEmptyPage) {
      batch.set(pageReference, pageData);
    } else {
      batch.create(pageReference, pageData);
    }

    const pageAuditReference = db
      .collection(COLLECTIONS.AUDIT_LOGS)
      .doc(randomUUID());

    batch.create(
      pageAuditReference,
      createAuditDocument({
        action: replacingEmptyPage ? "PAGE_UPDATE" : "PAGE_CREATE",

        entityType: "page",

        entityId: ABOUT_PAGE_ID,

        before: replacingEmptyPage ? existingPageData : null,

        after: pageData,

        metadata: {
          page: ABOUT_PAGE_ID,
          operation: replacingEmptyPage ? "replace-empty-draft" : "seed-draft",
          replacedEmptyDraft: replacingEmptyPage,
          draftVersion: 1,
          sectionCount: draft.sections.length,
        },
      }),
    );

    await batch.commit();

    console.log("");
    console.log("About page seed completed successfully.");

    console.log(`Document: ${COLLECTIONS.PAGES}/${ABOUT_PAGE_ID}`);

    console.log(`Draft version: ${pageData.draftVersion}`);

    console.log(`Sections: ${draft.sections.length}`);

    console.log(`Media files: ${Object.keys(uploads).length}`);

    console.log("Published: No — review and publish from Admin About.");
  } catch (error) {
    console.error("Seed failed. Removing uploaded Storage files...");

    await Promise.all(
      Object.values(uploads).map((upload) =>
        upload.storageFile
          .delete({
            ignoreNotFound: true,
          })
          .catch(() => {}),
      ),
    );

    throw error;
  }
}

seedAboutPage()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((error) => {
    console.error("");
    console.error("About page seed failed:", error);

    process.exitCode = 1;
  });
