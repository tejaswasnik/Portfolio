import "dotenv/config";
import axios from "axios";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const CODE = "AQD64sNiOl_GnHxjLbDoRDj-Lo-9NEIOhku4S0RUFAVgkFo3jQ0jFyQZwf3itt_iXI7HPFGvR37iDxjsBHXIhIfX3EiTUjCdC_GsrYVr0-DP2UaduQDmFDP4iEovB6lCsD0NyFlmMtxPoSoOB9plW08fjOq86Dx5gJl4x5hREm77oLmNoOstgKlkJXP9cxu-DZtzPmwOjsCp5wV-cTwsXw_eMvz2s4-rZc2AN3FthZLyazxhgURPDFZ_X6d6UOqCspGpJ11OHVal4V064jLp1HISlWQlWBfWcj4SvQTOHf0U"
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