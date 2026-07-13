import type { NotionBlock, NotionPage, NotionDatabase } from './types';

/**
 * Extract plain text from Notion rich text objects
 */
export function extractPlainText(richText: any[]): string {
  if (!Array.isArray(richText)) {
    return '';
  }
  
  return richText
    .map(item => item.plain_text || item.text?.content || '')
    .join('');
}

/**
 * Extract title from a Notion page or database
 */
export function extractTitle(item: NotionPage | NotionDatabase): string {
  if ('title' in item && Array.isArray(item.title)) {
    // Database title
    return extractPlainText(item.title);
  }
  
  if ('properties' in item && item.properties) {
    // Page title - look for title property
    const titleProp = Object.values(item.properties).find((prop: any) => 
      prop.type === 'title' && prop.title
    );
    
    if (titleProp) {
      return extractPlainText((titleProp as any).title);
    }
  }
  
  return 'Untitled';
}

/**
 * Convert Notion blocks to markdown text
 */
export function blocksToMarkdown(blocks: NotionBlock[]): string {
  const lines: string[] = [];
  
  for (const block of blocks) {
    const text = blockToMarkdown(block);
    if (text) {
      lines.push(text);
    }
  }
  
  return lines.join('\n\n');
}

/**
 * Convert a single Notion block to markdown
 */
export function blockToMarkdown(block: NotionBlock): string {
  const type = block.type;
  const content = block[type];
  
  if (!content) {
    return '';
  }
  
  // Extract text from rich text arrays
  const getText = (richText: any[]) => {
    if (!Array.isArray(richText)) return '';
    
    return richText.map(item => {
      let text = item.plain_text || '';
      const annotations = item.annotations;
      
      if (annotations?.bold) text = `**${text}**`;
      if (annotations?.italic) text = `*${text}*`;
      if (annotations?.strikethrough) text = `~~${text}~~`;
      if (annotations?.code) text = `\`${text}\``;
      if (item.href) text = `[${text}](${item.href})`;
      
      return text;
    }).join('');
  };
  
  switch (type) {
    case 'paragraph':
      return getText(content.rich_text);
      
    case 'heading_1':
      return `# ${getText(content.rich_text)}`;
      
    case 'heading_2':
      return `## ${getText(content.rich_text)}`;
      
    case 'heading_3':
      return `### ${getText(content.rich_text)}`;
      
    case 'bulleted_list_item':
      return `- ${getText(content.rich_text)}`;
      
    case 'numbered_list_item':
      return `1. ${getText(content.rich_text)}`;
      
    case 'to_do':
      const checked = content.checked ? '[x]' : '[ ]';
      return `${checked} ${getText(content.rich_text)}`;
      
    case 'toggle':
      return `<details><summary>${getText(content.rich_text)}</summary></details>`;
      
    case 'quote':
      return `> ${getText(content.rich_text)}`;
      
    case 'code':
      const language = content.language || '';
      const code = getText(content.rich_text);
      return `\`\`\`${language}\n${code}\n\`\`\``;
      
    case 'callout':
      const icon = content.icon?.emoji || '💡';
      return `${icon} ${getText(content.rich_text)}`;
      
    case 'divider':
      return '---';
      
    case 'image':
      const imageUrl = content.external?.url || content.file?.url || '';
      const caption = content.caption ? getText(content.caption) : '';
      return caption ? `![${caption}](${imageUrl})` : `![](${imageUrl})`;
      
    case 'video':
      const videoUrl = content.external?.url || content.file?.url || '';
      return `[Video](${videoUrl})`;
      
    case 'file':
      const fileUrl = content.external?.url || content.file?.url || '';
      const fileName = content.name || 'File';
      return `[${fileName}](${fileUrl})`;
      
    case 'pdf':
      const pdfUrl = content.external?.url || content.file?.url || '';
      return `[PDF](${pdfUrl})`;
      
    case 'bookmark':
      const bookmarkUrl = content.url || '';
      const bookmarkCaption = content.caption ? getText(content.caption) : bookmarkUrl;
      return `[${bookmarkCaption}](${bookmarkUrl})`;
      
    case 'link_preview':
      return `[${content.url}](${content.url})`;
      
    case 'table':
      // Tables are complex, return a simple representation
      return '[Table]';
      
    case 'table_row':
      if (content.cells && Array.isArray(content.cells)) {
        const cells = content.cells.map((cell: any[]) => getText(cell)).join(' | ');
        return `| ${cells} |`;
      }
      return '';
      
    case 'embed':
      return `[Embed: ${content.url}](${content.url})`;
      
    case 'equation':
      return `$$${content.expression}$$`;
      
    case 'breadcrumb':
      return '🍞 Breadcrumb';
      
    case 'table_of_contents':
      return '[Table of Contents]';
      
    case 'column_list':
    case 'column':
      return ''; // Handle columns in a special way if needed
      
    case 'link_to_page':
      const pageId = content.page_id || content.database_id || '';
      return `[Link to page](https://notion.so/${pageId.replace(/-/g, '')})`;
      
    case 'synced_block':
      return '[Synced Block]';
      
    case 'template':
      return `Template: ${getText(content.rich_text)}`;
      
    case 'audio':
      const audioUrl = content.external?.url || content.file?.url || '';
      return `[Audio](${audioUrl})`;
      
    default:
      // For unknown block types, try to extract any rich text
      if (content.rich_text) {
        return getText(content.rich_text);
      }
      return `[${type}]`;
  }
}

