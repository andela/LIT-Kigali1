const getReadingTime = text => {
  const readingMinutes = Math.ceil(text.split(' ').length / 265);
  const readingTime = readingMinutes => {
    const hours = Math.floor(readingMinutes / 60);
    const mins = readingMinutes % 60;
    return `${hours}h ${mins}min`.replace('0h ', ''); // if we have 0 hours remove it.
  };
  return readingTime(readingMinutes);
};

export default getReadingTime;
