import React from 'react';
import {
  Maximize,
  CopyX,
  Eye,
  Camera,
  Smartphone,
  Monitor,
  Mic,
  Volume2,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

const RULES = [
  {
    id: 1,
    title: 'Full Screen Lock',
    description: 'The assessment requests fullscreen mode. Leaving fullscreen triggers a warning and may pause the session according to the configured interview policy.',
    icon: Maximize
  },
  {
    id: 2,
    title: 'Copy-Paste Restrictions',
    description: 'For configured coding assessments, application-level copy/paste actions, context menus, and developer-tool shortcuts are monitored and disabled where feasible.',
    icon: CopyX
  },
  {
    id: 3,
    title: 'Tab & Focus Tracking',
    description: 'Browser visibility changes and loss of window focus are detected. Configured events record a warning notification according to assessment policy.',
    icon: Eye
  },
  {
    id: 4,
    title: 'Webcam & Gaze Monitoring',
    description: 'With explicit consent, facial alignment and presence are monitored. Notice: landmark estimation is an observation tool, not an absolute automated conclusion.',
    icon: Camera
  },
  {
    id: 5,
    title: 'Secondary Camera Feed',
    description: 'If a secondary mobile camera is requested by the specific interview, setup guidance and purpose will be disclosed prior to consent. Not required for standard sessions.',
    icon: Smartphone
  },
  {
    id: 6,
    title: 'Secondary Monitors',
    description: 'Assessments recommend a single active primary display. The platform flags display resolution shifts and focus deviations during the session.',
    icon: Monitor
  },
  {
    id: 7,
    title: 'Hardware Source Checks',
    description: 'Active camera and microphone connections are validated. If hardware is disconnected or permissions revoked, the session pauses until restored.',
    icon: Mic
  },
  {
    id: 8,
    title: 'Audio Noise Analysis',
    description: 'Microphone amplitude levels detect loud background anomalies or secondary room audio. Background noise events are noted for human recruiter review.',
    icon: Volume2
  },
  {
    id: 9,
    title: 'Violation Limits',
    description: 'For this interview policy, general warnings have a maximum threshold of five strikes. Exceeding strikes pauses session and prompts proctor review.',
    icon: AlertTriangle
  },
  {
    id: 10,
    title: 'Session Integrity',
    description: 'All assessment events are saved to a transparent session audit log for recruiter review. Your data is retained strictly according to privacy governance standards.',
    icon: ShieldCheck
  }
];

export default function ProctoringRules() {
  return (
    <div className="bg-white dark:bg-[#171717] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-7 shadow-sm">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Proctoring Rules & Integrity Guidelines
          </h2>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Please review the session guidelines before starting. All parameters are evaluated under objective, human-reviewed supervision.
        </p>
      </div>

      <div className="space-y-4 max-h-[560px] overflow-y-auto pr-2">
        {RULES.map((rule) => {
          const Icon = rule.icon;
          return (
            <div
              key={rule.id}
              className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 hover:border-sky-300 dark:hover:border-sky-500/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white dark:bg-neutral-800 text-sky-500 dark:text-sky-400 shadow-sm shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-0.5 flex items-center gap-2">
                    <span>{rule.id}. {rule.title}</span>
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
