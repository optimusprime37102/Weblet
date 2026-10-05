import React from 'react';
import {
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useApp } from '@/context/AppContext';
import { getLiteAppSettings } from '@/services/liteAppSettings';
import type { LiteApp, LiteAppSettings } from '@/types';
import { spacing } from '@/theme';
import {
  AppHero,
  AutoRefreshSection,
  DataSaverSection,
  DisplaySection,
  ExternalLinksSection,
  PrivacySection,
  ThemeSection,
  WebsiteModeSection,
} from './sections';

type Props = {
  app: LiteApp;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onClearWebsiteData?: () => void;
};

export function LiteAppSettingsPanel({
  app,
  contentContainerStyle,
  onClearWebsiteData,
}: Props) {
  const { updateLiteApp } = useApp();
  const settings = getLiteAppSettings(app);

  const patchSettings = async (patch: Partial<LiteAppSettings>) => {
    await updateLiteApp(app.id, {
      settings: { ...settings, ...patch },
    });
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <AppHero app={app} />
      <WebsiteModeSection settings={settings} onChange={patchSettings} />
      <DisplaySection settings={settings} onChange={patchSettings} />
      <ThemeSection settings={settings} onChange={patchSettings} />
      <ExternalLinksSection settings={settings} onChange={patchSettings} />
      <PrivacySection
        app={app}
        settings={settings}
        onChange={patchSettings}
        onClearWebsiteData={onClearWebsiteData}
      />
      <DataSaverSection settings={settings} onChange={patchSettings} />
      <AutoRefreshSection settings={settings} onChange={patchSettings} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
});
