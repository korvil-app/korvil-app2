import { useRef, useState } from 'react';
import { AlertTriangle, Download, FileSpreadsheet } from 'lucide-react';
import type { Question } from '@/types';
import { CSV_TEMPLATE, questionsFromCsv, type ImportResult } from '@/lib/packIO';
import { downloadFile } from '@/lib/utils';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (questions: Question[]) => void;
}

export function CsvImportModal({ open, onClose, onAdd }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState('');

  const close = () => {
    setResult(null);
    setFileName('');
    onClose();
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    setResult(questionsFromCsv(await file.text()));
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Import questions from CSV"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={close}>Cancel</Button>
          <Button
            disabled={!result?.questions.length}
            onClick={() => {
              if (result) onAdd(result.questions);
              close();
            }}
          >
            Add {result?.questions.length ?? 0} questions
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <p className="text-stage-200">
          Use a spreadsheet to write lots of questions quickly. Columns: type (mc, tf, number, image), category, question, option_a–d, correct (A–D or true/false), number_answer, fact and time_limit.
        </p>
        <Button variant="secondary" onClick={() => downloadFile('huddle-trivia-template.csv', CSV_TEMPLATE, 'text/csv')}>
          <Download className="h-4 w-4" /> Download CSV template
        </Button>
        <button onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 py-10 text-stage-300 transition hover:border-primary hover:text-white">
          <FileSpreadsheet className="h-8 w-8" />
          <span className="font-medium">{fileName || 'Choose a CSV file'}</span>
        </button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />

        {result && (
          <div className="space-y-3">
            <div className="rounded-xl bg-success-500/15 px-4 py-3 text-sm text-success-300">{result.questions.length} questions ready to add.</div>
            {result.errors.length > 0 && (
              <div className="rounded-xl bg-warning-500/10 px-4 py-3 text-sm text-warning-300">
                <div className="mb-1 flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4" /> {result.errors.length} rows were skipped
                </div>
                <ul className="max-h-32 list-inside list-disc overflow-y-auto">
                  {result.errors.slice(0, 20).map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
