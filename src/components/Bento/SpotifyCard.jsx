import { Icon } from "@iconify/react";
import spotifyAlbum from "../../assets/spotify-album.png";
import "./SpotifyCard.scss";

const SpotifyCard = () => {
  return (
    <div className="spotify-card bento-card">
      <div className="spotify-card__header">
        <span className="spotify-card__label">NOW PLAYING</span>
        <Icon icon="selfhst:spotify" width={50} height={50} color="white" className="spotify-card__logo" />
      </div>

      <img src={spotifyAlbum} alt="After Hours" className="spotify-card__album" />

      <div className="spotify-card__track">
        <div className="spotify-card__track-info">
          <span className="spotify-card__song">After Hours</span>
          <span className="spotify-card__artist">The Weeknd</span>
        </div>
        <Icon
          icon="heroicons:arrow-top-right-on-square-20-solid"
          width={26}
          height={26}
          color="white"
          className="spotify-card__link"
        />
      </div>
    </div>
  );
};

export default SpotifyCard;
