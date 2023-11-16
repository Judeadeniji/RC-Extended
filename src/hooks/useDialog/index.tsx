import React from "react";
import { $signal } from "../../store";

type UseDialog = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};


/**
 * A custom hook for managing dialog state.
 * @returns An object containing the isOpen boolean value, open and close functions.
 */
function useDialog(): UseDialog {
  const isOpen = $signal(false);

  const open = () => {
    isOpen.set(true)
  };

  const close = () => {
    isOpen.set(false)
  };

  return {
    get isOpen() {
        return isOpen.value
    },
    open,
    close
  }
};

function Dialog({ Content }): React.JSX.Element {
    const { isOpen, close, open } = useDialog()

    return isOpen && (
        <Content {...{open, close, isOpen }} />
    )
}

export {
    useDialog,
    Dialog,
    type UseDialog
};
