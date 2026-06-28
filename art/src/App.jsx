import { useState } from 'react'
import './App.css'
import bgImage from './assets/fcda0ac86948c478f01ac41cce6878c1abd33e13-1600x1067.avif'

function App() {
  const [artwork, setArtwork] = useState(null)
  const [history, setHistory] = useState([])
  const [banList, setBanList] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchArtwork = async() => {
    setLoading(true)
    try {
      let found = false
      while (!found) {
  
        const searchRes = await fetch(
          `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&isPublicDomain=true&q=painting`
        )
        const searchData = await searchRes.json()
        const ids = searchData.objectIDs
  
        // Step 2: pick a random ID from the list
        const randomId = ids[Math.floor(Math.random() * ids.length)]
  
        // Step 3: fetch that specific artwork
        const artRes = await fetch(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${randomId}`
        )
        const art = await artRes.json()
  
        // Step 4: skip if missing image or key fields
        if (!art.primaryImage || !art.artistDisplayName) continue
  
        // Step 5: check ban list
        if (
          banList.includes(art.artistDisplayName) ||
          banList.includes(art.country) ||
          banList.includes(art.medium) ||
          banList.includes(art.date_display)
        ) continue
  
        // Step 6: build the art object
        const newArt = {
          title: art.title,
          artist_title: art.artistDisplayName,
          date_display: art.objectDate,
          place_of_origin: art.country,
          medium_display: art.medium,
          imageUrl: art.primaryImageSmall || art.primaryImage
        }
  
        setArtwork(newArt)
        setHistory(prev => [newArt, ...prev])
        found = true
      }
    } catch (err) {
      console.error("fetchArtwork error:", err)
    } finally {
      setLoading(false)
    }
  }

  const addToBan = (value) =>{
    if (value && !banList.includes(value)) {
      setBanList(prev => [...prev, value])
    }
  }
const removeFromBan = (value) => {
  setBanList(prev => prev.filter(item => item !== value))
}

  return (
  
    <div className="app" style={{
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh'
      }}>

    

      <div className="history-panel">
        <h2>what we seen so far?</h2>
        {history.length === 0 ? (
        <p>No history yet!</p>
        ):(
          history.map((art,index) => (
        <div key={index} className="history-item">
          <img src={art.imageUrl} 
          alt={art.title} 
          width="100"
           />
          <p>{art.title}</p>
        </div>
        ))
        )}
      </div>
      <div className="main-panel">
        <h1>🎨 ArtDrop</h1>
        <p>Discover a new masterpiece with every click</p>
        <button className="button" onClick={fetchArtwork} disabled={loading}>
          {loading ? "Loading...🔄" : "Discovery Art 🖼️"}
          </button>
          {loading && (
          <p className="loading-text">🎨 Finding a masterpiece for you...</p>
)}    

        {artwork ? (
          <div className="artwork-card">
            <img src={artwork.imageUrl} alt={artwork.title} width="500" />
            <h2>{artwork.title}</h2>
            {/* CLICKABLE ATTRIBUTES - click to ban */}
            <p>
              🧑‍🎨 Artist:{" "}
                <span className="clickable" onClick={() => addToBan(artwork.artist_title)}>
                {artwork.artist_title || "Unknown"}
                </span>
            </p>
            <p>
              📅 Date:{" "}
              <span className="clickable" onClick={() => addToBan(artwork.date_display)}>
                {artwork.date_display || "Unknown"}
              </span>
            </p>
            <p>
              📍 Origin:{" "}
              <span className="clickable" onClick={() => addToBan(artwork.place_of_origin)}>
                {artwork.place_of_origin || "Unknown"}
              </span>
            </p>
            <p>
              🖌️ Medium:{" "}
              <span className="clickable" onClick={() => addToBan(artwork.medium_display)}>
                {artwork.medium_display || "Unknown"}
              </span>
            </p>
          </div>
        ):(
        <p>Click the button to discover art!</p>
        )}

      </div>
      {/* RIGHT SIDE - Ban List */}
      <div className="ban-panel">
        <h2>🚫 Ban List</h2>
        <p>Click an attribute to ban it</p>
        {banList.length === 0 ? (
          <p>No bans yet!</p>
        ) : (
          banList.map((item, index) => (
            <div
              key={index}
              className="ban-item"
              onClick={() => removeFromBan(item)}
            >
              ❌ {item}
            </div>
          ))
        )}
      </div>
    </div>

)
}

export default App
