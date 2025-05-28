import React from "react";
import { Pet } from "../../types";

const PetCard: React.FC<{ pet: Pet }> = ({ pet }) => {
  return (
    <li className="mb-1">
      <strong>{pet.name}</strong> ({pet.species}), {pet.breed}, Age: {pet.age}
    </li>
  );
};

export default PetCard;