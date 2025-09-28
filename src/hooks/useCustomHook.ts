'use client';

import { useState } from 'react';

export const useCustomHook = (initialValue = 0) => {
  const [value, setValue] = useState(initialValue);

  const increment = () => {
    setValue((prevValue) => prevValue + 1);
  };

  return {
    value,
    increment,
  };
};
