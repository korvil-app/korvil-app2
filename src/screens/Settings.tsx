import { useRef, useState } from 'react';
import { ImagePlus, RotateCcw, Trash2, Volume2, VolumeX, Wind } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PageShell } from '@/components/PageShell';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { BrandMark } from '@/components/BrandMark';
import { readFileAsDataUrl } from '@/lib/utils';
import { sfx } from '@/lib/sound';

const PRESETS = ['#7C3AED', '#2563EB', '#0D9488', '#DC2626', '#EA580C', '#DB2777', '#16A34A', '#F59E0B'];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition ${checked ? 'bg-primary' : 'bg-white/15'}`}
    >
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? 'left-7' : 'left-1'}`} />
    </button>
  );
}

export function SettingsScreen() {
  const { settings, updateSettings, navigate, resetAll, notify } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const onLogo = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return notify('Please choose an image file.', 'error');
    try {
      updateSettings({ logo: await readFileAsDataUrl(file, 400) });
      notify('Logo updated', 'success');
    } catch (e) {
      notify((e as Error).message, 'error');
    }
  };

  return (
    <PageShell title="Settings" subtitle="Make the show yours. Branding applies to every screen, including the projector and booth." back={() => navigate({ name: 'home' })}>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="panel p-6">
            <h2 className="font-display text-xl font-bold">Branding</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="company">Company name</label>
                <input
                  id="company"
                  className="field"
                  maxLength={40}
                  value={settings.companyName}
                  onChange={(e) => updateSettings({ companyName: e.target.value })}
                  placeholder="Huddle Trivia"
                />
              </div>
              <div>
                <span className="label">Logo</span>
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl border border-white/15 bg-stage-950/60">
                    {settings.logo ? <img src={settings.logo} alt="Logo preview" className="h-full w-full object-contain" /> : <ImagePlus className="h-5 w-5 text-stage-400" />}
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                    Upload
                  </Button>
                  {settings.logo && (
                    <Button variant="ghost" size="sm" onClick={() => updateSettings({ logo: undefined })}>
                      Remove
                    </Button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <span className="label">Primary colour</span>
              <div className="flex flex-wrap items-center gap-3">
                {PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateSettings({ primaryColor: c })}
                    className={`h-10 w-10 rounded-full transition hover:scale-110 ${settings.primaryColor.toLowerCase() === c.toLowerCase() ? 'ring-4 ring-white ring-offset-2 ring-offset-stage-800' : ''}`}
                    style={{ background: c }}
                    aria-label={`Use colour ${c}`}
                  />
                ))}
                <label className="flex h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-sm text-stage-200">
                  <input type="color" value={settings.primaryColor} onChange={(e) => updateSettings({ primaryColor: e.target.value })} className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent" />
                  Custom
                </label>
              </div>
            </div>
          </section>

          <section className="panel divide-y divide-white/10">
            <div className="flex items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-4">
                {settings.sound ? <Volume2 className="h-6 w-6 text-primary-light" /> : <VolumeX className="h-6 w-6 text-stage-400" />}
                <div>
                  <div className="font-medium">Sound effects</div>
                  <div className="text-sm text-stage-300">Countdown ticks, answer stings and the finale fanfare.</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => sfx.correct()} disabled={!settings.sound}>Test</Button>
                <Toggle label="Sound effects" checked={settings.sound} onChange={(v) => updateSettings({ sound: v })} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-4">
                <Wind className="h-6 w-6 text-primary-light" />
                <div>
                  <div className="font-medium">Reduced motion</div>
                  <div className="text-sm text-stage-300">Calmer transitions and no confetti. Also follows your device setting.</div>
                </div>
              </div>
              <Toggle label="Reduced motion" checked={settings.reducedMotion} onChange={(v) => updateSettings({ reducedMotion: v })} />
            </div>
          </section>

          <section className="panel flex flex-wrap items-center justify-between gap-4 border-danger-500/30 p-6">
            <div>
              <div className="font-medium">Reset all data</div>
              <div className="text-sm text-stage-300">Removes custom packs, game history, booth leaderboard and settings, then restores the demo packs.</div>
            </div>
            <Button variant="danger" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </section>
        </div>

        <aside className="panel h-fit overflow-hidden lg:sticky lg:top-6">
          <div className="border-b border-white/10 px-6 py-4 text-sm font-medium text-stage-300">Live preview</div>
          <div className="stage-bg p-6">
            <BrandMark />
            <div className="mt-6 inline-block rounded-full bg-primary/25 px-3 py-1 text-xs font-medium text-primary-light">Question 3 of 12</div>
            <div className="mt-3 font-display text-2xl font-bold">Which planet is known as the Red Planet?</div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {['#E11D48', '#2563EB', '#C2410C', '#047857'].map((c, i) => (
                <div key={c} className="rounded-lg px-3 py-2 text-sm font-medium" style={{ background: c }}>{['Venus', 'Jupiter', 'Mars', 'Mercury'][i]}</div>
              ))}
            </div>
            <Button className="mt-6 w-full">Start show</Button>
          </div>
        </aside>
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset everything?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                resetAll();
                setConfirmReset(false);
                notify('All data reset', 'success');
              }}
            >
              <Trash2 className="h-4 w-4" /> Yes, reset all data
            </Button>
          </>
        }
      >
        <p className="text-stage-200">This permanently removes everything saved in this browser for Huddle Trivia. It cannot be undone.</p>
      </Modal>
    </PageShell>
  );
}
