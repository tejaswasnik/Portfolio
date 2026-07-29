import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";

import "./SpotifyCard.scss";

const SpotifyCard = () => {
  const [spotify, setSpotify] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpotify = async () => {
      try {
        const response = await fetch("/.netlify/functions/spotify");

        if (!response.ok) {
          throw new Error("Failed to fetch Spotify data");
        }

        const data = await response.json();
        console.log("Spotify:", data);

        setSpotify(data);
      } catch (error) {
        console.error("Failed to fetch Spotify data:", error);
        setSpotify(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSpotify();

    const interval = setInterval(fetchSpotify, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="spotify-card bento-card">
        <p>Loading Spotify...</p>
      </div>
    );
  }

  if (!spotify) {
    return (
      <div className="spotify-card bento-card">
        <p>Unable to load Spotify data.</p>
      </div>
    );
  }

  return (
    <div className="spotify-card bento-card">
      <div className="spotify-card__header">
        <span className="spotify-card__label">
          {spotify.isPlaying ? "NOW PLAYING" : "LAST PLAYED"}
        </span>

        <Icon
          icon="selfhst:spotify"
          width={50}
          height={50}
          color="white"
          className="spotify-card__logo"
        />
      </div>

      <img
        src={spotify.albumImage}
        alt={spotify.album}
        className="spotify-card__album"
      />

      <div className="spotify-card__track">
        <div className="spotify-card__track-info">
          <span className="spotify-card__song">
            {spotify.title}
          </span>

          <span className="spotify-card__artist">
            {spotify.artist}
          </span>

          {!spotify.isPlaying && spotify.playedAt && (
            <span className="spotify-card__time">
              Last listened{" "}
              {new Date(spotify.playedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        <a
          href={spotify.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="spotify-card__link"
        >
          <Icon
            icon="heroicons:arrow-top-right-on-square-20-solid"
            width={26}
            height={26}
            color="white"
          />
        </a>
      </div>
    </div>
  );
};

export default SpotifyCard;