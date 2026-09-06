const categoriesTh = {
  eyebrow: "จัดการสินค้า",
  title: "หมวดหมู่สินค้า",
  description:
    "จัดการกลุ่มสินค้า รูปภาพ ลำดับการแสดงผล และข้อมูล SEO ที่ใช้งานบนเว็บไซต์",

  actions: {
    create: "เพิ่มหมวดหมู่",
    edit: "แก้ไขหมวดหมู่",
    delete: "ย้ายไปถังขยะ",
    save: "บันทึกหมวดหมู่",
    saving: "กำลังบันทึก...",
    cancel: "ยกเลิก",
    close: "ปิด",
    refresh: "โหลดใหม่",
    search: "ค้นหา",
    clear: "ล้างตัวกรอง",
    loadMore: "โหลดเพิ่มเติม",
    loading: "กำลังโหลด...",
    selectImage: "เลือกรูปภาพ",
    changeImage: "เปลี่ยนรูปภาพ",
    removeImage: "นำรูปภาพออก",
    generateSlug: "สร้าง Slug",
    saveOrder: "บันทึกลำดับ",
  },

  filters: {
    search: "ค้นหาหมวดหมู่",
    searchPlaceholder: "ค้นหาจากชื่อหมวดหมู่หรือ URL Slug...",
    status: "สถานะ",
    allStatuses: "ทุกสถานะ",
  },

  statuses: {
    active: "เปิดใช้งาน",
    inactive: "ปิดใช้งาน",
  },

  fields: {
    name: "ชื่อหมวดหมู่",
    description: "คำอธิบาย",
    slug: "URL Slug",
    slugHint:
      "ใช้ตัวอักษรภาษาอังกฤษพิมพ์เล็ก ตัวเลข และเครื่องหมายขีดกลางเท่านั้น",
    icon: "ไอคอนหมวดหมู่",
    image: "รูปภาพหมวดหมู่",
    imageHint: "เลือกรูปจากคลังไฟล์และรูปภาพ",
    status: "สถานะ",
    sortOrder: "ลำดับการแสดงผล",
    featured: "หมวดหมู่หลัก",
    featuredDescription:
      "แสดงหมวดหมู่นี้เป็นการ์ดหลักขนาดใหญ่ โดยกำหนดเป็นหมวดหมู่หลักได้ครั้งละหนึ่งรายการ",
    showOnHome: "แสดงในหน้าแรก",
    showOnHomeDescription: "แสดงหมวดหมู่นี้ในส่วนหมวดหมู่สินค้าของหน้าแรก",
    productCount: "จำนวนสินค้า",
  },

  seo: {
    title: "การตั้งค่าสำหรับ Search Engine",
    description: "หากเว้นว่าง ระบบจะใช้ชื่อและคำอธิบายหมวดหมู่ให้อัตโนมัติ",
    metaTitle: "ชื่อ SEO",
    metaDescription: "คำอธิบาย SEO",
    keywords: "คีย์เวิร์ด SEO",
    keywordsHint: "แยกแต่ละคีย์เวิร์ดด้วยเครื่องหมายจุลภาค",
  },

  language: {
    english: "ภาษาอังกฤษ",
    thai: "ภาษาไทย",
  },

  icons: {
    doorCloser: "โช้คอัพประตู",
    leverHandle: "มือจับก้านโยก",
    lock: "ล็อกและไส้กุญแจ",
    hinge: "บานพับ",
    exit: "ทางออกฉุกเฉิน",
    seal: "ซีลประตู",
    fire: "ประตูกันไฟ",
    electronicLock: "ล็อกอิเล็กทรอนิกส์",
    door: "ประตูทั่วไป",
  },

  table: {
    category: "หมวดหมู่",
    slug: "Slug",
    status: "สถานะ",
    products: "สินค้า",
    order: "ลำดับ",
    home: "หน้าแรก",
    actions: "จัดการ",
  },

  badges: {
    featured: "หมวดหมู่หลัก",
    shownOnHome: "แสดงในหน้าแรก",
    hiddenFromHome: "ไม่แสดงในหน้าแรก",
  },

  form: {
    createEyebrow: "หมวดหมู่ใหม่",
    createTitle: "เพิ่มหมวดหมู่สินค้า",
    createDescription: "สร้างข้อมูลหมวดหมู่สินค้าเป็นภาษาอังกฤษและภาษาไทย",

    editEyebrow: "รายละเอียดหมวดหมู่",
    editTitle: "แก้ไขหมวดหมู่สินค้า",
    editDescription: "แก้ไขข้อมูล รูปภาพ และการตั้งค่า SEO ของหมวดหมู่",

    contentSection: "เนื้อหาหมวดหมู่",
    displaySection: "การตั้งค่าการแสดงผล",
    seoSection: "การตั้งค่า SEO",
  },

  mediaPicker: {
    eyebrow: "คลังไฟล์และรูปภาพ",
    title: "เลือกรูปหมวดหมู่",
    description: "เลือกรูปภาพที่พร้อมใช้งานจาก Media Library",
    searchPlaceholder: "ค้นหารูปภาพ...",
    empty: "ไม่พบรูปภาพ",
    selected: "เลือกแล้ว",
    useImage: "ใช้รูปที่เลือก",
  },

  empty: {
    title: "ยังไม่มีหมวดหมู่สินค้า",
    description: "สร้างหมวดหมู่แรกเพื่อเริ่มจัดกลุ่มสินค้าของ HCS",
    filteredTitle: "ไม่พบหมวดหมู่ที่ค้นหา",
    filteredDescription: "ลองเปลี่ยนข้อความค้นหาหรือตัวกรองสถานะ",
  },

  confirmDelete: {
    title: "ย้ายหมวดหมู่นี้ไปถังขยะหรือไม่?",
    text: "สามารถกู้คืนหมวดหมู่ได้ภายหลัง แต่หมวดหมู่ที่มีสินค้าอยู่จะไม่สามารถลบได้",
    confirm: "ย้ายไปถังขยะ",
    cancel: "ยกเลิก",
  },

  messages: {
    loadFailed: "ไม่สามารถโหลดหมวดหมู่สินค้าได้",
    createSuccess: "เพิ่มหมวดหมู่เรียบร้อยแล้ว",
    createFailed: "ไม่สามารถเพิ่มหมวดหมู่ได้",
    updateSuccess: "แก้ไขหมวดหมู่เรียบร้อยแล้ว",
    updateFailed: "ไม่สามารถแก้ไขหมวดหมู่ได้",
    deleteSuccess: "ย้ายหมวดหมู่ไปถังขยะแล้ว",
    deleteFailed: "ไม่สามารถย้ายหมวดหมู่ไปถังขยะได้",
    imageLoadFailed: "ไม่สามารถโหลดรูปจาก Media Library ได้",
    slugExists: "URL Slug นี้ถูกใช้โดยหมวดหมู่อื่นแล้ว",
    orderSuccess: "บันทึกลำดับหมวดหมู่เรียบร้อยแล้ว",
    orderFailed: "ไม่สามารถบันทึกลำดับหมวดหมู่ได้",
  },

  pagination: {
    showing: "กำลังแสดง {{count}} หมวดหมู่",
    end: "โหลดหมวดหมู่ทั้งหมดแล้ว",
  },
};

export default categoriesTh;
