const mediaTh = {
  eyebrow: "จัดการไฟล์สื่อ",
  title: "คลังไฟล์และรูปภาพ",
  description:
    "อัปโหลดและจัดการรูปภาพ เอกสาร และไฟล์ดาวน์โหลดที่ใช้ภายในเว็บไซต์ HCS Thailand",

  summary: {
    showing: "กำลังแสดง {{count}} ไฟล์",
    selected: "เลือกแล้ว {{count}} ไฟล์",
  },

  actions: {
    upload: "อัปโหลดไฟล์",
    uploading: "กำลังอัปโหลด...",
    refresh: "โหลดใหม่",
    edit: "แก้ไขรายละเอียด",
    delete: "ย้ายไปถังขยะ",
    download: "ดาวน์โหลด",
    copyUrl: "คัดลอก URL",
    select: "เลือก",
    close: "ปิด",
    save: "บันทึกการแก้ไข",
    saving: "กำลังบันทึก...",
    loadMore: "โหลดเพิ่มเติม",
    loading: "กำลังโหลด...",
    clear: "ล้างตัวกรอง",
    retry: "ลองอีกครั้ง",
  },

  views: {
    grid: "แสดงแบบตาราง",
    list: "แสดงแบบรายการ",
  },

  filters: {
    search: "ค้นหาไฟล์",
    searchPlaceholder: "ค้นหาจากชื่อไฟล์ ชื่อเรื่อง หรือคีย์เวิร์ด...",
    type: "ประเภทไฟล์",
    folder: "โฟลเดอร์",
    usage: "การใช้งาน",
    allTypes: "ไฟล์ทุกประเภท",
    allFolders: "ทุกโฟลเดอร์",
    allUsage: "ไฟล์ทั้งหมด",
  },

  types: {
    image: "รูปภาพ",
    document: "เอกสาร",
  },

  usage: {
    all: "ไฟล์ทั้งหมด",
    used: "กำลังใช้งาน",
    unused: "ยังไม่ถูกใช้งาน",
  },

  statuses: {
    uploading: "กำลังอัปโหลด",
    active: "พร้อมใช้งาน",
    failed: "อัปโหลดไม่สำเร็จ",
  },

  folders: {
    products: "สินค้า",
    categories: "หมวดหมู่สินค้า",
    projects: "โครงการ",
    solutions: "โซลูชัน",
    pages: "หน้าเว็บไซต์",
    branding: "โลโก้และแบรนด์",
    catalogs: "แคตตาล็อก",
    certificates: "ใบรับรอง",
    technical: "เอกสารทางเทคนิค",
    downloads: "ไฟล์ดาวน์โหลด",
    temporary: "ไฟล์ชั่วคราว",
  },

  table: {
    file: "ไฟล์",
    type: "ประเภท",
    folder: "โฟลเดอร์",
    size: "ขนาด",
    usage: "การใช้งาน",
    updatedAt: "แก้ไขล่าสุด",
    actions: "จัดการ",
  },

  card: {
    unnamed: "ยังไม่ได้ตั้งชื่อ",
    used: "ถูกใช้งาน {{count}} จุด",
    unused: "ยังไม่ถูกใช้งาน",
    imagePreview: "ตัวอย่างรูป {{name}}",
    documentPreview: "เอกสาร {{type}}",
  },

  empty: {
    title: "ยังไม่มีไฟล์ในคลัง",
    description: "อัปโหลดรูปภาพหรือเอกสารแรกเพื่อเริ่มต้นใช้งานคลังไฟล์",
    filteredTitle: "ไม่พบไฟล์ที่ค้นหา",
    filteredDescription: "ลองเปลี่ยนข้อความค้นหาหรือล้างตัวกรองบางรายการ",
  },

  upload: {
    eyebrow: "เพิ่มไฟล์สื่อ",
    title: "อัปโหลดไฟล์",
    description:
      "เลือกรูปภาพหรือเอกสาร ระบบจะอัปโหลดไปยัง Firebase Storage อย่างปลอดภัย",

    dropTitle: "ลากไฟล์มาวางที่นี่",
    dropDescription: "หรือคลิกเพื่อเลือกไฟล์จากคอมพิวเตอร์",
    dropActive: "ปล่อยเพื่อเพิ่มไฟล์",
    selectFiles: "เลือกไฟล์",

    acceptedImages: "JPG, PNG, WebP หรือ AVIF ขนาดไม่เกิน 10 MB",
    acceptedDocuments: "PDF, DOCX, XLSX, PPTX หรือ CSV ขนาดไม่เกิน 30 MB",

    selectedFiles: "ไฟล์ที่เลือก",
    destinationFolder: "โฟลเดอร์ปลายทาง",
    removeFile: "นำไฟล์ออก",

    progress: "อัปโหลดแล้ว {{percentage}}%",
    completedCount: "สำเร็จ {{completed}} จาก {{total}} ไฟล์",

    stages: {
      waiting: "รออัปโหลด",
      preparing: "กำลังเตรียมไฟล์",
      uploading: "กำลังอัปโหลด",
      processing: "กำลังประมวลผล",
      completed: "สำเร็จ",
      failed: "ไม่สำเร็จ",
    },
  },

  edit: {
    eyebrow: "รายละเอียดไฟล์",
    title: "แก้ไขข้อมูล Media",
    description:
      "เพิ่มชื่อ Alternative text และข้อมูลค้นหาสำหรับเว็บไซต์ทั้งสองภาษา",

    originalName: "ชื่อไฟล์ต้นฉบับ",
    storagePath: "ตำแหน่งจัดเก็บ",
    fileInformation: "ข้อมูลไฟล์",

    titleField: "ชื่อไฟล์",
    altText: "ข้อความอธิบายรูป",
    caption: "คำบรรยาย",
    keywords: "คีย์เวิร์ดสำหรับค้นหา",

    english: "ภาษาอังกฤษ",
    thai: "ภาษาไทย",

    titlePlaceholder: "กรอกชื่อที่อธิบายไฟล์",
    altPlaceholder: "อธิบายสิ่งที่อยู่ในรูปสำหรับ Accessibility และ SEO",
    captionPlaceholder: "คำบรรยายเพิ่มเติมสำหรับแสดงร่วมกับไฟล์",
    keywordsPlaceholder: "โช้คประตู, อุปกรณ์ประตู, ทางเข้าอาคาร",

    keywordsHelp: "แยกแต่ละคีย์เวิร์ดด้วยเครื่องหมายจุลภาค",
    imageAltHelp:
      "อธิบายเนื้อหาในรูปให้ชัดเจน โดยไม่จำเป็นต้องขึ้นต้นว่า “รูปภาพของ”",
  },

  confirmDelete: {
    title: "ย้ายไฟล์นี้ไปถังขยะหรือไม่?",
    text: "สามารถกู้คืนไฟล์ได้ภายหลัง แต่ไฟล์ที่กำลังถูกใช้ในเนื้อหาเว็บไซต์จะไม่สามารถลบได้",
    confirm: "ย้ายไปถังขยะ",
    cancel: "ยกเลิก",
  },

  messages: {
    loadFailed: "ไม่สามารถโหลดคลังไฟล์ได้",
    uploadComplete: "อัปโหลดไฟล์เรียบร้อยแล้ว",
    uploadPartial: "มีบางไฟล์อัปโหลดไม่สำเร็จ กรุณาตรวจสอบและลองอีกครั้ง",
    uploadFailed: "ไม่สามารถอัปโหลดไฟล์ได้",
    updateSuccess: "บันทึกรายละเอียดไฟล์เรียบร้อยแล้ว",
    updateFailed: "ไม่สามารถบันทึกรายละเอียดไฟล์ได้",
    deleteSuccess: "ย้ายไฟล์ไปถังขยะเรียบร้อยแล้ว",
    deleteFailed: "ไม่สามารถย้ายไฟล์ไปถังขยะได้",
    copied: "คัดลอก URL ของไฟล์แล้ว",
    copyFailed: "ไม่สามารถคัดลอก URL ได้",
    invalidFile: "ไม่รองรับไฟล์ {{name}}",
    imageTooLarge: "รูป {{name}} มีขนาดเกิน 10 MB",
    documentTooLarge: "เอกสาร {{name}} มีขนาดเกิน 30 MB",
    duplicateFile: "เลือกไฟล์ {{name}} ไว้แล้ว",
  },

  pagination: {
    showing: "กำลังแสดง {{count}} ไฟล์",
    end: "โหลดไฟล์ทั้งหมดแล้ว",
  },
};

export default mediaTh;
