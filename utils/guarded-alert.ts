import { Alert, type AlertButton, type AlertOptions } from 'react-native';

import { beginBlockingInteraction, isBlockingInteractionActive } from '@/utils/press-guard';

export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions,
) {
  if (isBlockingInteractionActive()) {
    return;
  }

  const releaseBlock = beginBlockingInteraction();
  let didHandleButton = false;

  const release = () => {
    releaseBlock();
  };

  const resolvedButtons = buttons && buttons.length > 0 ? buttons : [{ text: '확인' }];
  const guardedButtons = resolvedButtons.map((button) => ({
    ...button,
    onPress: () => {
      if (didHandleButton) {
        return;
      }

      didHandleButton = true;
      release();
      button.onPress?.();
    },
  }));

  Alert.alert(title, message, guardedButtons, {
    ...options,
    onDismiss: () => {
      release();
      options?.onDismiss?.();
    },
  });
}
