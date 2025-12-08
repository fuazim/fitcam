'use client';

import AnimateOnScroll from './AnimateOnScroll';
import GymCard from './GymCard';

interface GymCardWrapperProps {
  name: string;
  location: string;
  thumbnail: string;
  id: string;
  slug?: string;
  index: number;
}

export default function GymCardWrapper({ name, location, thumbnail, id, slug, index }: GymCardWrapperProps) {
  return (
    <AnimateOnScroll animation="fadeInUp" delay={200 + (index * 100)}>
      <GymCard name={name} location={location} thumbnail={thumbnail} id={id} slug={slug} />
    </AnimateOnScroll>
  );
}

