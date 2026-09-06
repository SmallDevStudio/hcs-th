import { randomUUID } from "node:crypto";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const PROJECT_ROOT = process.cwd();

const COLLECTIONS = Object.freeze({
  CATEGORIES: "categories",
  MEDIA: "media",
  AUDIT_LOGS: "auditLogs",
});

const ACTOR = Object.freeze({
  uid: "system:category-migration",
  email: null,
  displayName: "Category Migration",
  role: "system",
});

const CATEGORY_SEED_DATA = [
  {
    slug: "door-closers",
    imageFile: "door-closers.jpg",
    icon: "doorCloser",
    featured: true,
    sortOrder: 10,

    name: {
      en: "Door Closers",
      th: "โช้คอัพประตู",
    },

    description: {
      en: "Surface mounted, concealed and floor spring solutions.",
      th: "โช้คอัพติดลอย โช้คอัพซ่อน และฟลอร์สปริง",
    },

    keywords: {
      en: ["door closers", "door closer", "floor spring", "HCS Thailand"],

      th: [
        "โช้คอัพประตู",
        "โช้คอัพติดลอย",
        "โช้คอัพซ่อน",
        "ฟลอร์สปริง",
        "HCS ประเทศไทย",
      ],
    },
  },

  {
    slug: "lever-handles",
    imageFile: "lever-handles.jpg",
    icon: "leverHandle",
    featured: false,
    sortOrder: 20,

    name: {
      en: "Lever Handles",
      th: "มือจับก้านโยก",
    },

    description: {
      en: "Architectural lever furniture for every interior.",
      th: "มือจับประตูสถาปัตยกรรมสำหรับพื้นที่หลากหลายรูปแบบ",
    },

    keywords: {
      en: [
        "lever handles",
        "door handles",
        "architectural hardware",
        "HCS Thailand",
      ],

      th: ["มือจับก้านโยก", "มือจับประตู", "อุปกรณ์ประตู", "HCS ประเทศไทย"],
    },
  },

  {
    slug: "locks-cylinders",
    imageFile: "locks-cylinders.jpg",
    icon: "lock",
    featured: false,
    sortOrder: 30,

    name: {
      en: "Locks & Cylinders",
      th: "ล็อกและไส้กุญแจ",
    },

    description: {
      en: "Mortice locks, cylinders and master key systems.",
      th: "มอร์ทิสล็อก ไส้กุญแจ และระบบมาสเตอร์คีย์",
    },

    keywords: {
      en: [
        "locks",
        "cylinders",
        "mortice locks",
        "master key systems",
        "HCS Thailand",
      ],

      th: [
        "ล็อกประตู",
        "ไส้กุญแจ",
        "มอร์ทิสล็อก",
        "มาสเตอร์คีย์",
        "HCS ประเทศไทย",
      ],
    },
  },

  {
    slug: "hinges",
    imageFile: "hinges.jpg",
    icon: "hinge",
    featured: false,
    sortOrder: 40,

    name: {
      en: "Hinges",
      th: "บานพับ",
    },

    description: {
      en: "Reliable hinges for architectural door applications.",
      th: "บานพับคุณภาพสำหรับงานประตูสถาปัตยกรรม",
    },

    keywords: {
      en: [
        "door hinges",
        "architectural hinges",
        "door hardware",
        "HCS Thailand",
      ],

      th: ["บานพับ", "บานพับประตู", "อุปกรณ์ประตู", "HCS ประเทศไทย"],
    },
  },

  {
    slug: "panic-exit-hardware",
    imageFile: "panic-exit-hardware.jpg",
    icon: "exit",
    featured: false,
    sortOrder: 50,

    name: {
      en: "Panic Exit Hardware",
      th: "อุปกรณ์ทางออกฉุกเฉิน",
    },

    description: {
      en: "Emergency exit devices designed for safe evacuation.",
      th: "อุปกรณ์ประตูทางออกฉุกเฉินสำหรับการอพยพอย่างปลอดภัย",
    },

    keywords: {
      en: [
        "panic exit hardware",
        "panic bar",
        "emergency exit",
        "HCS Thailand",
      ],

      th: [
        "อุปกรณ์ทางออกฉุกเฉิน",
        "ประตูหนีไฟ",
        "อุปกรณ์ประตูฉุกเฉิน",
        "HCS ประเทศไทย",
      ],
    },
  },

  {
    slug: "door-window-seals",
    imageFile: "door-window-seals.jpg",
    icon: "seal",
    featured: false,
    sortOrder: 60,

    name: {
      en: "Door & Window Seals",
      th: "ซีลประตูและหน้าต่าง",
    },

    description: {
      en: "Acoustic, smoke, weather and perimeter sealing systems.",
      th: "ระบบซีลกันเสียง ควัน สภาพอากาศ และซีลขอบประตู",
    },

    keywords: {
      en: [
        "door seals",
        "window seals",
        "acoustic seals",
        "smoke seals",
        "HCS Thailand",
      ],

      th: [
        "ซีลประตู",
        "ซีลหน้าต่าง",
        "ซีลกันเสียง",
        "ซีลกันควัน",
        "HCS ประเทศไทย",
      ],
    },
  },

  {
    slug: "fire-doors",
    imageFile: "fire-doors.jpg",
    icon: "fire",
    featured: false,
    sortOrder: 70,

    name: {
      en: "Fire Doors",
      th: "ประตูกันไฟ",
    },

    description: {
      en: "Fire-resistant doorsets engineered to international standards.",
      th: "ชุดประตูกันไฟที่ออกแบบตามมาตรฐานสากล",
    },

    keywords: {
      en: [
        "fire doors",
        "fire-rated doors",
        "fire-resistant doors",
        "HCS Thailand",
      ],

      th: ["ประตูกันไฟ", "ประตูทนไฟ", "ประตูมาตรฐานกันไฟ", "HCS ประเทศไทย"],
    },
  },

  {
    slug: "electronic-locks",
    imageFile: "electronic-locks.jpg",
    icon: "electronicLock",
    featured: false,
    sortOrder: 80,

    name: {
      en: "Electronic Locks",
      th: "ล็อกอิเล็กทรอนิกส์",
    },

    description: {
      en: "Smart access and electronic security solutions.",
      th: "ระบบควบคุมการเข้าออกและล็อกอัจฉริยะ",
    },

    keywords: {
      en: ["electronic locks", "smart locks", "access control", "HCS Thailand"],

      th: [
        "ล็อกอิเล็กทรอนิกส์",
        "ล็อกอัจฉริยะ",
        "ระบบควบคุมการเข้าออก",
        "HCS ประเทศไทย",
      ],
    },
  },
];

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

