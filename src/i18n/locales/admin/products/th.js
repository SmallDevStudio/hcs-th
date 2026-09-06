const productsTh = {
  eyebrow: "จัดการสินค้า",

  title: "สินค้า",

  description:
    "จัดการข้อมูลสินค้า รายละเอียดทางเทคนิค สีและผิวสำเร็จ มาตรฐาน รูปภาพ เอกสาร และ SEO",

  actions: {
    create: "เพิ่มสินค้า",
    edit: "แก้ไขสินค้า",
    delete: "ย้ายไปถังขยะ",
    refresh: "รีเฟรช",
    search: "ค้นหา",
    clear: "ล้างตัวกรอง",
    close: "ปิด",
    cancel: "ยกเลิก",
    save: "บันทึกสินค้า",
    saving: "กำลังบันทึก...",
    saveOrder: "บันทึกลำดับ",
    selectImage: "เลือกรูปภาพ",
    changeImage: "เปลี่ยนรูปภาพ",
    removeImage: "นำรูปภาพออก",
    addGalleryImage: "เพิ่มรูปแกลเลอรี",
    addDocument: "เพิ่มเอกสาร",
    addFeature: "เพิ่มคุณสมบัติ",
    addVariation: "เพิ่มรุ่นย่อย",
    addSpecification: "เพิ่มข้อมูลทางเทคนิค",
    addFinish: "เพิ่มสีและผิวสำเร็จ",
    addStandard: "เพิ่มมาตรฐาน",
    remove: "นำออก",
    generateSlug: "สร้าง Slug",
    generateTypeSlug: "สร้าง Type Slug",
    loadMore: "โหลดเพิ่มเติม",
    loadingMore: "กำลังโหลด...",
  },

  filters: {
    search: "ค้นหาสินค้า",
    searchPlaceholder: "ค้นหาจากชื่อ รุ่น SKU หรือมาตรฐาน...",

    status: "สถานะ",
    allStatuses: "ทุกสถานะ",

    category: "หมวดหมู่",
    allCategories: "ทุกหมวดหมู่",

    productType: "ประเภทสินค้า",
    allProductTypes: "ทุกประเภทสินค้า",

    fireRated: "การทนไฟ",
    allFireRatings: "สินค้าทั้งหมด",
    fireRatedOnly: "เฉพาะสินค้าทนไฟ",
    nonFireRatedOnly: "เฉพาะสินค้าที่ไม่ทนไฟ",
  },

  statuses: {
    draft: "ฉบับร่าง",
    published: "เผยแพร่",
    inactive: "ไม่ใช้งาน",
  },

  table: {
    product: "สินค้า",
    model: "รุ่น / รหัสอ้างอิง",
    category: "หมวดหมู่",
    type: "ประเภทสินค้า",
    status: "สถานะ",
    home: "หน้าแรก",
    fireRated: "ทนไฟ",
    order: "ลำดับ",
    actions: "จัดการ",
  },

  badges: {
    featured: "สินค้าแนะนำ",
    showOnHome: "แสดงหน้าแรก",
    fireRated: "ทนไฟ",
    noImage: "ไม่มีรูปภาพ",
  },

  form: {
    createEyebrow: "สินค้าใหม่",
    createTitle: "เพิ่มสินค้า",
    createDescription: "กรอกเนื้อหาสินค้าสองภาษาและข้อมูลทางเทคนิค",

    editEyebrow: "รายละเอียดสินค้า",
    editTitle: "แก้ไขสินค้า",
    editDescription: "แก้ไขเนื้อหา ข้อมูลทางเทคนิค ไฟล์สื่อ และ SEO",

    basicSection: "ข้อมูลพื้นฐาน",

    descriptionSection: "เนื้อหาสินค้า",

    mediaSection: "รูปภาพและเอกสาร",

    technicalSection: "ข้อมูลทางเทคนิค",

    displaySection: "การเผยแพร่และการแสดงผล",

    seoSection: "การค้นหาและ SEO",

    featuresSection: "คุณสมบัติสินค้า",

    variationsSection: "รุ่นย่อยและตัวเลือก",

    specificationsSection: "รายละเอียดทางเทคนิค",

    finishesSection: "สีและผิวสำเร็จ",

    standardsSection: "มาตรฐานและใบรับรอง",

    emptyFeatures: "ยังไม่ได้เพิ่มคุณสมบัติสินค้า",

    emptyVariations: "ยังไม่ได้เพิ่มรุ่นย่อยหรือตัวเลือก",

    emptySpecifications: "ยังไม่ได้เพิ่มรายละเอียดทางเทคนิค",

    emptyFinishes: "ยังไม่ได้เพิ่มสีหรือผิวสำเร็จ",

    emptyStandards: "ยังไม่ได้เพิ่มมาตรฐาน",
  },

  fields: {
    name: "ชื่อสินค้า",

    slug: "URL Slug",
    slugHint: "ใช้ตัวอักษรภาษาอังกฤษตัวเล็ก ตัวเลข และขีดกลางเท่านั้น",

    model: "รุ่น / รหัสอ้างอิง",

    sku: "SKU",

    category: "หมวดหมู่สินค้า",

    productType: "ประเภทสินค้า",

    productTypeSlug: "Product Type Slug",

    series: "ซีรีส์ / กลุ่มสินค้า",

    shortDescription: "คำอธิบายแบบย่อ",

    description: "รายละเอียดสินค้า",

    primaryImage: "รูปภาพหลักของสินค้า",

    primaryImageHint: "แนะนำให้ใช้ภาพสินค้าพื้นหลังโปร่งใสหรือพื้นหลังสีขาว",

    gallery: "แกลเลอรีสินค้า",

    galleryHint: "รูปภาพสินค้าเพิ่มเติม สูงสุด 12 ไฟล์",

    documents: "เอกสารสินค้า",

    documentsHint: "Datasheet คู่มือติดตั้ง และใบรับรอง สูงสุด 12 ไฟล์",

    feature: "คุณสมบัติ",

    variation: "รุ่นย่อยหรือตัวเลือก",

    specificationLabel: "หัวข้อ",

    specificationValue: "ค่า",

    finishCode: "รหัสสีหรือผิวสำเร็จ",

    finishName: "ชื่อสีหรือผิวสำเร็จ",

    standardName: "มาตรฐาน",

    classification: "Classification",

    conformityReference: "เลขอ้างอิงการรับรอง",

    fireRated: "สินค้ารองรับงานประตูกันไฟ",

    status: "สถานะ",

    featured: "สินค้าแนะนำ",

    showOnHome: "แสดงในหน้าแรก",

    sortOrder: "ลำดับการแสดง",

    seoTitle: "ชื่อสำหรับ SEO",

    seoDescription: "คำอธิบายสำหรับ SEO",

    seoKeywords: "คำค้นหา SEO",

    seoKeywordsHint: "คั่นคำค้นหาด้วยเครื่องหมายจุลภาค",
  },

  placeholders: {
    nameEn: "Cam Action Door Closer",
    nameTh: "โช้คอัพประตูระบบแคมแอคชัน",

    slug: "kd-915-cam-action-door-closer",

    model: "KD 915",

    sku: "KD-915",

    productTypeEn: "Door Closer",

    productTypeTh: "โช้คอัพประตู",

    productTypeSlug: "door-closer",

    seriesEn: "Premium Door Closers",

    seriesTh: "โช้คอัพประตูรุ่นพรีเมียม",

    specificationLabelEn: "Door width",

    specificationLabelTh: "ความกว้างประตู",

    specificationValueEn: "Up to 1,250 mm",

    specificationValueTh: "สูงสุด 1,250 มม.",

    finishCode: "SSS",

    finishNameEn: "Satin Stainless Steel",

    finishNameTh: "สเตนเลสสตีลผิวด้าน",

    standardName: "EN 1154",

    classification: "4 8 3/6 1 1 3",

    conformityReference: "1121-CPR-AD5001",
  },

  mediaPicker: {
    imageEyebrow: "รูปภาพสินค้า",
    imageTitle: "เลือกรูปภาพสินค้า",
    imageDescription: "เลือกรูปภาพจากคลังไฟล์สำหรับใช้กับสินค้านี้",

    documentEyebrow: "เอกสารสินค้า",
    documentTitle: "เลือกเอกสารสินค้า",
    documentDescription:
      "เลือก Datasheet คู่มือติดตั้ง ใบรับรอง หรือไฟล์ดาวน์โหลดอื่น ๆ",

    search: "ค้นหา",
    imageSearchPlaceholder: "ค้นหารูปภาพสินค้า...",
    documentSearchPlaceholder: "ค้นหาเอกสาร...",

    selected: "เลือกแล้ว {{count}} / {{maximum}}",

    loading: "กำลังโหลดไฟล์สื่อ...",

    emptyImages: "ไม่พบรูปภาพ",
    emptyDocuments: "ไม่พบเอกสาร",

    loadMore: "โหลดเพิ่มเติม",

    cancel: "ยกเลิก",

    useImage: "ใช้รูปภาพนี้",
    useImages: "ใช้รูปภาพที่เลือก",
    useDocuments: "ใช้เอกสารที่เลือก",

    singleSelectionHint: "เลือกหนึ่งไฟล์เพื่อดำเนินการต่อ",
    multipleSelectionHint: "สามารถเลือกไฟล์ได้ไม่เกินจำนวนสูงสุดที่แสดงด้านบน",
  },

  confirmDelete: {
    title: "ย้ายสินค้านี้ไปถังขยะ?",

    text: "สามารถกู้คืนสินค้าได้ภายหลัง ระบบจะลดจำนวนสินค้าในหมวดหมู่และยกเลิกการใช้ไฟล์สื่อชั่วคราว",

    confirm: "ย้ายไปถังขยะ",

    cancel: "ยกเลิก",
  },

  messages: {
    loadFailed: "ไม่สามารถโหลดรายการสินค้าได้",

    createSuccess: "เพิ่มสินค้าเรียบร้อยแล้ว",

    createFailed: "ไม่สามารถเพิ่มสินค้าได้",

    updateSuccess: "แก้ไขสินค้าเรียบร้อยแล้ว",

    updateFailed: "ไม่สามารถแก้ไขสินค้าได้",

    deleteSuccess: "ย้ายสินค้าไปถังขยะเรียบร้อยแล้ว",

    deleteFailed: "ไม่สามารถย้ายสินค้าไปถังขยะได้",

    orderSuccess: "บันทึกลำดับสินค้าเรียบร้อยแล้ว",

    orderFailed: "ไม่สามารถบันทึกลำดับสินค้าได้",

    slugExists: "URL Slug นี้ถูกใช้งานแล้ว",

    skuExists: "SKU นี้ถูกใช้งานแล้ว",

    categoryLoadFailed: "ไม่สามารถโหลดหมวดหมู่สินค้าได้",

    mediaLoadFailed: "ไม่สามารถโหลดไฟล์สื่อได้",

    publishIncomplete:
      "กรุณากรอกเนื้อหาทั้งสองภาษาและเลือกรูปภาพหลักก่อนเผยแพร่",
  },

  empty: {
    title: "ยังไม่มีสินค้า",

    description: "เพิ่มสินค้าแรกเพื่อเริ่มสร้างแคตตาล็อกสินค้า",

    filteredDescription: "ไม่พบสินค้าที่ตรงกับตัวกรอง",
  },
};

export default productsTh;
