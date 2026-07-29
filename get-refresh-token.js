import "dotenv/config";
import axios from "axios";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const CODE = "AQBc6HuIzK6UJJ7dEjtTeXSV6OdOhChBHHXFzw3AL7PjHnxIckA68YNtSnGUrzMdFWJYsF355FuTJgbl38mpciHsiGmsM-wLeyeuiQPLjYqW0vHS3J_S6jLHgHnqDQ7yRaDqqgNjJJ9OP-PTid2qdfBq56JKxzw3cHn0u-wLvBD_fzCUCw38oIe1ShM1q-evXmrtPcOYSDVCbbqmQKA8iKgiveMZqz32b4AlcIpc9YLaP-5GJn6KGCLW7pdtaYgWnbELnI81"
const REDIRECT_URI = "http://127.0.0.1:8888/callback";

const basic = Buffer.from(
  `${CLIENT_ID}:${CLIENT_SECRET}`
).toString("base64");

// 👇 Replace everything below with this
try {
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({
      grant_type: "authorization_code",
      code: CODE,
      redirect_uri: REDIRECT_URI,
    }).toString(),
    {
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  console.log(response.data);
} catch (err) {
  console.log(err.response?.data);
}