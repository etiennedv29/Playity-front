import React from "react";

const YoutubeVideo = ({ videoId }) => {
  return (
    <iframe
      style={{ height: "74vh", width: "62vw", borderRadius: "20px", border: "1px solid white"}}
      width="560"
      height="320"
      src={`https://www.youtube.com/embed/${videoId}?si=EiH5g4AHCUor4xyn&autoplay=1&controls=0&mute=1`}
      title="YouTube video player"
      frameBorder="0"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
      allow="autoplay; encrypted-media"
    />
  );
};

export default YoutubeVideo;
