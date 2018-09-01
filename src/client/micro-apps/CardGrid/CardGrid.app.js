import React from 'react';
import Card from '../Card/Card.app';

export const cities = [
  {
    id: 1,
    title: 'Toronto',
    image: 'https://loremflickr.com/250/150/toronto',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit officiis blanditiis aut error quas totam. Sed, culpa voluptatum! Quis quam tempore accusamus praesentium aliquid dolorem incidunt necessitatibus ex omnis vitae.',
    price: '23.99'
  },
  {
    id: 2,
    title: 'Zurich',
    image: 'https://loremflickr.com/250/150/zurich',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit officiis blanditiis aut error quas totam. Sed, culpa voluptatum! Quis quam tempore accusamus praesentium aliquid dolorem incidunt necessitatibus ex omnis vitae.',
    price: '8,923.44'
  },
  {
    id: 3,
    title: 'Moscow',
    image: 'https://loremflickr.com/250/150/moscow',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit officiis blanditiis aut error quas totam. Sed, culpa voluptatum! Quis quam tempore accusamus praesentium aliquid dolorem incidunt necessitatibus ex omnis vitae.',
    price: '23.99'
  },
  {
    id: 4,
    title: 'Pune',
    image: 'https://loremflickr.com/250/150/pune',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit officiis blanditiis aut error quas totam. Sed, culpa voluptatum! Quis quam tempore accusamus praesentium aliquid dolorem incidunt necessitatibus ex omnis vitae.',
    price: '45.99'
  }
];

function CardGrid() {
  const cardList = cities.map(city => <Card key={city.id} {...city} />);
  return <div className="columns">{cardList}</div>;
}

export default CardGrid;
