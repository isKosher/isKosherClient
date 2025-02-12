import React from "react";

const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
      <p className="text-gray-600 mb-4">
        Something went wrong while loading restaurants.
      </p>
      <p className="text-gray-500">Please try again later.</p>
    </div>
  );
};

export default ErrorPage;
