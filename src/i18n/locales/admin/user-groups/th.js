const userGroupsTh = {
  eyebrow: "การจัดการสิทธิ์ตามกลุ่ม",
  title: "กลุ่มสิทธิ์",
  description:
    "สร้างชุดสิทธิ์ที่นำกลับมาใช้ซ้ำได้ และกำหนดให้กับบัญชีผู้ดูแลระบบ",

  loading: "กำลังโหลดกลุ่มสิทธิ์...",

  common: {
    cancel: "ยกเลิก",
    close: "ปิด",
  },

  actions: {
    create: "เพิ่มกลุ่ม",
    edit: "แก้ไขกลุ่ม",
    delete: "ลบกลุ่ม",
    search: "ค้นหา",
    clear: "ล้างตัวกรอง",
    refresh: "รีเฟรช",
    loadMore: "โหลดเพิ่มเติม",
    viewUsers: "ดูผู้ใช้งาน",
  },

  filters: {
    search: "ค้นหากลุ่มสิทธิ์",
    searchPlaceholder: "ค้นหาจากชื่อกลุ่มหรือคำอธิบาย...",
    status: "สถานะ",
    allStatuses: "ทุกสถานะ",
  },

  statuses: {
    active: "ใช้งาน",
    inactive: "ปิดใช้งาน",
  },

  table: {
    group: "กลุ่มสิทธิ์",
    permissions: "สิทธิ์",
    members: "สมาชิก",
    status: "สถานะ",
    updatedAt: "แก้ไขล่าสุด",
    actions: "จัดการ",
    noDescription: "ไม่มีคำอธิบาย",
    permissionCount: "{{count}} สิทธิ์",
  },

  empty: {
    title: "ไม่พบกลุ่มสิทธิ์",
    description:
      "สร้างกลุ่มสิทธิ์เพื่อใช้กฎการเข้าถึงชุดเดียวกันกับผู้ใช้งานหลายคน",
    filteredDescription:
      "ไม่พบกลุ่มสิทธิ์ที่ตรงกับตัวกรอง กรุณาลองเปลี่ยนเงื่อนไขการค้นหา",
  },

  delete: {
    title: "ลบกลุ่มสิทธิ์นี้หรือไม่",
    text: 'กลุ่มสิทธิ์ "{{name}}" จะถูกลบออกจากระบบอย่างถาวร',
    confirm: "ลบกลุ่ม",

    inUseTitle: "ไม่สามารถลบกลุ่มนี้ได้",
    inUseText:
      "กลุ่มสิทธิ์นี้กำลังถูกกำหนดให้กับผู้ใช้งาน {{count}} คน กรุณานำกลุ่มออกจากผู้ใช้งานทั้งหมดก่อนลบ",
  },

  validation: {
    nameRequired: "กรุณาระบุชื่อกลุ่มสิทธิ์",
  },

  messages: {
    loadFailed: "ไม่สามารถโหลดกลุ่มสิทธิ์ได้",
    createSuccess: "สร้างกลุ่มสิทธิ์เรียบร้อยแล้ว",
    createFailed: "ไม่สามารถสร้างกลุ่มสิทธิ์ได้",
    updateSuccess: "แก้ไขกลุ่มสิทธิ์เรียบร้อยแล้ว",
    updateFailed: "ไม่สามารถแก้ไขกลุ่มสิทธิ์ได้",
    deleteSuccess: "ลบกลุ่มสิทธิ์เรียบร้อยแล้ว",
    deleteFailed: "ไม่สามารถลบกลุ่มสิทธิ์ได้",
  },

  form: {
    createEyebrow: "กลุ่มการเข้าถึงใหม่",
    createTitle: "เพิ่มกลุ่มสิทธิ์",
    createDescription: "สร้างชุดสิทธิ์สำหรับนำไปกำหนดให้กับบัญชีผู้ดูแลระบบ",

    editEyebrow: "สิทธิ์ของกลุ่ม",
    editTitle: "แก้ไขกลุ่มสิทธิ์",
    editDescription: "แก้ไขข้อมูลกลุ่ม สถานะ และสิทธิ์ที่กำหนดให้กับกลุ่ม",

    groupInformation: "ข้อมูลกลุ่ม",
    groupInformationDescription: "ชื่อ คำอธิบาย และสถานะการเปิดใช้งานกลุ่ม",

    name: "ชื่อกลุ่ม",
    description: "คำอธิบาย",
    status: "สถานะ",

    members: "ผู้ใช้งานในกลุ่ม",
    membersDescription:
      "ไม่สามารถลบกลุ่มสิทธิ์ได้ หากยังมีกลุ่มนี้กำหนดอยู่กับผู้ใช้งาน",

    permissions: "สิทธิ์ของกลุ่ม",
    permissionsDescription:
      "ผู้ใช้งานที่อยู่ในกลุ่มซึ่งเปิดใช้งาน จะได้รับสิทธิ์เหล่านี้เพิ่มเติมจากบทบาทและสิทธิ์เฉพาะของตน",

    selectCategory: "เลือกทั้งหมด",
    clearCategory: "ล้าง",

    saving: "กำลังบันทึก...",
    saveChanges: "บันทึกการแก้ไข",
    createGroup: "สร้างกลุ่ม",
  },
};

export default userGroupsTh;
