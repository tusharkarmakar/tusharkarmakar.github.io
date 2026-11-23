import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

/** Published projects in display order (lower `order` first, then title). */
export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects', p => !p.data.draft);
  return all.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

export const CATEGORY_LABELS: Record<string, string> = {
  campaign: 'Campaign', motion: 'Motion', branding: 'Branding', social: 'Social', ai: 'AI',
};

export function tagFor(p: Project): string {
  return p.data.tag || p.data.categories.map(c => CATEGORY_LABELS[c]).join(' · ');
}

/** Classify a media link so the page can render it the right way. */
export function linkKind(url = ''): { kind: 'youtube' | 'vimeo' | 'video' | 'lottie' | 'external'; id?: string } {
  const u = url.trim();
  let m = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return { kind: 'youtube', id: m[1] };
  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return { kind: 'vimeo', id: m[1] };
  if (/\.(mp4|webm|mov)(\?|$)/i.test(u)) return { kind: 'video' };
  if (/\.(json|lottie)(\?|$)/i.test(u) || /lottie\.host|lottiefiles\.com/.test(u)) return { kind: 'lottie' };
  return { kind: 'external' };
}

export function ratioCss(r: string): string | undefined {
  return r && r !== 'auto' ? r.replace(':', ' / ') : undefined;
}
