import { useState, useEffect } from "react";

export const usePersistentState = (key, defaultValue) => {
  // initialize: searchs in localStorage or uses the default value (in AppContext.jsx)
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  });

  // saves into localStorage every time that state change
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
