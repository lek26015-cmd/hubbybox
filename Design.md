# Design System: Beam Checkout Aesthetics

เอกสารนี้รวบรวมแนวทางการออกแบบ (Design System) ที่ถอดแบบมาจากสไตล์ของ **Beam Checkout** (Modern Payment Experience) เพื่อนำมาประยุกต์ใช้กับโปรเจกต์ Hubbybox เพื่อให้ได้ UI ที่ดูพรีเมียม สะอาดตา และใช้งานง่ายที่สุด (Seamless Experience)

---

## 1. Core Philosophy (ปรัชญาการออกแบบ)
- **Frictionless:** ลดขั้นตอนการกรอกข้อมูลให้เหลือน้อยที่สุด UI ต้องดูไม่เกะกะและไม่น่ากลัว
- **Trust & Security:** ใช้พื้นที่สีขาว (White Space) และโครงสร้างที่ชัดเจน เพื่อสร้างความน่าเชื่อถือ
- **Mobile-First:** ออกแบบสำหรับหน้าจอสมาร์ทโฟนเป็นหลัก ปุ่มต้องใหญ่พอดีกับนิ้วมือ (Touch Target)
- **Micro-interactions:** มีแอนิเมชันเล็กๆ น้อยๆ เพื่อตอบสนองต่อการกระทำของผู้ใช้ (เช่น กดปุ่มแล้วมี Loading State เนียนๆ)

---

## 2. Typography (ฟอนต์)
อ้างอิงจาก Beam Checkout จะใช้ฟอนต์ที่อ่านง่าย สไตล์ Modern Sans-serif
- **Primary Font (English):** `Inter` หรือ `Lexend Deca` (เน้นความกว้าง อ่านง่าย ดูเทค)
- **Secondary Font (Thai):** `IBM Plex Sans Thai` (เป็นทางการแต่มินิมอล) หรือ `Kodchasan` (ที่มีอยู่แล้วใน Hubbybox)
- **Font Weights:**
  - `Regular (400)` สำหรับเนื้อหาทั่วไป
  - `Medium (500)` สำหรับ Label และข้อมูลที่ต้องการเน้น
  - `Bold (700)` หรือ `Black (900)` สำหรับหัวข้อและจำนวนเงิน

---

## 3. Color Palette (โทนสี)
เน้นสีพื้นหลังที่สว่างสะอาดตา (Clean & Soft) ตัดกับตัวหนังสือสีเข้ม และปุ่ม Call-to-Action สีสดใส

- **Backgrounds:**
  - `Main Background:` `#FAFAFA` หรือ `#F5F5F5` (สีเทาอ่อนๆ สบายตา ไม่สว่างจ้าจนเกินไป)
  - `Card Background:` `#FFFFFF` (สีขาวล้วน เพื่อให้การ์ดลอยเด่นขึ้นมาจากพื้นหลัง)
- **Text:**
  - `Primary Text:` `#212121` หรือ `#171A1C` (ดำอมเทา ไม่ดำสนิท เพื่อลดความล้าของสายตา)
  - `Secondary Text:` `#757575` หรือ `#9FA6AD` (สีเทาสำหรับคำอธิบายรอง)
- **Primary Action (Brand / Call-to-Action):**
  - เช่น สีฟ้าของ Beam (`#0B6BCB`) หรือสี Primary ของ Hubbybox (ปรับให้มีความสว่างเล็กน้อย)
  - `Hover/Active State:` เข้มขึ้นเล็กน้อย
- **Status Colors:**
  - `Success:` `#1F7A1F` หรือ `#06C755` (สีเขียวสว่างสำหรับ Success / LINE Login)
  - `Error:` `#C41C1C` หรือ `#E53E3E` (สีแดงหม่น ไม่สว่างจนแยงตา)

---

## 4. UI Components & Layouts (องค์ประกอบและโครงสร้าง)

### 4.1 Floating Card (การ์ดลอยเด่น)
- **Border Radius (ความโค้ง):** เน้นความโค้งมนที่ดูละมุน เช่น `16px` (`rounded-2xl`) ถึง `24px` (`rounded-3xl`)
- **Shadows (เงา):** ใช้เงาแบบฟุ้งและนุ่มนวล (Soft, Diffuse Shadow) ไม่ใช่เงาแข็ง
  - *Tailwind CSS:* `shadow-xl shadow-slate-200/50` หรือ `shadow-[0_8px_30px_rgb(0,0,0,0.04)]`

