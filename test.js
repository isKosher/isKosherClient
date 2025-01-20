const accessKey = "kY6kYQWdWG9UE-nOeyPbCv5LtvsOHLtYcYLPe4wNNRQ"; // Replace with your Unsplash API access key

const searchPhotos = async () => {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=milkshake&per_page=50`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log(data.results); // This logs an array of pizza photo objects
  } catch (error) {
    console.error("Error fetching pizza photos:", error);
  }
};

searchPhotos();
