import React, { forwardRef } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, typography } from '@/theme';
import { useApp } from '@/context/AppContext';

type SearchBarProps = TextInputProps & {
  onSubmitQuery?: (value: string) => void;
  onClear?: () => void;
};

export const SearchBar = forwardRef<TextInput, SearchBarProps>(
  function SearchBar(
    { onSubmitQuery, onClear, value, onChangeText, ...rest },
    ref
  ) {
    const { colors } = useApp();
    const hasValue = Boolean(value && String(value).length > 0);

    return (
      <View
        style={[
          styles.wrap,
          {
            backgroundColor: colors.surfaceSolid,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <Ionicons name="globe-outline" size={18} color={colors.primary} />
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder="Search or type URL"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          keyboardType="url"
          onSubmitEditing={() => {
            if (typeof value === 'string') onSubmitQuery?.(value);
          }}
          style={[styles.input, { color: colors.text }]}
          {...rest}
        />
        {hasValue ? (
          <Pressable
            onPress={() => {
              onChangeText?.('');
              onClear?.();
            }}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : (
          <Ionicons name="search" size={18} color={colors.textMuted} />
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.lg,
    height: 50,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  input: {
    flex: 1,
    ...typography.body,
    paddingVertical: 0,
  },
});
