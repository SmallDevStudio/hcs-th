const adminHomeTh = {
  heroes: {
    eyebrow: "จัดการหน้าแรก",

    title: "สไลด์ Hero หน้าแรก",

    description:
      "จัดการสไลด์ประชาสัมพันธ์ที่แสดงอยู่ด้านบนสุดของหน้าแรกเว็บไซต์",

    fallbackTitle: "สไลด์ Hero ที่ยังไม่มีชื่อ",

    summary: "สไลด์ Hero {{count}} รายการ",

    orderUnsaved: "มีการเปลี่ยนลำดับที่ยังไม่ได้บันทึก",

    statuses: {
      draft: "ฉบับร่าง",

      published: "เผยแพร่แล้ว",
    },

    visibility: {
      draft: "ยังไม่เผยแพร่",

      active: "กำลังแสดง",

      scheduled: "ตั้งเวลาไว้",

      expired: "หมดเวลาแสดง",
    },

    filters: {
      status: "สถานะ",

      allStatuses: "ทุกสถานะ",
    },

    table: {
      hero: "สไลด์ Hero",

      status: "สถานะ",

      visibility: "การแสดงผล",

      schedule: "กำหนดเวลาแสดง",

      order: "ลำดับ",

      actions: "จัดการ",
    },

    actions: {
      add: "เพิ่มสไลด์ Hero",

      edit: "แก้ไขสไลด์ Hero",

      delete: "ลบสไลด์ Hero",

      refresh: "รีเฟรช",

      filter: "กรองข้อมูล",

      clearFilters: "ล้างตัวกรอง",

      saveOrder: "บันทึกลำดับ",

      moveUp: "เลื่อนขึ้น",

      moveDown: "เลื่อนลง",

      selectImage: "เลือกรูปภาพ",

      changeImage: "เปลี่ยนรูปภาพ",

      removeImage: "นำรูปภาพออก",

      cancel: "ยกเลิก",

      close: "ปิด",

      save: "บันทึกสไลด์ Hero",
    },

    form: {
      createEyebrow: "Hero หน้าแรก",

      editEyebrow: "รายละเอียดสไลด์ Hero",

      createTitle: "เพิ่มสไลด์ Hero",

      editTitle: "แก้ไขสไลด์ Hero",

      createDescription:
        "สร้างสไลด์ประชาสัมพันธ์สำหรับแสดงบนหน้าแรกของเว็บไซต์",

      editDescription: "แก้ไขเนื้อหา รูปภาพ ปุ่มเชื่อมโยง และกำหนดเวลาแสดงผล",

      contentSection: "เนื้อหา Hero",

      contentDescription:
        "ระบุเนื้อหาภาษาอังกฤษและภาษาไทยที่จะแสดงทับบนรูป Hero",

      actionsSection: "ปุ่มดำเนินการ",

      actionsDescription: "กำหนดปุ่มหลักและปุ่มรองที่จะแสดงในสไลด์นี้",

      primaryAction: "ปุ่มหลัก",

      secondaryAction: "ปุ่มรอง",

      mediaSection: "รูปภาพ Hero",

      mediaDescription: "เลือกรูปภาพที่เหมาะสมสำหรับหน้าจอ Desktop และ Mobile",

      mobileFallbackHint:
        "หากไม่ได้เลือกรูป Mobile ระบบจะนำรูป Desktop มาใช้โดยอัตโนมัติ",

      displaySection: "การเผยแพร่และการจัดลำดับ",

      displayDescription: "กำหนดสถานะการเผยแพร่และลำดับการแสดงสไลด์",

      scheduleSection: "กำหนดเวลาแสดงผล",

      scheduleDescription: "สามารถกำหนดวันและเวลาที่สไลด์เริ่มและหยุดแสดงได้",
    },

    fields: {
      eyebrow: "ข้อความกำกับด้านบน",

      titleLineOne: "หัวเรื่อง — บรรทัดแรก",

      titleLineTwo: "หัวเรื่อง — บรรทสอง",

      description: "คำอธิบาย",

      actionLabel: "ข้อความบนปุ่ม",

      actionUrl: "ลิงก์ของปุ่ม",

      actionUrlHint:
        "ใช้ path ภายใน เช่น /products หรือ URL แบบ HTTPS ที่สมบูรณ์",

      desktopImage: "รูปสำหรับ Desktop",

      desktopImageHint: "รูป Hero หลักสำหรับคอมพิวเตอร์และแท็บเล็ต",

      desktopImageEmpty: "เลือกรูปแนวกว้างสำหรับ Hero บน Desktop",

      desktopImageSize: "ขนาดแนะนำ: 1920 × 760 px",

      mobileImage: "รูปสำหรับ Mobile",

      mobileImageHint: "รูปแนวตั้งสำหรับหน้าจอโทรศัพท์มือถือ สามารถเว้นว่างได้",

      mobileImageEmpty: "เลือกรูปแนวตั้งสำหรับโทรศัพท์มือถือ",

      mobileImageSize: "ขนาดแนะนำ: 900 × 1200 px",

      status: "สถานะ",

      sortOrder: "ลำดับการแสดง",

      sortOrderHint: "รายการที่มีตัวเลขน้อยกว่าจะแสดงก่อน",

      startsAt: "เริ่มแสดงเมื่อ",

      startsAtHint: "เว้นว่างเพื่อให้แสดงทันทีหลังเผยแพร่",

      endsAt: "หยุดแสดงเมื่อ",

      endsAtHint: "เว้นว่างเพื่อแสดงต่อไปโดยไม่มีกำหนด",
    },

    empty: {
      title: "ยังไม่มีสไลด์ Hero",

      description: "เพิ่มสไลด์ Hero รายการแรกสำหรับหน้าแรกของเว็บไซต์",

      filteredDescription: "ไม่พบสไลด์ Hero ที่ตรงกับสถานะที่เลือก",
    },

    delete: {
      title: "ย้ายสไลด์ Hero ไปยังถังขยะหรือไม่",

      description: '"{{title}}" จะถูกนำออกจากหน้าแรกและย้ายไปยังถังขยะ',

      confirm: "ย้ายไปถังขยะ",
    },

    messages: {
      loadFailed: "ไม่สามารถโหลดสไลด์ Hero ได้",

      createSuccess: "เพิ่มสไลด์ Hero เรียบร้อยแล้ว",

      createFailed: "ไม่สามารถเพิ่มสไลด์ Hero ได้",

      updateSuccess: "บันทึกการแก้ไขสไลด์ Hero เรียบร้อยแล้ว",

      updateFailed: "ไม่สามารถแก้ไขสไลด์ Hero ได้",

      deleteSuccess: "ย้ายสไลด์ Hero ไปยังถังขยะแล้ว",

      deleteFailed: "ไม่สามารถลบสไลด์ Hero ได้",

      reorderSuccess: "บันทึกลำดับสไลด์ Hero เรียบร้อยแล้ว",

      reorderFailed: "ไม่สามารถบันทึกลำดับสไลด์ Hero ได้",

      publishIncomplete:
        "ก่อนเผยแพร่ต้องระบุหัวเรื่องภาษาอังกฤษ ภาษาไทย และรูป Desktop",
    },
  },
};

export default adminHomeTh;
