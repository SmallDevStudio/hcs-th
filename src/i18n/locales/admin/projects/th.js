const projectsTh = {
  page: {
    eyebrow: "จัดการโครงการ",
    title: "ผลงานอ้างอิง",
    description:
      "จัดการข้อมูลโครงการ สถานที่ ประเภทอาคาร ผลิตภัณฑ์ โซลูชัน รูปภาพ และ SEO",
  },

  actions: {
    create: "เพิ่มโครงการ",
    edit: "แก้ไขโครงการ",
    delete: "ย้ายไปถังขยะ",
    refresh: "รีเฟรช",
    search: "ค้นหา",
    reset: "ล้างตัวกรอง",
    loadMore: "โหลดเพิ่มเติม",
    save: "บันทึกโครงการ",
    saving: "กำลังบันทึก...",
    cancel: "ยกเลิก",
    close: "ปิด",
    saveOrder: "บันทึกลำดับ",
    generateSlug: "สร้าง Slug",
    selectCover: "เลือกรูปปก",
    changeCover: "เปลี่ยนรูปปก",
    addGalleryImage: "เพิ่มรูป Gallery",
    removeImage: "นำรูปออก",
    addResult: "เพิ่มผลลัพธ์",
    remove: "นำออก",
  },

  filters: {
    search: "ค้นหาโครงการ",
    searchPlaceholder: "ค้นหาจากชื่อโครงการ สถานที่ ลูกค้า หรือปี...",
    status: "สถานะ",
    allStatuses: "ทุกสถานะ",
    buildingType: "ประเภทอาคาร",
    allBuildingTypes: "ทุกประเภทอาคาร",
    featured: "โครงการแนะนำ",
    allFeatured: "ทุกโครงการ",
    featuredOnly: "เฉพาะโครงการแนะนำ",
  },

  table: {
    project: "โครงการ",
    location: "สถานที่",
    buildingType: "ประเภทอาคาร",
    year: "ปี",
    status: "สถานะ",
    home: "หน้าแรก",
    featured: "แนะนำ",
    order: "ลำดับ",
    actions: "จัดการ",
    showOnHome: "แสดงหน้าแรก",
    notShown: "—",
  },

  statuses: {
    draft: "แบบร่าง",
    published: "เผยแพร่",
  },

  buildingTypes: {
    hospitality: "โรงแรมและการบริการ",
    healthcare: "สถานพยาบาล",
    commercial: "อาคารพาณิชย์และสำนักงาน",
    industrial: "อุตสาหกรรม",
    residential: "ที่พักอาศัย",
    education: "สถานศึกษา",
    government: "หน่วยงานราชการ",
    retail: "ร้านค้าและศูนย์การค้า",
    transportation: "ระบบขนส่ง",
    "mixed-use": "อาคารอเนกประสงค์",
    other: "อื่น ๆ",
  },

  form: {
    createEyebrow: "รายละเอียดโครงการ",
    editEyebrow: "รายละเอียดโครงการ",
    createTitle: "เพิ่มโครงการ",
    editTitle: "แก้ไขโครงการ",
    createDescription:
      "สร้างผลงานอ้างอิงสองภาษา พร้อมรูปภาพ ความสัมพันธ์ และ SEO",
    editDescription: "แก้ไขเนื้อหา รูปภาพ ความสัมพันธ์ และ SEO ของโครงการ",

    basicSection: "ข้อมูลพื้นฐาน",
    contentSection: "เนื้อหาโครงการ",
    mediaSection: "รูปภาพโครงการ",
    relationshipsSection: "เนื้อหาที่เกี่ยวข้อง",
    resultsSection: "ผลลัพธ์ของโครงการ",
    displaySection: "การเผยแพร่และการแสดงผล",
    seoSection: "การปรับแต่งสำหรับเครื่องมือค้นหา",

    emptyResults: "ยังไม่ได้เพิ่มผลลัพธ์ของโครงการ",
    emptyGallery: "ยังไม่ได้เลือกรูป Gallery",

    seoHint: "ระบบจะสร้างชื่อ คำอธิบาย และคำค้นหา SEO ให้อัตโนมัติหากเว้นว่าง",
  },

  fields: {
    name: "ชื่อโครงการ",
    slug: "Slug",
    slugHint:
      "ใช้เป็น URL ของหน้าโครงการ รองรับตัวอักษรภาษาอังกฤษตัวเล็ก ตัวเลข และขีดกลาง",

    buildingType: "ประเภทอาคาร",
    location: "สถานที่",
    client: "ลูกค้า",
    year: "ปีที่แล้วเสร็จ",

    shortDescription: "คำอธิบายสั้น",
    description: "รายละเอียดโครงการ",
    challenge: "ความท้าทายของโครงการ",
    solution: "โซลูชันจาก HCS",

    result: "ผลลัพธ์",

    coverImage: "รูปปก",
    coverImageHint: "เลือกรูปแนวนอนหนึ่งรูปสำหรับการ์ดและส่วนหัวของหน้าโครงการ",

    gallery: "รูปภาพโครงการ",
    galleryHint: "เลือกได้หลายรูป และไม่สามารถใช้รูปปกซ้ำใน Gallery",

    relatedProducts: "ผลิตภัณฑ์ที่เกี่ยวข้อง",
    relatedProductsHint: "ผลิตภัณฑ์ที่ใช้หรือแนะนำสำหรับโครงการนี้",

    relatedSolutions: "โซลูชันที่เกี่ยวข้อง",
    relatedSolutionsHint: "โซลูชันที่สัมพันธ์กับโครงการนี้",

    status: "สถานะ",
    sortOrder: "ลำดับการแสดงผล",
    featured: "โครงการแนะนำ",
    showOnHome: "แสดงในหน้าแรก",

    seoTitle: "ชื่อ SEO",
    seoDescription: "คำอธิบาย SEO",
    seoKeywords: "คำค้นหา SEO",
    seoKeywordsHint: "คั่นคำค้นหาด้วยเครื่องหมายจุลภาค",

    productSearch: "ค้นหาผลิตภัณฑ์...",
    solutionSearch: "ค้นหาโซลูชัน...",
    selectedItems: "เลือกแล้ว {{count}} รายการ",
    noProducts: "ไม่มีผลิตภัณฑ์",
    noSolutions: "ไม่มีโซลูชัน",
    selectionLimit: "เลือกได้สูงสุด {{count}} รายการ",
  },

  placeholders: {
    name: "อาคารสำนักงาน กรุงเทพฯ",
    slug: "commercial-tower-bangkok",
    location: "กรุงเทพฯ ประเทศไทย",
    client: "เจ้าของโครงการหรือลูกค้า",
    year: "2026",
  },

  confirmDelete: {
    title: "ย้ายโครงการนี้ไปถังขยะ?",
    text: "สามารถกู้คืนโครงการภายหลังได้ และระบบจะปล่อยการใช้งานรูปภาพ",
    confirm: "ย้ายไปถังขยะ",
    cancel: "ยกเลิก",
  },

  messages: {
    createSuccess: "เพิ่มโครงการเรียบร้อยแล้ว",
    updateSuccess: "แก้ไขโครงการเรียบร้อยแล้ว",
    deleteSuccess: "ย้ายโครงการไปถังขยะแล้ว",
    reorderSuccess: "บันทึกลำดับโครงการแล้ว",

    createFailed: "ไม่สามารถเพิ่มโครงการได้",
    updateFailed: "ไม่สามารถแก้ไขโครงการได้",
    deleteFailed: "ไม่สามารถลบโครงการได้",
    loadFailed: "ไม่สามารถโหลดรายการโครงการได้",
    reorderFailed: "ไม่สามารถบันทึกลำดับโครงการได้",

    slugExists: "Slug นี้ถูกใช้งานแล้ว",
    publishIncomplete:
      "กรุณากรอกข้อมูลสองภาษา สถานที่ และรูปปกให้ครบก่อนเผยแพร่",
  },

  empty: {
    title: "ไม่พบโครงการ",
    description: "เพิ่มผลงานอ้างอิงโครงการแรกสำหรับเว็บไซต์ HCS",
    filteredDescription: "ไม่พบโครงการที่ตรงกับตัวกรอง",
  },
};

export default projectsTh;
