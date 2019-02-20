const moment = require('moment');

const createdAt = moment('2018-01-07').format();
const updatedAt = createdAt;

module.exports = [
  {
    id: 'f9a4731d-7dea-4a9a-9b7d-8766d651c202',
    userId: 'dfef16f9-11a7-4eae-9ba0-7038c6ccaa73',
    slug: 'new-article-1',
    title: 'new article one',
    description: 'new article',
    body:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla faucibus ipsum non metus finibus ultricies. Donec ac auctor dui, sed fringilla est. Duis et pellentesque nisl, a gravida felis. Ut tempor felis id dignissim congue. Nunc blandit nunc sit amet dui pharetra, quis porttitor sem ullamcorper. Suspendisse faucibus imperdiet lacinia.',
    status: 'published',
    createdAt,
    updatedAt
  },
  {
    id: '919cbf82-5290-4f34-be59-18e94ccb4afc',
    userId: '4b134316-966b-47f8-bb47-2fb27a36b40c',
    slug: 'new-article-2',
    title: 'new article two',
    description: 'new article',
    body:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla faucibus ipsum non metus finibus ultricies. Donec ac auctor dui, sed fringilla est. Duis et pellentesque nisl, a gravida felis. Ut tempor felis id dignissim congue. Nunc blandit nunc sit amet dui pharetra, quis porttitor sem ullamcorper. Suspendisse faucibus imperdiet lacinia.',
    status: 'published',
    createdAt,
    updatedAt
  },
  {
    id: '7bfe144e-936e-47ae-817c-55e001dcb28f',
    userId: '09a0a74f-e2d0-4976-84bc-8118b0c3d86c',
    slug: 'new-article-3',
    title: 'new article three',
    description: 'new article',
    body:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla faucibus ipsum non metus finibus ultricies. Donec ac auctor dui, sed fringilla est. Duis et pellentesque nisl, a gravida felis. Ut tempor felis id dignissim congue. Nunc blandit nunc sit amet dui pharetra, quis porttitor sem ullamcorper. Suspendisse faucibus imperdiet lacinia.',
    status: 'published',
    createdAt,
    updatedAt
  }
];
