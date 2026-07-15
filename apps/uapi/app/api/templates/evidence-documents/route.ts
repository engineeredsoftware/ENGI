import { NextResponse } from 'next/server';

import { createClient } from '@bitcode/supabase/ssr/server';
import { TemplatesService } from '@bitcode/templates-generics';

export const runtime = 'nodejs';

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).map((item) => item.trim())
    : [];
}

function serializeEvidenceDocumentTemplate(template: any) {
  return template;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ templates: [] });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get('type') || undefined;
  const templatesService = new TemplatesService(supabase as any);

  try {
    const templates = await templatesService.getEvidenceDocumentTemplates(user.id, type);
    return NextResponse.json({
      templates: templates.map(serializeEvidenceDocumentTemplate),
    });
  } catch (templatesError) {
    const message =
      templatesError instanceof Error
        ? templatesError.message
        : 'Failed to load Evidence Document templates';

    return NextResponse.json({ error: message, templates: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Authentication required', templates: [] }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON', templates: [] }, { status: 400 });
  }

  const payload = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const name = readString(payload.name);
  const templateText = readString(payload.templateText);
  const types = readStringArray(payload.evidenceDocumentTypes);

  if (!name || !templateText || !types.length) {
    return NextResponse.json(
      {
        error: 'Evidence Document template name, text, and at least one type are required',
        templates: [],
      },
      { status: 400 },
    );
  }

  const templatesService = new TemplatesService(supabase as any);

  try {
    const templates = await templatesService.createEvidenceDocumentTemplates(
      user.id,
      name,
      types,
      templateText,
    );

    return NextResponse.json(
      { templates: (templates || []).map(serializeEvidenceDocumentTemplate) },
      { status: 201 },
    );
  } catch (templatesError) {
    const message =
      templatesError instanceof Error
        ? templatesError.message
        : 'Failed to save Evidence Document template';

    return NextResponse.json({ error: message, templates: [] }, { status: 500 });
  }
}
