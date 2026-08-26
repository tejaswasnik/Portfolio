import { Icon } from "@iconify/react";
import { useState, useEffect, useCallback, useRef } from "react";
import useTilt from "../../hooks/useTilt";

import "./SpotifyCard.scss";

const POLL_PLAYING = 10000; // 10s when a song is playing
const POLL_IDLE = 30000; // 30s when idle

const SpotifyCard = () => {
  const [spotify, setSpotify] = useState(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef(null);
  const tiltRef = useTilt({ maxRotation: 5, scale: 1.01 });

  const setRefs = (el) => {
    cardRef.current = el;
    tiltRef.current = el;
  };

  const fetchSpotify = useCallback(async () => {
    try {
      const response = await fetch("/.netlify/functions/spotify");

      if (!response.ok) {
        throw new Error("Failed to fetch Spotify data");
      }

      const data = await response.json();
      setSpotify(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch Spotify data:", error);
      setSpotify(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let timeoutId = null;
    let cancelled = false;

    const poll = async () => {
      const data = await fetchSpotify();
      if (cancelled) return;

      // Poll faster when playing, slower when idle
      const delay = data?.isPlaying ? POLL_PLAYING : POLL_IDLE;
      timeoutId = setTimeout(poll, delay);
    };

    poll();
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fetchSpotify]);



  // Determine what to render inside the card
  const renderContent = () => {
    if (loading) {
      return <p>Loading Spotify...</p>;
    }

    if (!spotify || !spotify.title) {
      return (
        <>
          <div className="spotify-card__header">
            <span className="spotify-card__label">OFFLINE</span>
            <Icon
              icon="selfhst:spotify"
              width={50}
              height={50}
              color="white"
              className="spotify-card__logo"
            />
          </div>
          <p className="spotify-card__offline-msg">Not listening right now</p>
        </>
      );
    }



    return (
      <>
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

        <div className="spotify-card__content">
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
      </>
    );
  };

  return (
    <div className="spotify-card bento-card" ref={setRefs}>
      {renderContent()}
    </div>
  );
};

export default SpotifyCard;