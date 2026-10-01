import React from 'react';
import type { LiteAppSettings, LiteAppTheme } from '@/types';
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

export function ThemeSection({ settings, onChange }: Props) {
  return (
    <>
      <SectionLabel>Theme</SectionLabel>
      <SettingCard>
        <SegmentedControl
          options={[
            { value: 'follow', label: 'Follow', icon: 'globe-outline' },
            { value: 'light', label: 'Light', icon: 'sunny-outline' },
            { value: 'dark', label: 'Dark', icon: 'moon-outline' },
          ]}
          value={settings.theme}
          onChange={(theme: LiteAppTheme) => onChange({ theme })}
        />
        <HintText>Applies only to this Lite App’s WebView.</HintText>
      </SettingCard>
    </>
  );
}
