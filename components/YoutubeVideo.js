import React from "react";

const YoutubeVideo = ({ videoId }) => {
  return (
    <iframe
      style={{ height: "350px", borderRadius: "20px"}}
      width="560"
      height="320"
      src={videoId}
      title="YouTube video player"
      frameBorder="0"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
      allow="autoplay; encrypted-media"
    />
  );
};

export default YoutubeVideo;
