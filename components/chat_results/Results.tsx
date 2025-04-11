"use client";
import { Weather } from "./Weather";
export const Results: React.FC = () => {
  return (
    <div className=" p-4 border-l border-gray-200 ">
      <div className="mt-10"></div>
      <Weather />
    </div>
  );
};
