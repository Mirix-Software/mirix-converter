function capitalize<T extends string>(value: T): Capitalize<T> {
  const firstLetter = value.slice(0, 1);
  const restLetters = value.slice(1);

  return `${firstLetter.toUpperCase()}${restLetters}` as Capitalize<T>;
}

export { capitalize };
