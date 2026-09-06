const trashTh = {
  eyebrow: "ข้อมูลที่ถูกลบ",
  title: "ถังขยะ",
  description: "ตรวจสอบ กู้คืน หรือลบข้อมูลที่ถูกนำออกจากระบบอย่างถาวร",

  filters: {
    entityType: "ประเภทข้อมูล",
    allEntities: "ทุกประเภทข้อมูล",
    apply: "ใช้ตัวกรอง",
    reset: "ล้างตัวกรอง",
  },

  table: {
    item: "รายการ",
    type: "ประเภทข้อมูล",
    deletedBy: "ลบโดย",
    deletedAt: "วันที่ลบ",
    expiresAt: "เก็บไว้ถึง",
    actions: "จัดการ",
    unknownUser: "ไม่ทราบผู้ใช้งาน",
    unnamed: "รายการไม่มีชื่อ",
  },

  entities: {
    page: "หน้าเว็บไซต์",
    category: "หมวดหมู่",
    product: "สินค้า",
    solution: "โซลูชัน",
    project: "โครงการ",
    standard: "มาตรฐาน",
    download: "ไฟล์ดาวน์โหลด",
    media: "ไฟล์สื่อ",
    message: "ข้อความ",
  },

  actions: {
    restore: "กู้คืน",
    restoring: "กำลังกู้คืน...",
    deletePermanently: "ลบถาวร",
    deleting: "กำลังลบ...",
    loadMore: "โหลดเพิ่มเติม",
    loading: "กำลังโหลด...",
  },

  confirmRestore: {
    title: "ต้องการกู้คืนรายการนี้หรือไม่?",
    text: "ข้อมูลจะถูกนำกลับไปยัง Collection เดิม",
    confirm: "กู้คืนข้อมูล",
    cancel: "ยกเลิก",
  },

  confirmDelete: {
    title: "ต้องการลบรายการนี้ถาวรหรือไม่?",
    text: "การดำเนินการนี้ไม่สามารถย้อนกลับได้ และข้อมูลต้นฉบับจะถูกลบถาวร",
    confirm: "ลบถาวร",
    cancel: "ยกเลิก",
  },

  messages: {
    restored: "กู้คืนข้อมูลเรียบร้อยแล้ว",
    restoreFailed: "ไม่สามารถกู้คืนข้อมูลได้",
    deleted: "ลบข้อมูลถาวรเรียบร้อยแล้ว",
    deleteFailed: "ไม่สามารถลบข้อมูลถาวรได้",
    loadFailed: "ไม่สามารถโหลดข้อมูลในถังขยะได้",
    empty: "ยังไม่มีข้อมูลในถังขยะ",
    filteredEmpty: "ไม่พบข้อมูลที่ตรงกับตัวกรอง",
  },

  pagination: {
    showing: "กำลังแสดง {{count}} รายการ",
    end: "ไม่มีข้อมูลเพิ่มเติม",
  },
};

export default trashTh;
