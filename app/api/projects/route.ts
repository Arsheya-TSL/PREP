import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const BASE = process.env.SERVER_API_BASE || 'https://moonshot-tsl-77a856fd3c22.herokuapp.com'
const API_TOKEN = process.env.SERVER_API_TOKEN || ''
const USER = process.env.SERVER_API_USER || 'arsheya'
const PASS = process.env.SERVER_API_PASS || 'se794422'

async function readText(res: Response): Promise<string> {
  try { return await res.text() } catch { return '' }
}

function extractSetCookies(res: Response): Record<string, string> {
  // Attempt to read multiple Set-Cookie headers; fallback to single header
  const cookies: Record<string, string> = {}
  // @ts-ignore
  const rawList: string[] = (typeof res.headers.getSetCookie === 'function') ? res.headers.getSetCookie() : []
  const header = res.headers.get('set-cookie')
  const all = [...rawList, ...(header ? [header] : [])]
  all.forEach((line) => {
    line.split(/,(?=[^;]+=)/g).forEach((c) => {
      const part = c.trim()
      const [kv] = part.split(';')
      const [k, v] = kv.split('=')
      if (k && v) cookies[k.trim()] = v.trim()
    })
  })
  return cookies
}

function joinCookies(jar: Record<string, string>): string {
  return Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ')
}

function extractCsrfFromHtml(html: string): string | null {
  const m = html.match(/name=['"]csrfmiddlewaretoken['"][^>]*value=['"]([^'"]+)['"]/i)
  return m ? m[1] : null
}

function htmlDecode(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
}

function stripTags(s: string): string {
  return htmlDecode(s.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim()
}

function parseDjangoAdminTable(html: string) {
  // Find the result_list table
  const tableMatch = html.match(/<table[^>]*id=["']result_list["'][^>]*>([\s\S]*?)<\/table>/i)
  if (!tableMatch) return []
  const tableHtml = tableMatch[1]
  // Extract rows
  const rows: any[] = []
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let tr: RegExpExecArray | null
  while ((tr = trRegex.exec(tableHtml))) {
    const trHtml = tr[1]
    // Skip header rows containing <th>
    if (/<th[\s\S]*<\/th>/i.test(trHtml)) continue
    // Extract cells
    const tds: string[] = []
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi
    let td: RegExpExecArray | null
    while ((td = tdRegex.exec(trHtml))) {
      tds.push(stripTags(td[1]))
    }
    if (!tds.length) continue
    // Try to extract id from first link
    const hrefMatch = trHtml.match(/href=["'][^"']*\/project\/(\d+)\//i)
    const id = hrefMatch ? hrefMatch[1] : undefined
    rows.push({ id, cols: tds })
  }
  // Map generic columns into fields
  return rows.map((r, idx) => ({
    id: r.id ?? String(idx),
    // Heuristic: first column often is a link/name
    name: r.cols[0] || `Project ${idx+1}`,
    client: r.cols.find((c: string) => /client/i.test(c)) || r.cols[1] || '',
    country: r.cols.find((c: string) => /uk|germany|france|netherlands|spain|usa|us|united/i.test(c)) || '',
    status: r.cols.find((c: string) => /on track|ahead|risk|hold|active|completed|planning/i.test(c)) || '',
    start_date: '',
    end_date: '',
    progress: undefined,
    location: '',
  }))
}

export async function GET(req: NextRequest) {
  try {
    const urlObj = req.nextUrl
    const qs = urlObj.search || ''

    // Preferred path: First-party JSON API: /api/projects/
    {
      const headers: Record<string, string> = { 'Accept': 'application/json' }
      if (API_TOKEN) headers['Authorization'] = `Bearer ${API_TOKEN}`
      const res = await fetch(`${BASE}/api/projects/${qs}`, { headers })
      const ct = res.headers.get('content-type') || ''
      const txt = await readText(res)
      if (res.ok) {
        try {
          const data = ct.includes('application/json') ? JSON.parse(txt) : JSON.parse(txt)
          return NextResponse.json({ ok: true, data })
        } catch {
          return NextResponse.json({ ok: true, raw: txt, contentType: ct })
        }
      }
      // If this failed, continue to legacy admin attempts below
    }
    // 1) Get login page to retrieve csrftoken
    const loginUrl = `${BASE}/admin/login/`
    const loginRes = await fetch(loginUrl, { method: 'GET', redirect: 'manual' })
    const loginHtml = await readText(loginRes)
    const jar1 = extractSetCookies(loginRes)
    const csrfInForm = extractCsrfFromHtml(loginHtml)
    const csrftoken = jar1['csrftoken'] || csrfInForm || ''

    // 2) Login (Django admin) to obtain session
    const form = new URLSearchParams()
    form.set('username', USER)
    form.set('password', PASS)
    if (csrfInForm) form.set('csrfmiddlewaretoken', csrfInForm)
    form.set('next', '/admin/api/project/?all=')

    const postRes = await fetch(`${BASE}/admin/login/?next=/admin/api/project/?all=`, {
      method: 'POST',
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': joinCookies({ ...(csrftoken ? { csrftoken } : {}), ...jar1 }),
        ...(csrftoken ? { 'X-CSRFToken': csrftoken } : {}),
        'Referer': loginUrl,
      },
      body: form.toString(),
    })
    const jar2 = { ...jar1, ...extractSetCookies(postRes) }

    // 2.5) Confirm session by loading admin index (captures sessionid)
    const adminIndex = await fetch(`${BASE}/admin/`, {
      method: 'GET',
      headers: {
        'Cookie': joinCookies(jar2),
      },
      redirect: 'manual',
    })
    const jar3 = { ...jar2, ...extractSetCookies(adminIndex) }

    // 3) Fetch the projects JSON
    const tryFetch = async (suffix: string) => fetch(`${BASE}/admin/api/project/${suffix}`, {
      method: 'GET',
      headers: {
        'Cookie': joinCookies(jar3),
        'Accept': 'application/json, text/plain, text/html;q=0.9',
        'Referer': `${BASE}/admin/`,
        'Origin': BASE,
        'X-Requested-With': 'XMLHttpRequest',
      },
    })

    // Try original, then with format=json, then without ordering
    const candidates = [qs, (qs.includes('format=') ? qs : (qs + (qs.includes('?') ? '&' : '?') + 'format=json')), '?all=&format=json']
    for (const suf of candidates) {
      const apiRes = await tryFetch(suf)
      const contentType = apiRes.headers.get('content-type') || ''
      if (!apiRes.ok) continue
      if (contentType.includes('application/json')) {
        const data = await apiRes.json()
        return NextResponse.json({ ok: true, data })
      }
      const txt = await readText(apiRes)
      try {
        const parsed = JSON.parse(txt)
        return NextResponse.json({ ok: true, data: parsed, contentType })
      } catch {}
      // Try scrape admin HTML
      const scraped = parseDjangoAdminTable(txt)
      if (scraped.length) return NextResponse.json({ ok: true, data: scraped, scraped: true })
      // Continue trying next candidate
    }
    // Last-resort fallback to local mock projects to avoid taking down UI
    try {
      const { projects } = await import('../../../lib/constants')
      return NextResponse.json({ ok: true, data: projects, fallback: true })
    } catch {}
    return NextResponse.json({ ok: false, error: 'No JSON from upstream' }, { status: 502 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}

