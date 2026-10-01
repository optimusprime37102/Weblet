import React from 'react';
import type { ExternalLinkMode, LiteAppSettings } from '@/types';
import { OptionRows, SectionLabel, SettingCard } from '../ui';

type Props = {
  settings: LiteAppSettings;
  onChange: (patch: Partial<LiteAppSettings>) => void;
};

export function ExternalLinksSection({ settings, onChange }: Props) {
  return (
    <>
      <SectionLabel>External Links</SectionLabel>
      <SettingCard>
        <OptionRows
          options={[
            {
              value: 'inside',
              label: 'Open Inside Lite App',
              caption: 'Keep every link in this WebView',
              icon: 'tablet-portrait-outline',
            },
            {
              value: 'browser',
              label: 'Open in Browser',
              caption: 'External domains use the system browser',
              icon: 'open-outline',
            },
          ]}
          value={settings.externalLinks}
          onChange={(externalLinks: ExternalLinkMode) =>
            onChange({ externalLinks })
          }
        />
      </SettingCard>
    </>
  );
}
