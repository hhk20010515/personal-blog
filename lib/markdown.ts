function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function sanitizeUrl(rawUrl: string) {
  const trimmed = rawUrl.trim()

  if (!trimmed) return ''

  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    /^https?:\/\//i.test(trimmed) ||
    /^mailto:/i.test(trimmed)
  ) {
    return escapeHtml(trimmed)
  }

  return ''
}

function renderInline(rawText: string) {
  let text = escapeHtml(rawText)

  text = text.replace(/`([^`]+)`/g, '<code class="px-2 py-1 bg-muted rounded text-sm font-mono">$1</code>')
  text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_match, alt, url) => {
    const safeUrl = sanitizeUrl(url)
    if (!safeUrl) return alt

    return `<img src="${safeUrl}" alt="${alt}" class="max-w-full h-auto rounded-lg shadow-md my-6" loading="lazy" />`
  })
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label, url) => {
    const safeUrl = sanitizeUrl(url)
    if (!safeUrl) return label

    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-medium">${label}</a>`
  })
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
  text = text.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')

  return text
}

function closeList(html: string[], inList: boolean) {
  if (inList) {
    html.push('</ul>')
  }
  return false
}

export function markdownToSafeHtml(markdown: string) {
  const blocks = markdown.replace(/\r\n/g, '\n').split(/(```[\s\S]*?```)/g)

  return blocks
    .map((block) => {
      if (block.startsWith('```') && block.endsWith('```')) {
        const code = block.replace(/^```[^\n]*\n?/, '').replace(/```$/, '')
        return `<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-6"><code>${escapeHtml(code)}</code></pre>`
      }

      const html: string[] = []
      const lines = block.split('\n')
      let paragraph: string[] = []
      let inList = false

      const flushParagraph = () => {
        if (paragraph.length > 0) {
          html.push(`<p class="mb-4">${renderInline(paragraph.join(' '))}</p>`)
          paragraph = []
        }
      }

      for (const line of lines) {
        const trimmed = line.trim()

        if (!trimmed) {
          flushParagraph()
          inList = closeList(html, inList)
          continue
        }

        const heading = trimmed.match(/^(#{1,3})\s+(.+)$/)
        if (heading) {
          flushParagraph()
          inList = closeList(html, inList)
          const level = heading[1].length
          const classes =
            level === 1
              ? 'text-4xl font-bold mb-8 mt-12'
              : level === 2
                ? 'text-3xl font-bold mb-6 mt-10'
                : 'text-2xl font-bold mb-4 mt-8'

          html.push(`<h${level} class="${classes}">${renderInline(heading[2])}</h${level}>`)
          continue
        }

        const quote = trimmed.match(/^>\s+(.+)$/)
        if (quote) {
          flushParagraph()
          inList = closeList(html, inList)
          html.push(
            `<blockquote class="border-l-4 border-primary pl-6 py-2 bg-muted/30 rounded-r-lg my-6 italic">${renderInline(quote[1])}</blockquote>`
          )
          continue
        }

        const listItem = trimmed.match(/^[-*]\s+(.+)$/) || trimmed.match(/^\d+\.\s+(.+)$/)
        if (listItem) {
          flushParagraph()
          if (!inList) {
            html.push('<ul class="list-disc list-inside space-y-2 my-4">')
            inList = true
          }
          html.push(`<li class="ml-4">${renderInline(listItem[1])}</li>`)
          continue
        }

        inList = closeList(html, inList)
        paragraph.push(trimmed)
      }

      flushParagraph()
      closeList(html, inList)

      return html.join('')
    })
    .join('')
}
