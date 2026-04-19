// src/components/RestaurantList.jsx

import React, { memo } from 'react';
import RestaurantCard from './RestaurantCard';

const RestaurantList = memo(function RestaurantList({ restaurants }) {
  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {restaurants.length > 0 ? (
        restaurants.map((res) => (
          <RestaurantCard key={res._id || res.id} restaurant={res} />
        ))
      ) : (
        <div className="col-span-full text-center text-gray-500">
          No restaurants match your filters.
        </div>
      )}
    </div>
  );
});

export default RestaurantList;
