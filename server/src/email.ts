import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Resend } from 'resend'
import fontkit from '@pdf-lib/fontkit'
import {
  PDFDocument,
  rgb,
  type PDFFont,
  type PDFPage,
  type RGB,
} from 'pdf-lib'
import { env } from './env.js'
import { prisma } from './prisma.js'

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null
export const emailEnabled = Boolean(resend && env.EMAIL_FROM)

// ---- Website palette (src/index.css custom properties) ----
const CREAM: RGB = rgb(0.984, 0.969, 0.941) // --bg  #fbf7f0
const INK: RGB = rgb(0.18, 0.165, 0.145) // --ink  #2e2a25
const BODY: RGB = rgb(0.42, 0.38, 0.341) // --body #6b6157
const CLAY: RGB = rgb(0.373, 0.231, 0.145) // --clay #5f3b25
const AMBER: RGB = rgb(0.851, 0.604, 0.247) // --amber #d99a3f
const LINE: RGB = rgb(0.88, 0.862, 0.833) // --line over cream
const CLAY_SOFT: RGB = rgb(0.71, 0.52, 0.4) // clay lightened for ornament

// ---- Embedded fonts (shipped as static TTFs in server/fonts) ----
const fontDir = fileURLToPath(new URL('../fonts/', import.meta.url))

// Drop OpenType layout tables (GPOS/GSUB/kerning) before embedding.
// pdf-lib forwards them wholesale into the subset fonts, and macOS's PDF
// renderer applies the kerning while drawing, which produces phantom
// spaces between glyph pairs (e.g. "Earth yglow", "Men gelers").
const LAYOUT_TABLES = new Set(['GPOS', 'GSUB', 'GDEF', 'kern', 'morx', 'kerx'])
const fontChecksum = (data: Uint8Array) => {
  let sum = 0
  const padded = Buffer.alloc((data.byteLength + 3) & ~3)
  Buffer.from(data.buffer, data.byteOffset, data.byteLength).copy(padded)
  for (let i = 0; i < padded.length; i += 4) {
    sum = (sum + padded.readUInt32BE(i)) >>> 0
  }
  return sum
}

function stripLayoutTables(font: ArrayBuffer): ArrayBuffer {
  const b = Buffer.from(font)
  const sfntVersion = b.subarray(0, 4).toString('latin1')
  const numTables = b.readUInt16BE(4)
  const records: { tag: string; offset: number; length: number }[] = []
  for (let i = 0; i < numTables; i++) {
    const o = 12 + i * 16
    records.push({
      tag: b.toString('latin1', o, o + 4),
      offset: b.readUInt32BE(o + 8),
      length: b.readUInt32BE(o + 12),
    })
  }
  const kept = records.filter((r) => !LAYOUT_TABLES.has(r.tag))
  const numKept = kept.length
  const maxPow2 = 2 ** Math.floor(Math.log2(numKept))
  const searchRange = maxPow2 * 16
  const entrySelector = Math.log2(maxPow2)
  const rangeShift = numKept * 16 - searchRange

  const headerSize = 12 + numKept * 16
  const sizes = kept.map((r) => (r.length + 3) & ~3)
  const out = Buffer.alloc(headerSize + sizes.reduce((a, c) => a + c, 0))

  out.write(sfntVersion, 0, 'latin1')
  out.writeUInt16BE(numKept, 4)
  out.writeUInt16BE(searchRange, 6)
  out.writeUInt16BE(entrySelector, 8)
  out.writeUInt16BE(rangeShift, 10)

  let cursor = headerSize
  const dataOffsets = new Map<string, number>()
  for (let i = 0; i < numKept; i++) {
    const rec = kept[i]!
    const dirOff = 12 + i * 16
    out.write(rec.tag, dirOff, 'latin1')
    out.writeUInt32BE(fontChecksum(b.subarray(rec.offset, rec.offset + rec.length)), dirOff + 4)
    out.writeUInt32BE(cursor, dirOff + 8)
    out.writeUInt32BE(rec.length, dirOff + 12)
    dataOffsets.set(rec.tag, cursor)
    b.copy(out, cursor, rec.offset, rec.offset + rec.length)
    cursor += sizes[i]!
  }

  const headDataOffset = dataOffsets.get('head')
  if (headDataOffset !== undefined) {
    out.writeUInt32BE(0, headDataOffset + 8)
    let sum = 0
    for (let i = 0; i < out.length; i += 4) {
      sum = (sum + out.readUInt32BE(i)) >>> 0
    }
    out.writeUInt32BE((0xb1b0afba - sum) >>> 0, headDataOffset + 8)
  }

  return out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer
}

const readFont = (name: string) => {
  const raw = readFileSync(`${fontDir}${name}`) as unknown as ArrayBuffer
  return stripLayoutTables(raw)
}

