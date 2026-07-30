import axios from "axios";

export async function handler() {
    console.log({
  clientId: !!process.env.SPOTIFY_CLIENT_ID,
  clientSecret: !!process.env.SPOTIFY_CLIENT_SECRET,
  refreshToken: !!process.env.SPOTIFY_REFRESH_TOKEN,
});
  try {
    // Encode Client ID and Client Secret
    const basic = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    // Get a new access token
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: process.env.SPOTIFY_REFRESH_TOKEN,
      }).toString(),
      {
        headers: {
          Authorization: `Basic ${basic}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        
      }
    );

    const accessToken = tokenResponse.data.access_token;
console.log("Access token received:", !!accessToken);
    // Fetch currently playing track
    const spotifyResponse = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        validateStatus: () => true, // Don't throw on 204
      }
    );

    // Nothing is currently playing — fetch recently played
    if (spotifyResponse.status === 204 || !spotifyResponse.data) {
      try {
        const recentResponse = await axios.get(
          "https://api.spotify.com/v1/me/player/recently-played?limit=1",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const recentTrack = recentResponse.data?.items?.[0];
        if (recentTrack) {
          const song = recentTrack.track;
          return {
            statusCode: 200,
            body: JSON.stringify({
              isPlaying: false,
              title: song.name,
              artist: song.artists.map((artist) => artist.name).join(", "),
              album: song.album.name,
              albumImage: song.album.images[0]?.url,
              spotifyUrl: song.external_urls.spotify,
              playedAt: recentTrack.played_at,
            }),
          };
        }
      } catch (recentError) {
        console.error("Failed to fetch recently played:", recentError.message);
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          isPlaying: false,
        }),
      };
    }

    const song = spotifyResponse.data.item;
console.log("Spotify response status:", spotifyResponse.status);
console.log("Spotify response data:", spotifyResponse.data);
    return {
      statusCode: 200,
      body: JSON.stringify({
        isPlaying: spotifyResponse.data.is_playing,
        title: song.name,
        artist: song.artists.map((artist) => artist.name).join(", "),
        album: song.album.name,
        albumImage: song.album.images[0]?.url,
        progress: spotifyResponse.data.progress_ms,
        duration: song.duration_ms,
        spotifyUrl: song.external_urls.spotify,
      }),
    };
  } catch (error) {
    console.error(error.response?.data || error.message);

   return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
}