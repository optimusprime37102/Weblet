import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useApp } from '@/context/AppContext';
import type { LiteAppSettings } from '@/types';
import { HintText, SectionLabel, SettingCard, ToggleRow } from '../ui';

type Props = {
  settings: LiteAppSettings;
  onChange: (patch: Partial<LiteAppSettings>) => void;
};

export function DataSaverSection({ settings, onChange }: Props) {
  const { colors } = useApp();

  const setDataSaver = (dataSaverEnabled: boolean) => {
    if (dataSaverEnabled) {
      onChange({
        dataSaverEnabled: true,
        blockImages: true,
        disableVideoAutoplay: true,
        reduceHeavyContent: true,
      });
      return;
    }
    onChange({ dataSaverEnabled: false });
  };

  return (
    <>
      <SectionLabel>Data Saver</SectionLabel>
      <SettingCard>
        <ToggleRow
          icon="speedometer-outline"
          label="Data Saver"
          caption="Reduce bandwidth used by this Lite App"
          value={settings.dataSaverEnabled}
          onValueChange={setDataSaver}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ToggleRow
          icon="image-outline"
          label="Block Images"
          caption="Hide images to load pages faster"
          value={settings.dataSaverEnabled || settings.blockImages}
          onValueChange={(blockImages) =>
            onChange({
              blockImages,
              ...(blockImages ? {} : { dataSaverEnabled: false }),
            })
          }
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ToggleRow
          icon="play-skip-forward-outline"
          label="Disable Video Autoplay"
          caption="Videos won’t start until you tap play"
          value={settings.dataSaverEnabled || settings.disableVideoAutoplay}
          onValueChange={(disableVideoAutoplay) =>
            onChange({
              disableVideoAutoplay,
              ...(disableVideoAutoplay ? {} : { dataSaverEnabled: false }),
            })
          }
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ToggleRow
          icon="flame-outline"
          label="Reduce Heavy Content"
          caption="Hide videos, embeds, and heavy animations"
          value={settings.dataSaverEnabled || settings.reduceHeavyContent}
          onValueChange={(reduceHeavyContent) =>
            onChange({
              reduceHeavyContent,
              ...(reduceHeavyContent ? {} : { dataSaverEnabled: false }),
            })
          }
        />
        <HintText>
          Turning Data Saver on enables all options below. Turn an option off to
          exit full Data Saver mode.
        </HintText>
      </SettingCard>
    </>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 6,
  },
});
