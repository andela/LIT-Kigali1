const getReadingTime = text => {
  const readingMinutes = Math.ceil(text.split(' ').length / 265);
  const readingTime = readingMinutes => {
    const hours = Math.floor(readingMinutes / 60);
    const mins = readingMinutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins} min`;
  };
  return readingTime(readingMinutes);
};

export default getReadingTime;
