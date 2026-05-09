import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { alignment } from '../../utilities';

export const useStyles = () =>
  useMemo(
    () =>
      StyleSheet.create({
        separator: { ...alignment.MTmedium },
      }),
    [],
  );
