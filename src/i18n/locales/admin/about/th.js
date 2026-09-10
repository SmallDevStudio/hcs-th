const adminAboutTh = {
  eyebrow: "หน้าเว็บไซต์",

  title: "จัดการหน้าเกี่ยวกับเรา",

  description:
    "สร้างและเผยแพร่หน้าเกี่ยวกับเราแบบสองภาษา ด้วย Section ที่จัดวางได้อย่างอิสระ",

  status: {
    draft: "ฉบับร่าง",

    published: "เผยแพร่แล้ว",

    unpublished: "ยังไม่เผยแพร่",

    unsaved: "มีการแก้ไขที่ยังไม่บันทึก",

    saved: "บันทึกการเปลี่ยนแปลงทั้งหมดแล้ว",

    saving: "กำลังบันทึกฉบับร่าง...",

    publishing: "กำลังเผยแพร่...",

    unpublishing: "กำลังยกเลิกการเผยแพร่...",

    lastSaved: "บันทึกล่าสุด {{date}}",

    draftVersion: "ฉบับร่างเวอร์ชัน {{version}}",

    publishedVersion: "เวอร์ชันที่เผยแพร่ {{version}}",
  },

  actions: {
    save: "บันทึกฉบับร่าง",

    publish: "เผยแพร่",

    unpublish: "ยกเลิกเผยแพร่",

    reload: "โหลดใหม่",

    preview: "ดูตัวอย่าง",

    addSection: "เพิ่ม Section",

    duplicate: "ทำสำเนา",

    delete: "ลบ",

    moveUp: "เลื่อนขึ้น",

    moveDown: "เลื่อนลง",

    enable: "เปิดใช้งาน",

    disable: "ซ่อน Section",

    expand: "ขยาย",

    collapse: "ย่อ",

    addAction: "เพิ่มปุ่ม",

    addItem: "เพิ่มรายการ",

    selectImage: "เลือกรูปภาพ",

    changeImage: "เปลี่ยนรูปภาพ",

    removeImage: "นำรูปออก",

    retry: "ลองอีกครั้ง",
  },

  seo: {
    eyebrow: "การตั้งค่าสำหรับ Search Engine",

    title: "ตั้งค่า SEO",

    description:
      "กำหนดชื่อหน้า คำอธิบายสำหรับการค้นหา และรูปภาพเมื่อแชร์หน้าเกี่ยวกับเรา",

    fields: {
      title: "ชื่อ SEO",

      description: "คำอธิบาย SEO",

      image: "รูปภาพสำหรับแชร์",

      imageAlt: "ข้อความอธิบายรูปภาพ",
    },

    hints: {
      title: "ความยาวที่แนะนำอยู่ระหว่าง 50–60 ตัวอักษร",

      description: "ความยาวที่แนะนำอยู่ระหว่าง 140–160 ตัวอักษร",

      image: "ขนาดแนะนำ 1200 × 630 px ใช้เมื่อแชร์หน้าเกี่ยวกับเรา",

      localized: "กรอกข้อมูลภาษาอังกฤษและภาษาไทยแยกจากกัน",
    },

    counters: {
      title: "{{count}}/{{maximum}} ตัวอักษร",

      description: "{{count}}/{{maximum}} ตัวอักษร",
    },
  },

  sections: {
    eyebrow: "เนื้อหาของหน้า",

    title: "Content Sections",

    description:
      "เพิ่ม จัดลำดับ และกำหนดรูปแบบ Section ที่จะแสดงบนหน้าเกี่ยวกับเรา",

    count: "{{count}} Sections",

    empty: {
      title: "ยังไม่มี Section",

      description: "เพิ่ม Section แรกเพื่อเริ่มสร้างหน้าเกี่ยวกับเรา",
    },

    addMenuTitle: "เลือกประเภท Section",

    internalLabel: "ชื่อเรียกภายในระบบ",

    internalLabelHint: "ใช้เฉพาะในหน้า Admin เพื่อช่วยแยกแต่ละ Section",

    sectionEnabled: "เปิดแสดง Section",

    sectionDisabled: "ซ่อน Section",

    types: {
      hero: {
        title: "Hero",

        description: "Section แนะนำหลักขนาดใหญ่ที่แสดงด้านบนสุดของหน้า",
      },

      "rich-content": {
        title: "เนื้อหาแบบอิสระ",

        description: "เนื้อหาสองภาษาแบบ Rich Text พร้อมรูปภาพเสริม",
      },

      "feature-grid": {
        title: "Feature Grid",

        description: "แสดงคุณค่า บริการ หรือจุดแข็งของบริษัทในรูปแบบ Card",
      },

      statistics: {
        title: "สถิติ",

        description: "แสดงตัวเลขสำคัญและผลการดำเนินงานของบริษัท",
      },

      cta: {
        title: "Call to Action",

        description: "เชิญชวนผู้เยี่ยมชมให้ติดต่อบริษัทหรือดูผลิตภัณฑ์",
      },
    },
  },

  content: {
    eyebrow: "ข้อความกำกับ",

    title: "หัวข้อ",

    body: "เนื้อหา",

    image: "รูปภาพ Section",

    imageAlt: "ข้อความอธิบายรูปภาพ",

    actions: "ปุ่ม",

    items: "รายการ",

    value: "ค่า",

    icon: "ไอคอน",

    buttonLabel: "ข้อความบนปุ่ม",

    buttonUrl: "URL ของปุ่ม",

    openInNewTab: "เปิดในแท็บใหม่",

    noImage: "ยังไม่ได้เลือกรูปภาพ",

    imageHint: "เลือกรูปภาพจาก Media Library",
  },

  layout: {
    title: "การจัดวางและรูปแบบ",

    variant: "รูปแบบ Layout",

    imagePosition: "ตำแหน่งรูปภาพ",

    imageRatio: "สัดส่วนรูปภาพ",

    contentAlignment: "การจัดแนวเนื้อหา",

    background: "พื้นหลัง",

    variants: {
      "full-width": "เต็มความกว้าง",

      contained: "อยู่ภายใน Container",

      split: "แบ่งเนื้อหา",

      grid: "Grid",

      banner: "Banner",
    },

    imagePositions: {
      none: "ไม่มีรูปภาพ",

      left: "รูปภาพด้านซ้าย",

      right: "รูปภาพด้านขวา",

      background: "รูปภาพพื้นหลัง",
    },

    imageRatios: {
      auto: "อัตโนมัติ",

      "16/9": "แนวนอน 16:9",

      "4/3": "มาตรฐาน 4:3",

      "1/1": "จัตุรัส 1:1",

      "3/4": "แนวตั้ง 3:4",
    },

    alignments: {
      left: "ชิดซ้าย",

      center: "กึ่งกลาง",

      right: "ชิดขวา",
    },

    backgrounds: {
      white: "สีขาว",

      muted: "สีพื้นหลังอ่อน",

      brand: "สีของแบรนด์",

      dark: "สีเข้ม",
    },
  },

  buttonStyles: {
    primary: "ปุ่มหลัก",

    secondary: "ปุ่มรอง",

    outline: "เส้นขอบ",

    link: "ลิงก์ข้อความ",
  },

  languages: {
    english: "English",

    thai: "ภาษาไทย",

    en: "EN",

    th: "TH",

    contentAdded: "เพิ่มเนื้อหาแล้ว",

    empty: "ว่าง",
  },

  confirmations: {
    deleteSection: {
      title: "ลบ Section นี้?",

      text: "Section จะถูกนำออกจากฉบับร่าง และต้องบันทึกฉบับร่างเพื่อยืนยันการเปลี่ยนแปลง",

      confirm: "ลบ Section",
    },

    publish: {
      title: "เผยแพร่หน้าเกี่ยวกับเรา?",

      text: "ฉบับร่างปัจจุบันจะนำไปแทนหน้าเกี่ยวกับเราที่แสดงอยู่บนเว็บไซต์",

      confirm: "เผยแพร่",
    },

    unpublish: {
      title: "ยกเลิกเผยแพร่หน้าเกี่ยวกับเรา?",

      text: "หน้าเกี่ยวกับเราที่เผยแพร่จะถูกนำออก และหน้า Public จะกลับไปแสดงเนื้อหาสำรองเดิม",

      confirm: "ยกเลิกเผยแพร่",
    },

    reload: {
      title: "ยกเลิกการแก้ไขที่ยังไม่บันทึก?",

      text: "ระบบจะโหลดฉบับร่างล่าสุด และการแก้ไขภายในเครื่องจะหายไป",

      confirm: "โหลดฉบับร่างใหม่",
    },
  },

  messages: {
    saveSuccess: "บันทึกฉบับร่างหน้าเกี่ยวกับเราแล้ว",

    saveFailed: "ไม่สามารถบันทึกฉบับร่างหน้าเกี่ยวกับเราได้",

    publishSuccess: "เผยแพร่หน้าเกี่ยวกับเราแล้ว",

    publishFailed: "ไม่สามารถเผยแพร่หน้าเกี่ยวกับเราได้",

    unpublishSuccess: "ยกเลิกเผยแพร่หน้าเกี่ยวกับเราแล้ว",

    unpublishFailed: "ไม่สามารถยกเลิกเผยแพร่หน้าเกี่ยวกับเราได้",

    reloadSuccess: "โหลดฉบับร่างล่าสุดแล้ว",

    reloadFailed: "ไม่สามารถโหลดหน้าเกี่ยวกับเราได้",

    versionConflict:
      "มีผู้ดูแลระบบคนอื่นแก้ไขหน้านี้ กรุณาโหลดฉบับร่างล่าสุดก่อนดำเนินการต่อ",

    publishIncomplete:
      "กรุณากรอกข้อมูลภาษาอังกฤษและภาษาไทยที่จำเป็นให้ครบก่อนเผยแพร่",
  },
};

export default adminAboutTh;
