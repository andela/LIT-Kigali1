import { getReadingTime } from '../../helpers';
import { createArticle } from '../mocks/db.json';

describe('getReadingTime', () => {
  test('Should return reading time', () => {
    expect.assertions(1);
    expect.stringContaining('min');
    const readingTime = getReadingTime(JSON.stringify(createArticle.body));
    expect(readingTime.length).toBeGreaterThan(0);
  });

  test('Should be undefined', () => {
    expect.assertions(1);
    expect.stringContaining('min');
    const readingTime = getReadingTime();
    expect(readingTime).toBeUndefined();
  });
});
