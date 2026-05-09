import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { scale } from '../../utilities';

export const useStyles = () =>
  useMemo(
    () =>
      StyleSheet.create({
        font: {
          fontWeight: 'bold',
          marginLeft: -scale(10),
        },
        itemBase: {
          marginVertical: 0,
          backgroundColor: 'transparent',
        },
      }),
    [],
  );
