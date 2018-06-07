const clientID = 'ba672625f19645e5a9877b341d905a7b';
const redirectURI = 'http://localhost:3000/';

let userAccessToken = '';

const Spotify = {
  getAccessToken() {
    if (userAccessToken) {
      return userAccessToken;
    }
    const url = window.location.href;
    const accessToken = url.match(/access_token=([^&]*)/);
    const expiresIn = url.match(/expires_in=([^&]*)/);

    if (accessToken && expiresIn) {
      userAccessToken = accessToken[1];
      const expirationTime = Number(expiresIn[1]) * 1000;
      window.setTimeout(() => {
        userAccessToken = '';
      }, expirationTime);
      window.history.pushState('For Acess Token', null, '/');
    } else {
      window.location.href =
      `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
    }
  },

  search(term) {
    const endpoint = '';
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: {Authorization: `Bearer ${userAccessToken}`}
    }).then(response => response.json()).then(jsonResponse => {
      if (!jsonResponse.tracks) {
        return [];
      }
      return jsonResponse.tracks.items.map(track => {
        return {
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri
        }
      })
    })
  },

  savePlaylist(playlistName, trackURIs) {
    if (!playlistName || !trackURIs) {
      return;
    }
    const accessToken = this.getAccessToken();

    return fetch('https://api.spotify.com/v1/me', {
      headers: {Authorization: `Bearer ${accessToken}`}
    }).then(response => response.json())
    .then(jsonResponse => jsonResponse.id)
    .then(userId => {
      fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        headers: {Authorization: `Bearer ${accessToken}`},
        body: JSON.stringify({ name: playlistName }),
        method: 'POST'
      })
      .then(response => response.json())
      .then(jsonResponse => {
        const playlistId = jsonResponse.id;
        fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
          headers: {Authorization: `Bearer ${accessToken}`},
          body: JSON.stringify({ uris: trackURIs }),
          method: 'POST'
        });
      });
  })
}


}

export default Spotify;