### 4.2 Inputs & Forms (ช่องกรอกข้อมูล)
- ขนาด Input ต้องใหญ่และแตะง่าย (height อย่างน้อย `48px` ถึง `56px`)
- **Border:** ไม่มีกรอบสีดำเข้ม แต่ใช้พื้นหลังสีเทาอ่อน `#F0F4F8` หรือกรอบบางๆ `border-slate-200`
- **Focus State:** เมื่อกดพิมพ์ ให้มีกรอบเปลี่ยนเป็นสี Primary อ่อนๆ และพื้นหลังเปลี่ยนเป็นสีขาว
- รองรับการทำ **Floating Labels** หรือ Label ที่อยู่ด้านใน Input แล้วเลื่อนขึ้นเมื่อพิมพ์ (เหมือน Material UI)

### 4.3 Buttons (ปุ่มกด)
- **Primary Button:** สีพื้นทึบ (Solid) มีการไล่ระดับสีอ่อนๆ (Subtle Gradient) หรือเป็นสี Flat ที่ดูมีน้ำหนัก
  - **Height:** `56px` (เต็มปุ่มนิ้วมือ)
  - **Shadow:** เวลาปกติมีเงาอ่อนๆ เวลา Hover เงาจะเข้มขึ้น และเวลา Active (กด) ปุ่มจะหดลงเล็กน้อย (Scale down `0.98`)
  - *Tailwind CSS:* `w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all`

### 4.4 Status / Icons (ไอคอนสถานะ)
- ใช้ไอคอนแบบ Outline หรือ Soft Two-tone (สีหลัก + สีรองที่โปร่งแสง 10%)
- ไอคอนขนาดกำลังดีอยู่ในกล่องสีอ่อน (เช่น กล่องสีเขียวอ่อน ไอคอนสีเขียวเข้ม)

---

## 5. Animations & Transitions (การเคลื่อนไหว)
- **Page Transitions:** ใช้ `framer-motion` ทำ Fade-in และ Slide-up ตอนโหลดหน้าจอ (Duration `0.3s - 0.5s`)
- **Loading State:** ระหว่างรอการจ่ายเงินหรือทำรายการ ให้แสดงปุ่มเปลี่ยนเป็นวงกลมโหลด (Spinner) พร้อมกับทำตัวหนังสือให้จางลง (Disabled State) 
- **Skeletons:** การโหลดข้อมูลให้ใช้ Skeleton loading (กล่องเทากะพริบ) แทนที่จะปล่อยหน้าว่างหรือหมุนโหลดตรงกลางอย่างเดียว

---

## 6. CSS Reference (Tailwind Config / Snippets)

ตัวอย่างการแต่งเงาแบบ Beam Checkout:
```css
/* การ์ดหลักที่ดูลอยขึ้นมาเนียนๆ */
.beam-card {
  background-color: #ffffff;
  border-radius: 24px;
  box-shadow: 0px 10px 40px -10px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0,0,0,0.03);
}

/* ปุ่ม Checkout ที่ดึงดูดสายตา */
.beam-button {
  background-color: #1a1a1a; /* หรือสี Brand */
  color: white;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.beam-button:hover {
  transform: translateY(-1px);
  box-shadow: 0px 4px 12px rgba(0,0,0,0.15);
}
.beam-button:active {
  transform: scale(0.98);
}
```

---

## 🎯 สรุปสิ่งที่ต้องนำไปปรับใช้กับ Hubbybox
1. **ลดเส้นขอบ (Borders):** ลดการใช้เส้นแบ่งหรือเส้นขอบแข็งๆ ให้ใช้ความแตกต่างของสีพื้นหลังและเงาในการแบ่งสัดส่วนเนื้อหา
2. **ขยายพื้นที่ (Padding):** ให้ UI หายใจได้ เพิ่ม `padding` ให้กว้างขึ้นตามมุมกล่อง
3. **จัดกลุ่มชัดเจน (Grouping):** อะไรที่เกี่ยวข้องกันเอามาอยู่ใน Card เดียวกัน (เช่น ข้อมูลกล่อง, สรุปรายการ) ไม่กระจายทั่วหน้าจอ