function createFirebaseDownloadUrl({ bucketName, storagePath, downloadToken }) {
  return [
    `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/`,
    encodeURIComponent(storagePath),
    `?alt=media&token=${downloadToken}`,
  ].join("");
}

function createSearchTokens({ name, slug }) {
  const values = [name.en, name.th, slug];

  const tokens = values.flatMap((value) =>
    String(value || "")
      .toLocaleLowerCase()
      .split(/[\s,._\-()[\]{}]+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2),
  );

  return [...new Set(tokens)].slice(0, 100);
}

function createMediaSearchTokens({ originalName, title, altText, keywords }) {
  const values = [
    originalName,
    title.en,
    title.th,
    altText.en,
    altText.th,
    ...keywords,
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

function createCategorySeo(category) {
  return {
    title: {
      en: `${category.name.en} | HCS Thailand`,
      th: `${category.name.th} | HCS ประเทศไทย`,
    },

    description: {
      en: category.description.en,
      th: category.description.th,
    },

    keywords: {
      en: category.keywords.en,
      th: category.keywords.th,
    },
  };
}

function createImageSnapshot({
  mediaId,
  publicUrl,
  originalName,
  title,
  altText,
}) {
  return {
    id: mediaId,
    type: "image",
    publicUrl,
    originalName,
    mimeType: "image/jpeg",
    width: null,
    height: null,
    title,
    altText,
  };
}

function createAuditDocument({
  action,
  entityType,
  entityId,
  after,
  metadata,
}) {
  return {
    actor: ACTOR,

    action,
    entityType,
    entityId,

    before: null,
    after,

    metadata: {
      source: "seed-product-categories",
      ...metadata,
    },

    createdAt: Timestamp.now(),
  };
}

async function assertSeedImagesExist() {
  for (const category of CATEGORY_SEED_DATA) {
    const filePath = path.join(
      PROJECT_ROOT,
      "public",
      "images",
      "products",
      "categories",
      category.imageFile,
    );

    await access(filePath);
  }
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

async function findExistingCategory(db, slug) {
  const snapshot = await db
    .collection(COLLECTIONS.CATEGORIES)
    .where("slug", "==", slug)
    .limit(1)
    .get();

  return snapshot.empty ? null : snapshot.docs[0];
}

async function seedCategory({ db, bucket, category }) {
  const existingCategory = await findExistingCategory(db, category.slug);

  if (existingCategory) {
    console.log(`[SKIP] Category already exists: ${category.slug}`);

    return {
      status: "skipped",
      slug: category.slug,
    };
  }

  const categoryId = randomUUID();
  const mediaId = randomUUID();
  const downloadToken = randomUUID();

  const imagePath = path.join(
    PROJECT_ROOT,
    "public",
    "images",
    "products",
    "categories",
    category.imageFile,
  );

  const imageBuffer = await readFile(imagePath);
  const imageStat = await stat(imagePath);

  const storagePath = [
    "media",
    "images",
    "categories",
    "seed",
    `${mediaId}.jpg`,
  ].join("/");

  const storageFile = bucket.file(storagePath);

  await storageFile.save(imageBuffer, {
    resumable: false,

    validation: "md5",

    metadata: {
      contentType: "image/jpeg",

      cacheControl: "public, max-age=31536000, immutable",

      metadata: {
        firebaseStorageDownloadTokens: downloadToken,

        source: "seed-product-categories",

        categorySlug: category.slug,
      },
    },
  });

  const publicUrl = createFirebaseDownloadUrl({
    bucketName: bucket.name,
    storagePath,
    downloadToken,
  });

  const now = Timestamp.now();

  const mediaTitle = {
    en: `${category.name.en} category image`,
    th: `รูปหมวดหมู่${category.name.th}`,
  };

  const mediaAltText = {
    en: `${category.name.en} products from HCS Thailand`,
    th: `ผลิตภัณฑ์หมวด${category.name.th}จาก HCS ประเทศไทย`,
  };

  const mediaKeywords = [
    category.slug,
    category.name.en.toLocaleLowerCase(),
    category.name.th,
    "hcs thailand",
  ];

  const usageReference = {
    entityType: "category",
    entityId: categoryId,
    field: "image",
  };

  const mediaData = {
    type: "image",
    status: "active",
    folder: "categories",

    originalName: category.imageFile,
    storagePath,
    publicUrl,

    mimeType: "image/jpeg",
    extension: "jpg",
    size: imageStat.size,

    width: null,
    height: null,

    title: mediaTitle,
    altText: mediaAltText,

    caption: {
      en: "",
      th: "",
    },

    keywords: mediaKeywords,

    searchTokens: createMediaSearchTokens({
      originalName: category.imageFile,
      title: mediaTitle,
      altText: mediaAltText,
      keywords: mediaKeywords,
    }),

    isUsed: true,
    usageCount: 1,
    usedBy: [usageReference],

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

  const imageSnapshot = createImageSnapshot({
    mediaId,
    publicUrl,
    originalName: category.imageFile,
    title: mediaTitle,
    altText: mediaAltText,
  });

  const categoryData = {
    name: category.name,
    description: category.description,

    slug: category.slug,
    icon: category.icon,

    imageMediaId: mediaId,
    image: imageSnapshot,

    status: "active",
    featured: category.featured,
    showOnHome: true,

    sortOrder: category.sortOrder,
    productCount: 0,

    seo: createCategorySeo(category),

    searchTokens: createSearchTokens({
      name: category.name,
      slug: category.slug,
    }),

    isDeleted: false,
    deletedAt: null,
    deletedBy: null,

    createdAt: now,
    createdBy: ACTOR.uid,

    updatedAt: now,
    updatedBy: ACTOR.uid,
  };

  const mediaReference = db.collection(COLLECTIONS.MEDIA).doc(mediaId);

  const categoryReference = db
    .collection(COLLECTIONS.CATEGORIES)
    .doc(categoryId);

  const mediaAuditReference = db
    .collection(COLLECTIONS.AUDIT_LOGS)
    .doc(randomUUID());

  const categoryAuditReference = db
    .collection(COLLECTIONS.AUDIT_LOGS)
    .doc(randomUUID());

  const batch = db.batch();

  batch.create(mediaReference, mediaData);

  batch.create(categoryReference, categoryData);

  batch.create(
    mediaAuditReference,
    createAuditDocument({
      action: "MEDIA_UPLOAD",
      entityType: "media",
      entityId: mediaId,
      after: mediaData,

      metadata: {
        categorySlug: category.slug,
        storagePath,
        originalName: category.imageFile,
      },
    }),
  );

  batch.create(
    categoryAuditReference,
    createAuditDocument({
      action: "CATEGORY_CREATE",
      entityType: "category",
      entityId: categoryId,
      after: categoryData,

      metadata: {
        categorySlug: category.slug,
        mediaId,
      },
    }),
  );

  try {
    await batch.commit();
  } catch (error) {
    await storageFile
      .delete({
        ignoreNotFound: true,
      })
      .catch(() => {});

    throw error;
  }

  console.log(`[CREATED] ${category.slug} (${categoryId})`);

  return {
    status: "created",
    slug: category.slug,
    categoryId,
    mediaId,
  };
}

async function seedProductCategories() {
  console.log("Checking category seed images...");

  await assertSeedImagesExist();

  console.log("Initializing Firebase Admin...");

  const { db, bucket } = initializeFirebaseAdmin();

  const results = [];

  for (const category of CATEGORY_SEED_DATA) {
    const result = await seedCategory({
      db,
      bucket,
      category,
    });

    results.push(result);
  }

  const created = results.filter(
    (result) => result.status === "created",
  ).length;

  const skipped = results.filter(
    (result) => result.status === "skipped",
  ).length;

  console.log("");
  console.log("Category migration completed.");
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total: ${results.length}`);
}

seedProductCategories()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((error) => {
    console.error("");
    console.error("Category migration failed:", error);

    process.exitCode = 1;
  });
