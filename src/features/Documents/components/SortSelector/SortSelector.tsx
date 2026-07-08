import React from 'react';
import { Modal, Pressable, TouchableOpacity, View } from 'react-native';

import { Text } from 'components/Text/Text';

import type { DocumentSort } from '../../types';
import { useSortSelector } from './hooks/useSortSelector';
import { useSortSelectorTheme } from './theme/useSortSelectorTheme';

interface SortSelectorProps {
  value: DocumentSort;
  onChange: (sort: DocumentSort) => void;
}

/** A "Sort by" trigger that opens a bottom-sheet modal of sort options. */
export const SortSelector = ({ value, onChange }: SortSelectorProps) => {
  const {
    isOpen,
    options,
    currentLabel,
    title,
    checkMark,
    caret,
    open,
    close,
    handleSelect,
  } = useSortSelector(value, onChange);
  const { styles } = useSortSelectorTheme();

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={open}
        accessibilityRole="button">
        <Text size="font-size-sm" weight="font-weight-medium">
          {currentLabel}
        </Text>
        <Text size="font-size-sm" color="font-secondary">
          {caret}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={close}>
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.backdrop}
            accessibilityRole="button"
            accessibilityLabel="Close sort options"
            onPress={close}
          />
          <View style={styles.sheet}>
            <Text size="font-size-md" weight="font-weight-semibold">
              {title}
            </Text>
            {options.map(option => {
              const active = option.sort === value;
              return (
                <TouchableOpacity
                  key={option.sort}
                  style={styles.optionRow}
                  onPress={() => handleSelect(option.sort)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}>
                  <Text
                    color={active ? 'font-brand' : 'font-primary'}
                    weight={
                      active ? 'font-weight-semibold' : 'font-weight-regular'
                    }>
                    {option.label}
                  </Text>
                  {active ? <Text color="font-brand">{checkMark}</Text> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
};