type InvoiceFonts = {
  display: PDFFont // Fraunces Medium
  displaySemibold: PDFFont // Fraunces SemiBold
  displayItalic: PDFFont // Fraunces SemiBold Italic
  body: PDFFont // Inter Regular
  bodySemibold: PDFFont // Inter SemiBold
}

function formatEuro(cents: number): string {
  return `€ ${(cents / 100).toLocaleString('nl-NL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

type InvoiceLine = {
  name: string
  quantity: number
  unitPriceCents: number
  lineTotalCents: number
}

type InvoiceData = {
  orderNumber: string
  paidAt: Date
  customerName: string
  customerEmail: string
  customerAddress: string
  customerPostalCode: string
  customerCity: string
  customerCountry: string
  subtotalCents: number
  shippingCents: number
  totalCents: number
  lines: InvoiceLine[]
}

// Uppercase eyebrow label with wide letter-spacing (pdf-lib has no tracking).
function drawTracked(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  size: number,
  font: PDFFont,
  color: RGB,
  tracking: number,
): number {
  let cursor = x
  for (const ch of text) {
    if (ch !== ' ') {
      page.drawText(ch, { x: cursor, y, size, font, color })
      cursor += font.widthOfTextAtSize(ch, size)
    } else {
      cursor += font.widthOfTextAtSize(' ', size)
    }
    cursor += tracking
  }
  return cursor
}

function trackedWidth(
  text: string,
  font: PDFFont,
  size: number,
  tracking: number,
): number {
  let w = 0
  for (const ch of text) {
    w += font.widthOfTextAtSize(ch, size) + tracking
  }
  return w
}

export async function generateInvoicePdf(
  data: InvoiceData,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  const pageWidth = 595.28
  const pageHeight = 841.89
  let page = doc.addPage([pageWidth, pageHeight])
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: CREAM,
  })

  const fonts: InvoiceFonts = {
    display: await doc.embedFont(readFont('fraunces-500-normal.ttf')),
    displaySemibold: await doc.embedFont(readFont('fraunces-600-normal.ttf')),
    displayItalic: await doc.embedFont(readFont('fraunces-600-italic.ttf')),
    body: await doc.embedFont(readFont('inter-400-normal.ttf')),
    bodySemibold: await doc.embedFont(readFont('inter-600-normal.ttf')),
  }

  // A centred frame with equal margins — nothing can drift off either side.
  const margin = 60
  const contentLeft = margin
  const contentRight = pageWidth - margin
  const center = pageWidth / 2

  const draw = (
    text: string,
    x: number,
    y: number,
    size: number,
    color: RGB,
    font: PDFFont,
  ) => {
    page.drawText(text, { x, y, size, font, color })
  }

  const drawRight = (
    text: string,
    rightEdge: number,
    y: number,
    size: number,
    color: RGB,
    font: PDFFont,
  ) => {
    const x = rightEdge - font.widthOfTextAtSize(text, size)
    page.drawText(text, { x, y, size, font, color })
  }

  const eyebrow = (
    text: string,
    x: number,
    y: number,
    color: RGB,
    tracking = 2.5,
    size = 7.5,
  ) => drawTracked(page, text, x, y, size, fonts.bodySemibold, color, tracking)

  const eyebrowCentered = (
    text: string,
    y: number,
    color: RGB,
    tracking = 2.5,
    size = 7.5,
  ) => {
    const w = trackedWidth(text, fonts.bodySemibold, size, tracking)
    eyebrow(text, center - w / 2, y, color, tracking, size)
  }

  const eyebrowRight = (
    text: string,
    rightEdge: number,
    y: number,
    color: RGB,
    tracking = 2.5,
    size = 7.5,
  ) => {
    const w = trackedWidth(text, fonts.bodySemibold, size, tracking)
    eyebrow(text, rightEdge - w, y, color, tracking, size)
  }

  const rule = (y: number, thickness = 0.7, color: RGB = LINE) => {
    page.drawLine({
      start: { x: contentLeft, y },
      end: { x: contentRight, y },
      thickness,
      color,
    })
  }

  // ---- Header: wordmark + eyebrow + amber tick + rule ----
  const wordmarkText = 'EarthyGlow'
  const wordmarkSize = 26
  const wordmarkW = fonts.display.widthOfTextAtSize(wordmarkText, wordmarkSize)
  draw(wordmarkText, center - wordmarkW / 2, 790, wordmarkSize, INK, fonts.display)

  eyebrowCentered('HAND-POURED CANDLES · INVOICE', 760, CLAY)
  page.drawRectangle({
    x: center - 10,
    y: 770.5,
    width: 20,
    height: 1.4,
    color: AMBER,
  })
  rule(741)

  // ---- Billed to / invoice meta ----
  const yBill = 712
  eyebrow('BILLED TO', contentLeft, yBill, CLAY)
  draw(data.customerName, contentLeft, yBill - 18, 13, INK, fonts.display)
  draw(data.customerAddress, contentLeft, yBill - 38, 9.5, BODY, fonts.body)
  draw(
    `${data.customerPostalCode} ${data.customerCity}`,
    contentLeft,
    yBill - 51,
    9.5,
    BODY,
    fonts.body,
  )
  draw(data.customerCountry, contentLeft, yBill - 64, 9.5, BODY, fonts.body)
  draw(data.customerEmail, contentLeft, yBill - 77, 9.5, BODY, fonts.body)

  const metaRight = contentRight
  eyebrowRight('INVOICE', metaRight, yBill, CLAY, 2.5, 7.5)
  const invSize = 20
  drawRight(data.orderNumber, metaRight, yBill - 24, invSize, INK, fonts.display)
  drawRight(
    `Paid on ${formatDate(data.paidAt)}`,
    metaRight,
    yBill - 44,
    9.5,
    BODY,
    fonts.body,
  )
  drawRight(
    `Order ${data.orderNumber}`,
    metaRight,
    yBill - 57,
    9.5,
    BODY,
    fonts.body,
  )

  rule(616)

  // ---- Items table ----
  const amountRight = contentRight
  const unitRight = contentRight - 178
  const qtyRight = contentRight - 278

  const tableHeader = (yy: number) => {
    eyebrow('DESCRIPTION', contentLeft, yy, CLAY, 1.8)
    eyebrowRight('QTY', qtyRight, yy, CLAY, 1.8)
    eyebrowRight('UNIT PRICE', unitRight, yy, CLAY, 1.8)
    eyebrowRight('AMOUNT', amountRight, yy, CLAY, 1.8)
  }

  let y = 596
  for (const line of data.lines) {
    if (y - 26 < 150) {
      page = doc.addPage([pageWidth, pageHeight])
      page.drawRectangle({
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
        color: CREAM,
      })
      tableHeader(776)
      rule(770)
      y = 758
    }
    draw(line.name, contentLeft, y, 10, INK, fonts.body)
    drawRight(String(line.quantity), qtyRight, y, 10, INK, fonts.body)
    drawRight(formatEuro(line.unitPriceCents), unitRight, y, 10, INK, fonts.body)
    drawRight(
      formatEuro(line.lineTotalCents),
      amountRight,
      y,
      10,
      INK,
      fonts.bodySemibold,
    )
    rule(y - 12, 0.5)
    y -= 24
  }

  // ---- Totals ----
  const labelRight = amountRight - 150
  y -= 14
  drawRight('Subtotal', labelRight, y, 10, BODY, fonts.body)
  drawRight(formatEuro(data.subtotalCents), amountRight, y, 10, INK, fonts.body)
  y -= 20
  drawRight('Shipping', labelRight, y, 10, BODY, fonts.body)
  drawRight(formatEuro(data.shippingCents), amountRight, y, 10, INK, fonts.body)
  y -= 30
  rule(y + 18, 0.8)
  drawRight('Total', labelRight, y, 14, INK, fonts.displaySemibold)
  drawRight(formatEuro(data.totalCents), amountRight, y, 14, CLAY, fonts.displaySemibold)

  // ---- Footer: ornament + thank-you, centred ----
  const ornamentY = 84
  const ornamentR = 3.4
  page.drawCircle({
    x: center,
    y: ornamentY,
    size: ornamentR,
    color: CREAM, // fills with bg so the border reads as an outline
    borderColor: CLAY_SOFT,
    borderWidth: 0.9,
  })
  page.drawLine({
    start: { x: center - 60, y: ornamentY },
    end: { x: center - ornamentR - 10, y: ornamentY },
    thickness: 0.6,
    color: CLAY_SOFT,
  })
  page.drawLine({
    start: { x: center + ornamentR + 10, y: ornamentY },
    end: { x: center + 60, y: ornamentY },
    thickness: 0.6,
    color: CLAY_SOFT,
  })

  const thanks = 'Thank you for your order.'
  const thanksSize = 11
  const thanksW = fonts.displayItalic.widthOfTextAtSize(thanks, thanksSize)
  draw(
    thanks,
    center - thanksW / 2,
    62,
    thanksSize,
    CLAY,
    fonts.displayItalic,
  )

  const foot = 'Questions about this invoice? Reply to this email.'
  const footSize = 9
  const footW = fonts.body.widthOfTextAtSize(foot, footSize)
  draw(foot, center - footW / 2, 42, footSize, BODY, fonts.body)

  return doc.save()
}

export async function sendOrderInvoice(
  orderNumber: string,
): Promise<boolean> {
  if (!emailEnabled) {
    return false
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      customer: true,
      items: { orderBy: { id: 'asc' } },
    },
  })

  if (!order) {
    return false
  }

  const paidAt = order.paidAt ?? order.updatedAt

  const pdf = await generateInvoicePdf({
    orderNumber: order.orderNumber,
    paidAt,
    customerName: `${order.customer.firstName} ${order.customer.lastName}`
      .replace(/\s+/g, ' ')
      .trim(),
    customerEmail: order.customer.email,
    customerAddress: order.address,
    customerPostalCode: order.postalCode,
    customerCity: order.city,
    customerCountry: order.country,
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    totalCents: order.totalCents,
    lines: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      lineTotalCents: item.lineTotalCents,
    })),
  })

  const html = `
    <!doctype html>
    <html>
      <body style="font-family: Arial, Helvetica, sans-serif; color: #222; padding: 24px;">
        <h2 style="margin-bottom: 4px;">Thank you — your glow is on its way</h2>
        <p style="color: #555;">Hi ${escapeHtml(order.customer.firstName)},</p>
        <p style="color: #555;">Your order <strong>${order.orderNumber}</strong> has been
        paid and your invoice is attached as a PDF. We'll hand-pour and ship your
        candles shortly.</p>
        <table style="border-collapse: collapse; margin-top: 16px;">
          <tr><td style="padding: 4px 24px 4px 0; color:#555;">Order</td>
              <td style="padding: 4px 0;"><strong>${order.orderNumber}</strong></td></tr>
          <tr><td style="padding: 4px 24px 4px 0; color:#555;">Invoice date</td>
              <td style="padding: 4px 0;">${formatDate(paidAt)}</td></tr>
          <tr><td style="padding: 4px 24px 4px 0; color:#555;">Total paid</td>
              <td style="padding: 4px 0;">${formatEuro(order.totalCents)}</td></tr>
        </table>
        <p style="color: #555; margin-top: 16px;">Your invoice PDF is attached to this email.</p>
      </body>
    </html>
  `

  const { error } = await resend!.emails.send({
    from: env.EMAIL_FROM,
    to: [order.customer.email],
    subject: `Your EarthyGlow invoice ${order.orderNumber}`,
    html,
    attachments: [
      {
        filename: `${order.orderNumber}.pdf`,
        content: Buffer.from(pdf).toString('base64'),
      },
    ],
  })

  if (error) {
    throw new Error(
      `Resend rejected invoice for ${orderNumber}: ${error.message}`,
    )
  }

  return true
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function sendContactMessage(input: {
  name: string
  email: string
  message: string
}): Promise<void> {
  if (!emailEnabled) {
    throw new Error('Email is not configured')
  }

  const text = `Name: ${input.name}\nEmail: ${input.email}\n\nMessage:\n${input.message}`
  const html = `
    <p style="color:#6b6157;">New message from the contact form:</p>
    <table style="border-collapse: collapse; color:#2e2a25; font-size:14px;">
      <tr><td style="padding:4px 16px 4px 0; color:#6b6157;">Name</td>
          <td style="padding:4px 0;">${escapeHtml(input.name)}</td></tr>
      <tr><td style="padding:4px 16px 4px 0; color:#6b6157;">Email</td>
          <td style="padding:4px 0;">${escapeHtml(input.email)}</td></tr>
    </table>
    <blockquote style="margin:16px 0; padding:12px 16px; border-left:3px solid #5f3b25;
      background:#f4ecdd; color:#2e2a25; white-space:pre-wrap;">
      ${escapeHtml(input.message)}
    </blockquote>
  `

  const { error } = await resend!.emails.send({
    from: env.EMAIL_FROM,
    to: [env.CONTACT_EMAIL],
    replyTo: input.email,
    subject: `New contact message from ${input.name}`,
    text,
    html,
  })

  if (error) {
    throw new Error(`Resend rejected contact message: ${error.message}`)
  }
}

export type InvoiceRetryStats = {
  attempts: number
  sent: number
  failed: number
}

// Re-sends invoices for paid orders that have no invoiceSentAt yet. Called on
// startup and periodically: the webhook acknowledges Mollie even when the
// email fails, so this sweep is what guarantees no invoice is lost.
export async function retryUnsentInvoices(): Promise<InvoiceRetryStats> {
  if (!emailEnabled) {
    return { attempts: 0, sent: 0, failed: 0 }
  }

  const orders = await prisma.order.findMany({
    where: { status: 'paid', invoiceSentAt: null },
    select: { orderNumber: true },
  })

  const stats: InvoiceRetryStats = { attempts: 0, sent: 0, failed: 0 }
  for (const order of orders) {
    stats.attempts += 1
    try {
      const sent = await sendOrderInvoice(order.orderNumber)
      if (sent) {
        await prisma.order.update({
          where: { orderNumber: order.orderNumber },
          data: { invoiceSentAt: new Date() },
        })
        stats.sent += 1
      }
    } catch {
      stats.failed += 1
    }
  }
  return stats
}