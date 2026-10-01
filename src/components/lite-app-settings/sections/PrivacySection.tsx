import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useApp } from '@/context/AppContext';
import type { LiteApp, LiteAppSettings } from '@/types';
import {
  ClearDataRow,
  SectionLabel,
  SettingCard,
  ToggleRow,
} from '../ui';

type Props = {
  app: LiteApp;
  settings: LiteAppSettings;
  onChange: (patch: Partial<LiteAppSettings>) => void;
  onClearWebsiteData?: () => void;
};

export function PrivacySection({
  app,
  settings,
  onChange,
  onClearWebsiteData,
}: Props) {
  const { colors } = useApp();

  const confirmClearData = () => {
    Alert.alert(
      'Clear website data?',
      `This removes cookies and cached data for ${app.name}. You may be signed out.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => onClearWebsiteData?.(),
        },
      ]
    );
  };

  return (
    <>
      <SectionLabel>Privacy</SectionLabel>
      <SettingCard>
        <ToggleRow
          icon="key-outline"
          label="Allow Cookies"
          caption="Save login sessions and site preferences"
          value={settings.cookiesEnabled}
          onValueChange={(cookiesEnabled) => onChange({ cookiesEnabled })}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ToggleRow
          icon="shield-outline"
          label="Block Third-Party Cookies"
          caption="Stop trackers from other domains"
          value={settings.blockThirdPartyCookies}
          onValueChange={(blockThirdPartyCookies) =>
            onChange({ blockThirdPartyCookies })
          }
        />   
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ToggleRow
          icon="exit-outline"
          label="Clear Data When App Closes"
          caption="Wipe cookies and cache when you leave this Lite App"
          value={settings.clearDataOnClose}
          onValueChange={(clearDataOnClose) => onChange({ clearDataOnClose })}
        />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        {onClearWebsiteData ? (
          <>
            <ClearDataRow onPress={confirmClearData} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </>
        ) : null}
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
