const adminStandardsTh = {
  page: {
    eyebrow: "การจัดการมาตรฐาน",

    title: "มาตรฐานและใบรับรอง",

    description:
      "จัดการมาตรฐาน รายงานผลการทดสอบ หนังสือรับรอง ใบประกาศ ผลิตภัณฑ์ที่เกี่ยวข้อง และเอกสารการรับรองต่าง ๆ",
  },

  actions: {
    add: "เพิ่มมาตรฐาน",
    edit: "แก้ไขมาตรฐาน",
    delete: "ย้ายไปถังขยะ",

    refresh: "รีเฟรช",
    search: "ค้นหา",
    reset: "รีเซ็ต",

    save: "บันทึกมาตรฐาน",
    saving: "กำลังบันทึก...",

    cancel: "ยกเลิก",
    close: "ปิด",

    selectDocument: "เลือกเอกสาร",

    changeDocument: "เปลี่ยนเอกสาร",

    removeDocument: "นำเอกสารออก",

    previewDocument: "ดูเอกสาร",
  },

  filters: {
    searchLabel: "ค้นหามาตรฐาน",

    searchPlaceholder: "ค้นหาจากรหัส ชื่อ หน่วยงาน หรือเอกสาร...",

    status: "สถานะ",
    allStatuses: "ทุกสถานะ",

    documentType: "ประเภทเอกสาร",

    allDocumentTypes: "ทุกประเภทเอกสาร",

    documentLanguage: "ภาษาของเอกสาร",

    allLanguages: "ทุกภาษา",
  },

  table: {
    standard: "มาตรฐาน / ใบรับรอง",

    code: "รหัส",

    documentType: "ประเภทเอกสาร",

    language: "ภาษา",

    categories: "หมวดหมู่สินค้า",

    products: "สินค้า",

    status: "สถานะ",

    home: "หน้าแรก",

    featured: "รายการแนะนำ",

    order: "ลำดับ",

    actions: "การทำงาน",

    showOnHome: "แสดงในหน้าแรก",

    notShown: "ไม่แสดง",

    noDocument: "ไม่มีเอกสาร",

    categoryCount: "{{count}} หมวดหมู่",

    productCount: "{{count}} สินค้า",
  },

  status: {
    draft: "ฉบับร่าง",
    published: "เผยแพร่",
    inactive: "ไม่ใช้งาน",
  },

  documentTypes: {
    certificate: "ใบรับรอง",

    "test-report": "รายงานผลการทดสอบ",

    "declaration-of-performance": "หนังสือรับรองสมรรถนะ",

    "product-compliance": "เอกสารรับรองผลิตภัณฑ์",

    "quality-certificate": "ใบรับรองคุณภาพ",

    "technical-document": "เอกสารทางเทคนิค",

    other: "เอกสารประเภทอื่น",
  },

  languages: {
    en: "ภาษาอังกฤษ",
    th: "ภาษาไทย",

    bilingual: "ภาษาอังกฤษ / ภาษาไทย",

    other: "ภาษาอื่น",
  },

  form: {
    createEyebrow: "รายละเอียดมาตรฐาน",

    createTitle: "เพิ่มมาตรฐาน",

    createDescription: "เพิ่มมาตรฐาน ใบรับรอง หรือเอกสารการรับรอง",

    editEyebrow: "รายละเอียดมาตรฐาน",

    editTitle: "แก้ไขมาตรฐาน",

    editDescription: "แก้ไขข้อมูลมาตรฐาน เอกสาร ความสัมพันธ์กับสินค้า และ SEO",

    sections: {
      basic: "ข้อมูลพื้นฐาน",

      content: "เนื้อหามาตรฐาน",

      classification: "ประเภทและหน่วยงานผู้ออก",

      document: "ใบรับรองหรือเอกสาร",

      categories: "หมวดหมู่สินค้าที่เกี่ยวข้อง",

      products: "สินค้าที่เกี่ยวข้อง",

      dates: "วันที่ของเอกสาร",

      publishing: "การเผยแพร่และการแสดงผล",

      seo: "การปรับแต่งสำหรับเครื่องมือค้นหา",
    },

    fields: {
      code: "รหัสมาตรฐาน",

      slug: "Slug",

      nameEn: "ชื่อภาษาอังกฤษ",

      nameTh: "ชื่อภาษาไทย",

      shortDescriptionEn: "คำอธิบายสั้นภาษาอังกฤษ",

      shortDescriptionTh: "คำอธิบายสั้นภาษาไทย",

      descriptionEn: "รายละเอียดภาษาอังกฤษ",

      descriptionTh: "รายละเอียดภาษาไทย",

      classificationEn: "ประเภทมาตรฐานภาษาอังกฤษ",

      classificationTh: "ประเภทมาตรฐานภาษาไทย",

      conformityReference: "เลขที่อ้างอิงการรับรอง",

      issuerEn: "หน่วยงานผู้ออกภาษาอังกฤษ",

      issuerTh: "หน่วยงานผู้ออกภาษาไทย",

      documentType: "ประเภทเอกสาร",

      documentLanguage: "ภาษาของเอกสาร",

      issueDate: "วันที่ออกเอกสาร",

      expiryDate: "วันที่หมดอายุ",

      status: "สถานะ",

      sortOrder: "ลำดับการแสดง",

      featured: "มาตรฐานแนะนำ",

      showOnHome: "แสดงในหน้าแรก",

      seoTitleEn: "หัวข้อ SEO ภาษาอังกฤษ",

      seoTitleTh: "หัวข้อ SEO ภาษาไทย",

      seoDescriptionEn: "คำอธิบาย SEO ภาษาอังกฤษ",

      seoDescriptionTh: "คำอธิบาย SEO ภาษาไทย",

      seoKeywordsEn: "คำค้นหา SEO ภาษาอังกฤษ",

      seoKeywordsTh: "คำค้นหา SEO ภาษาไทย",
    },

    placeholders: {
      code: "เช่น EN 1154",

      slug: "เช่น en-1154-door-closer-standard",

      nameEn: "เช่น Controlled Door Closing Devices",

      nameTh: "เช่น มาตรฐานอุปกรณ์ควบคุมการปิดประตู",

      shortDescriptionEn: "อธิบายมาตรฐานหรือใบรับรองโดยย่อ...",

      shortDescriptionTh: "อธิบายมาตรฐานหรือใบรับรองโดยย่อ...",

      descriptionEn: "กรอกข้อมูลมาตรฐานฉบับเต็ม...",

      descriptionTh: "กรอกข้อมูลมาตรฐานฉบับเต็ม...",

      classificationEn:
        "เช่น Performance requirements for controlled door closers",

      classificationTh: "เช่น ข้อกำหนดด้านประสิทธิภาพสำหรับโช้คอัพประตู",

      conformityReference: "เช่น EN 1154:1996/A1:2002",

      issuerEn: "เช่น European Committee for Standardization",

      issuerTh: "เช่น คณะกรรมการมาตรฐานยุโรป",

      categorySearch: "ค้นหาหมวดหมู่สินค้า...",

      productSearch: "ค้นหาจากชื่อสินค้า รุ่น หรือ SKU...",

      seoTitle: "เว้นว่างเพื่อสร้างโดยอัตโนมัติ",

      seoDescription: "เว้นว่างเพื่อใช้คำอธิบายสั้น",

      seoKeywords: "คั่นคำค้นหาด้วยเครื่องหมายจุลภาค",
    },

    hints: {
      code: "ใช้รหัสมาตรฐานหรือใบรับรองอย่างเป็นทางการ",

      slug: "ใช้ใน URL ของหน้า Public โดยใช้ตัวอักษรภาษาอังกฤษพิมพ์เล็ก ตัวเลข และขีดกลางเท่านั้น",

      document: "เลือกไฟล์ PDF หรือเอกสารรับรองหนึ่งไฟล์จาก Media Library",

      documentUpload:
        "รองรับ PDF, DOC หรือ DOCX โดยไฟล์ที่อัปโหลดจากหน้านี้จะจัดเก็บในโฟลเดอร์ Certificates",

      categories: "เลือกหมวดหมู่สินค้าที่อยู่ภายใต้มาตรฐานนี้",

      products: "เลือกสินค้าแต่ละรายการที่เกี่ยวข้องกับมาตรฐานนี้",

      dates:
        "ไม่จำเป็นต้องระบุวันหมดอายุ แต่วันหมดอายุต้องไม่อยู่ก่อนวันที่ออกเอกสาร",

      seo: "ระบบจะสร้างหัวข้อและคำอธิบาย SEO ให้เมื่อเว้นว่าง",

      keywords: "คั่นคำค้นหาด้วยเครื่องหมายจุลภาค",
    },

    empty: {
      document: "ยังไม่ได้เลือกใบรับรองหรือเอกสาร",

      categories: "ไม่พบหมวดหมู่สินค้า",

      products: "ไม่พบสินค้า",
    },
  },

  confirmDelete: {
    title: "ย้ายมาตรฐานนี้ไปถังขยะ?",

    description:
      "สามารถกู้คืนมาตรฐานได้ในภายหลัง ระบบจะปล่อยการใช้งานเอกสารและความสัมพันธ์ที่เกี่ยวข้อง",

    confirm: "ย้ายไปถังขยะ",

    cancel: "ยกเลิก",
  },

  messages: {
    loadFailed: "ไม่สามารถโหลดรายการมาตรฐานได้",

    createSuccess: "เพิ่มมาตรฐานเรียบร้อยแล้ว",

    createFailed: "ไม่สามารถเพิ่มมาตรฐานได้",

    updateSuccess: "แก้ไขมาตรฐานเรียบร้อยแล้ว",

    updateFailed: "ไม่สามารถแก้ไขมาตรฐานได้",

    deleteSuccess: "ย้ายมาตรฐานไปถังขยะแล้ว",

    deleteFailed: "ไม่สามารถลบมาตรฐานได้",

    reorderSuccess: "อัปเดตลำดับมาตรฐานแล้ว",

    reorderFailed: "ไม่สามารถอัปเดตลำดับมาตรฐานได้",

    documentLoadFailed: "ไม่สามารถโหลดเอกสารได้",

    categoriesLoadFailed: "ไม่สามารถโหลดหมวดหมู่สินค้าได้",

    productsLoadFailed: "ไม่สามารถโหลดสินค้าได้",

    selectionLimit: "เลือกครบจำนวนสูงสุดแล้ว",

    validationFailed: "กรุณาตรวจสอบข้อมูลที่จำเป็น",
  },

  empty: {
    title: "ยังไม่มีมาตรฐาน",

    description: "เพิ่มมาตรฐาน ใบรับรอง หรือเอกสารการรับรองรายการแรก",

    filteredTitle: "ไม่พบมาตรฐานที่ตรงกัน",

    filteredDescription: "ลองเปลี่ยนคำค้นหาหรือตัวกรอง",
  },

  pagination: {
    showing: "แสดง {{count}} มาตรฐาน",

    loadMore: "โหลดเพิ่มเติม",

    loading: "กำลังโหลด...",
  },
};

export default adminStandardsTh;
