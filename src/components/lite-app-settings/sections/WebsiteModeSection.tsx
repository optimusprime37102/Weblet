import React from 'react';
import type { LiteAppSettings, WebsiteMode } from '@/types';
import {
  HintText,
  SectionLabel,
  SegmentedControl,
  SettingCard,
} from '../ui';

type Props = {
  settings: LiteAppSettings;
  onChange: (patch: Partial<LiteAppSettings>) => void;
};

export function WebsiteModeSection({ settings, onChange }: Props) {
  return (
    <>
      <SectionLabel>Website Mode</SectionLabel>
      <SettingCard>
        <SegmentedControl
          options={[
            { value: 'mobile', label: 'Mobile', icon: 'phone-portrait-outline' },
            { value: 'desktop', label: 'Desktop', icon: 'desktop-outline' },
          ]}
          value={settings.websiteMode}
          onChange={(websiteMode: WebsiteMode) => onChange({ websiteMode })}
        />
        <HintText>
          Changes the browser identity and reloads the site when opened.
        </HintText>
      </SettingCard>
    </>
  );
}
