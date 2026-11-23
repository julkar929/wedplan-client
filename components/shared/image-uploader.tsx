'use client';
import { SafeImg } from '@/components/shared/safe-img';
import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { uploadImage } from '@/lib/api';

/** Multi-image uploader: files go to the API which hosts them on ImgBB; we only keep the returned URLs. */
export function ImageUploader({ value, onChange, max = 6 }: { value: string[]; onChange: (urls: string[]) => void; max?: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = max - value.length;
    if (room <= 0) return toast.error(`You can upload up to ${max} images.`);
    setBusy(true);
    const urls: string[] = [];
    for (const f of Array.from(files).slice(0, room)) {
      try { urls.push(await uploadImage(f)); } catch (e: any) { toast.error(`${f.name}: ${e.message}`); }
    }
    if (urls.length) onChange([...value, ...urls]);
    setBusy(false);
    if (ref.current) ref.current.value = '';
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {value.map((url, i) => (
          <div key={url + i} className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
            <SafeImg src={url} alt={`Upload ${i + 1}`} className="size-full object-cover" />
            {i === 0 && <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">Cover</span>}
            <button type="button" aria-label="Remove image" onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"><X className="size-3.5" /></button>
          </div>
        ))}
        {value.length < max && (
          <button type="button" disabled={busy} onClick={() => ref.current?.click()}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-sm text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-60">
            {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
            {busy ? 'Uploading…' : 'Add images'}
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      <p className="text-xs text-muted-foreground">PNG, JPEG or WEBP, up to 5 MB each. The first image is the cover.</p>
      {value.length === 0 && <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()}>Choose files</Button>}
    </div>
  );
}
