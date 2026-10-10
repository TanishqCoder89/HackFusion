import React, { useState } from 'react';
import { Sparkles, PlusCircle, Trash2, Loader2, CheckCircle2, X, Code2, Wand2 } from 'lucide-react';
import { generateProblem, createProblem, deleteProblem, previewTestCases } from '../services/storageService';

const inputCls =
  'w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-sm';

const emptyDraft = () => ({
  title: '',
  difficulty: 'Medium',
  topic: '',
  language: 'cpp',
  timeLimitMinutes: 30,
  description: '',
  constraintsText: '',
  examples: [{ input: '', output: '', explanation: '' }],
  testCases: [{ input: '', expectedOutput: '', isPublic: true }],
  starterCodes: {},
  referenceSolution: '',
  source: 'manual'
});

const toEditable = (d) => ({
  ...emptyDraft(),
  ...d,
  constraintsText: (d.constraints || []).join('\n'),
  examples: d.examples?.length ? d.examples : [{ input: '', output: '', explanation: '' }]
});

function DraftEditor({ draft, setDraft, onSave, onCancel, saving, error }) {
  const [inputsText, setInputsText] = useState('');
  const [computing, setComputing] = useState(false);
  const [helperMsg, setHelperMsg] = useState('');

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const setTest = (i, patch) => set({ testCases: draft.testCases.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) });
  const setExample = (i, patch) => set({ examples: draft.examples.map((e, idx) => (idx === i ? { ...e, ...patch } : e)) });

  const computeFromReference = async () => {
    setHelperMsg('');
    const inputs = inputsText.split(/\n\s*---\s*\n/).map((s) => s.trim()).filter(Boolean);
    if (!draft.referenceSolution.trim() || inputs.length === 0) {
      setHelperMsg('Provide a Python reference solution and at least one input (separate inputs with a line containing ---).');
      return;
    }
    setComputing(true);
    try {
      const cases = await previewTestCases({
        referenceSolution: draft.referenceSolution,
        testInputs: inputs.map((input, i) => ({ input, isPublic: i < 2 }))
      });
      set({ testCases: cases });
      setHelperMsg(`Computed ${cases.length} expected output(s) by running your reference solution.`);
    } catch (err) {
      setHelperMsg(err.message);
    } finally {
      setComputing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#141414] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Code2 className="w-4 h-4 text-sky-500" />
          {draft.source === 'ai' ? 'Review AI-generated problem' : 'New coding problem'}
        </h3>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800" title="Discard">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2">
          <label className="block font-semibold mb-1">Title</label>
          <input className={inputCls} value={draft.title} onChange={(e) => set({ title: e.target.value })} />
        </div>
        <div>
          <label className="block font-semibold mb-1">Difficulty</label>
          <select className={inputCls} value={draft.difficulty} onChange={(e) => set({ difficulty: e.target.value })}>
            <option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Time limit (min)</label>
          <input type="number" min="5" className={inputCls} value={draft.timeLimitMinutes} onChange={(e) => set({ timeLimitMinutes: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-1">Problem statement (include input / output format — solutions read stdin and print to stdout)</label>
        <textarea rows={7} className={inputCls} value={draft.description} onChange={(e) => set({ description: e.target.value })} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold mb-1">Constraints (one per line)</label>
          <textarea rows={3} className={inputCls} value={draft.constraintsText} onChange={(e) => set({ constraintsText: e.target.value })} />
        </div>
        <div>
          <label className="block font-semibold mb-1">Examples</label>
          <div className="space-y-2">
            {draft.examples.map((ex, i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <textarea rows={2} placeholder="Input" className={inputCls + ' font-mono'} value={ex.input} onChange={(e) => setExample(i, { input: e.target.value })} />
                <textarea rows={2} placeholder="Output" className={inputCls + ' font-mono'} value={ex.output} onChange={(e) => setExample(i, { output: e.target.value })} />
              </div>
            ))}
            <button type="button" onClick={() => set({ examples: [...draft.examples, { input: '', output: '', explanation: '' }] })} className="text-sky-600 dark:text-sky-400 font-semibold">
              + Add example
            </button>
          </div>
        </div>
      </div>

      {/* Test cases */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-semibold">Test cases ({draft.testCases.length}) — input is fed to stdin, expected output is compared to stdout</label>
          <button type="button" onClick={() => set({ testCases: [...draft.testCases, { input: '', expectedOutput: '', isPublic: false }] })} className="text-sky-600 dark:text-sky-400 font-semibold">
            + Add test case
          </button>
        </div>
        {draft.testCases.map((tc, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
            <textarea rows={2} placeholder="stdin input" className={inputCls + ' font-mono'} value={tc.input} onChange={(e) => setTest(i, { input: e.target.value })} />
            <textarea rows={2} placeholder="expected stdout" className={inputCls + ' font-mono'} value={tc.expectedOutput} onChange={(e) => setTest(i, { expectedOutput: e.target.value })} />
            <div className="flex flex-col items-center gap-1 pt-1">
              <label className="flex items-center gap-1 whitespace-nowrap">
                <input type="checkbox" checked={tc.isPublic !== false} onChange={(e) => setTest(i, { isPublic: e.target.checked })} /> Public
              </label>
              <button type="button" onClick={() => set({ testCases: draft.testCases.filter((_, idx) => idx !== i) })} className="text-neutral-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reference-solution helper */}
      <details className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
        <summary className="cursor-pointer font-semibold flex items-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5 text-sky-500" /> Compute expected outputs from a Python reference solution
        </summary>
        <div className="mt-3 space-y-2">
          <textarea rows={6} placeholder="Python 3 reference solution (reads stdin, prints answer)" className={inputCls + ' font-mono'} value={draft.referenceSolution} onChange={(e) => set({ referenceSolution: e.target.value })} />
          <textarea rows={5} placeholder={'Test inputs, separated by a line containing ---\n3 2\n1 1 1\n---\n3 3\n1 2 3'} className={inputCls + ' font-mono'} value={inputsText} onChange={(e) => setInputsText(e.target.value)} />
          <button type="button" onClick={computeFromReference} disabled={computing} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 font-semibold disabled:opacity-50">
            {computing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Compute expected outputs
          </button>
          {helperMsg && <p className="text-neutral-600 dark:text-neutral-400">{helperMsg}</p>}
        </div>
      </details>

      {error && <p className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300">{error}</p>}

      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
        <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700">Discard</button>
        <button onClick={onSave} disabled={saving} className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold disabled:opacity-50">
          {saving ? 'Saving…' : 'Save to question bank'}
        </button>
      </div>
    </div>
  );
}

export default function ProblemManager({ problems, currentUserId, onChanged }) {
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [gen, setGen] = useState({ topic: '', difficulty: 'Medium', hints: '', testCaseCount: 7 });

  const list = Object.values(problems);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!gen.topic.trim()) { setError('Enter a topic, e.g. "sliding window" or "binary search trees".'); return; }
    setGenerating(true);
    try {
      const generated = await generateProblem(gen);
      setDraft(toEditable(generated));
      setNotice(`Generated "${generated.title}" with ${generated.testCases.length} test cases whose expected outputs were verified by running the AI's reference solution. Review, edit and save.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const { constraintsText, ...rest } = draft;
      await createProblem({
        ...rest,
        constraints: constraintsText.split('\n').map((c) => c.trim()).filter(Boolean),
        examples: draft.examples.filter((ex) => ex.input.trim() || ex.output.trim())
      });
      setDraft(null);
      setNotice('Problem saved to the question bank.');
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    setError('');
    try {
      await deleteProblem(p.id);
      await onChanged();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Coding Question Bank</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Add your own questions or let AI draft one with verified test cases. Candidates' code is compiled and run against these tests.
          </p>
        </div>
        {!draft && (
          <button
            onClick={() => { setDraft(emptyDraft()); setNotice(''); setError(''); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow self-start"
          >
            <PlusCircle className="w-4 h-4" /> Add manually
          </button>
        )}
      </div>

      {!draft && (
        <form onSubmit={handleGenerate} className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 space-y-3 text-xs">
          <h3 className="font-bold text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-sky-500" /> Generate with AI</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Topic</label>
              <input className={inputCls} placeholder="e.g. two pointers, graph BFS, dynamic programming" value={gen.topic} onChange={(e) => setGen({ ...gen, topic: e.target.value })} />
            </div>
            <div>
              <label className="block font-semibold mb-1">Difficulty</label>
              <select className={inputCls} value={gen.difficulty} onChange={(e) => setGen({ ...gen, difficulty: e.target.value })}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Test cases</label>
              <input type="number" min="4" max="12" className={inputCls} value={gen.testCaseCount} onChange={(e) => setGen({ ...gen, testCaseCount: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Extra guidance (optional)</label>
            <input className={inputCls} placeholder="e.g. relate it to payments, avoid recursion, focus on edge cases" value={gen.hints} onChange={(e) => setGen({ ...gen, hints: e.target.value })} />
          </div>
          <button type="submit" disabled={generating} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold disabled:opacity-50">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? 'Generating & verifying…' : 'Generate question'}
          </button>
        </form>
      )}

      {notice && (
        <p className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {notice}
        </p>
      )}
      {error && !draft && <p className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs">{error}</p>}

      {draft && (
        <DraftEditor draft={draft} setDraft={setDraft} onSave={handleSave} onCancel={() => setDraft(null)} saving={saving} error={error} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((p) => (
          <div key={p.id} className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">{p.difficulty}</span>
              <span className="text-neutral-400 font-mono">
                {p.source === 'ai' ? 'AI-generated' : p.source === 'seed' ? 'Built-in' : 'Manual'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{p.title}</h3>
            <p className="text-neutral-600 dark:text-neutral-400 line-clamp-2 whitespace-pre-line">{p.description}</p>
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
              <span className="text-neutral-500">{p.testCaseCount} test cases • {p.timeLimitMinutes} min</span>
              {p.createdBy === currentUserId && (
                <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
