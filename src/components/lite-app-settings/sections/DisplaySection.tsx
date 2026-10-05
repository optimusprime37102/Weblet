import React from 'react';
import type { LiteAppSettings } from '@/types';
import { SectionLabel, SettingCard, ToggleRow } from '../ui';

type Props = {
  settings: LiteAppSettings;
  onChange: (patch: Partial<LiteAppSettings>) => void;
};

export function DisplaySection({ settings, onChange }: Props) {
  return (
    <>
      <SectionLabel>Display</SectionLabel>
      <SettingCard>
        <ToggleRow
          icon="expand-outline"
          label="Full-Screen Mode"
          caption="Hide address and navigation bars for maximum screen space"
          value={settings.fullScreenMode}
          onValueChange={(fullScreenMode) => onChange({ fullScreenMode })}
        />
      </SettingCard>
    </>
  );
}