/**
 * Extract property value from a Notion page
 */
export function extractPropertyValue(property: any): string {
  if (!property) return '';
  
  switch (property.type) {
    case 'title':
      return extractPlainText(property.title);
      
    case 'rich_text':
      return extractPlainText(property.rich_text);
      
    case 'number':
      return property.number?.toString() || '';
      
    case 'select':
      return property.select?.name || '';
      
    case 'multi_select':
      return property.multi_select?.map((item: any) => item.name).join(', ') || '';
      
    case 'date':
      if (property.date?.start) {
        const start = property.date.start;
        const end = property.date.end;
        return end ? `${start} → ${end}` : start;
      }
      return '';
      
    case 'people':
      return property.people?.map((person: any) => person.name || 'Unknown').join(', ') || '';
      
    case 'files':
      return property.files?.map((file: any) => file.name || 'File').join(', ') || '';
      
    case 'checkbox':
      return property.checkbox ? 'Yes' : 'No';
      
    case 'url':
      return property.url || '';
      
    case 'email':
      return property.email || '';
      
    case 'phone_number':
      return property.phone_number || '';
      
    case 'formula':
      return extractPropertyValue(property.formula);
      
    case 'relation':
      return property.relation?.map((rel: any) => rel.id).join(', ') || '';
      
    case 'rollup':
      return extractPropertyValue(property.rollup);
      
    case 'created_time':
      return property.created_time || '';
      
    case 'created_by':
      return property.created_by?.name || 'Unknown';
      
    case 'last_edited_time':
      return property.last_edited_time || '';
      
    case 'last_edited_by':
      return property.last_edited_by?.name || 'Unknown';
      
    default:
      return JSON.stringify(property);
  }
}

/**
 * Convert a Notion page to a readable text format
 */
export function pageToText(page: NotionPage, blocks?: NotionBlock[]): string {
  const lines: string[] = [];
  
  // Add title
  const title = extractTitle(page);
  if (title) {
    lines.push(`# ${title}`);
    lines.push('');
  }
  
  // Add properties
  if (page.properties) {
    const properties = Object.entries(page.properties)
      .filter(([key, value]) => key !== 'Name' && key !== 'Title') // Skip title properties
      .map(([key, value]) => {
        const propValue = extractPropertyValue(value);
        return propValue ? `**${key}**: ${propValue}` : null;
      })
      .filter((value): value is string => Boolean(value));
    
    if (properties.length > 0) {
      lines.push('## Properties');
      lines.push('');
      lines.push(...properties);
      lines.push('');
    }
  }
  
  // Add blocks content
  if (blocks && blocks.length > 0) {
    lines.push('## Content');
    lines.push('');
    lines.push(blocksToMarkdown(blocks));
  }
  
  return lines.join('\n');
}

/**
 * Generate a Notion page URL from page ID
 */
export function generatePageUrl(pageId: string, workspaceDomain?: string): string {
  const cleanId = pageId.replace(/-/g, '');
  const baseUrl = workspaceDomain ? `https://${workspaceDomain}.notion.site` : 'https://notion.so';
  return `${baseUrl}/${cleanId}`;
}

/**
 * Extract page ID from Notion URL
 */
export function extractPageIdFromUrl(url: string): string | null {
  // Match various Notion URL formats
  const patterns = [
    /notion\.so\/([a-f0-9]{32})/,
    /notion\.site\/([a-f0-9]{32})/,
    /notion\.so\/.*-([a-f0-9]{32})/,
    /notion\.site\/.*-([a-f0-9]{32})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const id = match[1];
      // Add hyphens to format as UUID
      return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
    }
  }
  
  return null;
}

/**
 * Validate Notion page/database ID format
 */
export function isValidNotionId(id: string): boolean {
  // UUID format with hyphens
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  // 32-character hex string without hyphens
  const hexPattern = /^[0-9a-f]{32}$/i;
  
  return uuidPattern.test(id) || hexPattern.test(id);
}

/**
 * Normalize Notion ID to UUID format
 */
export function normalizeNotionId(id: string): string {
  if (!id) return '';
  
  // Remove hyphens and convert to lowercase
  const cleanId = id.replace(/-/g, '').toLowerCase();
  
  if (cleanId.length !== 32) {
    return id; // Return original if not valid length
  }
  
  // Add hyphens to format as UUID
  return `${cleanId.slice(0, 8)}-${cleanId.slice(8, 12)}-${cleanId.slice(12, 16)}-${cleanId.slice(16, 20)}-${cleanId.slice(20)}`;
}

/**
 * Create basic page properties for different database schemas
 */
export function createBasicPageProperties(title: string, databaseProperties: Record<string, any>): Record<string, any> {
  const properties: Record<string, any> = {};
  
  // Find title property
  const titlePropName = Object.keys(databaseProperties).find(
    key => databaseProperties[key].type === 'title'
  );
  
  if (titlePropName) {
    properties[titlePropName] = {
      title: [
        {
          text: {
            content: title
          }
        }
      ]
    };
  }
  
  return properties;
}
