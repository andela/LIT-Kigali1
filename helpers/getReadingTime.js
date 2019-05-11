export const getDescription = (body) => {
  let articleText = '';
  body.map((paragraph) => {
    articleText += paragraph.text;
    return articleText;
  });
  return articleText;
};


const getReadingTime = body => {
  try {
    const text = getDescription(JSON.parse(body).blocks);
    const readingMinutes = Math.ceil(text.split(' ').length / 265);
    const readingTime = readingMinutes => {
      const hours = Math.floor(readingMinutes / 60);
      const mins = readingMinutes % 60;
      return `${hours}h ${mins}min`.replace('0h ', ''); // if we have 0 hours remove it.
    };
    return readingTime(readingMinutes);
  } catch (error) {}
};

export default getReadingTime;
