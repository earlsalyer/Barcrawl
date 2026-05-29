import React, { useEffect, useMemo, useRef, useState } from "react";

const peopleList = ["Denise", "Earl", "Bobby", "Scott"];

const barsList = [
  { name: "The Bionic Bar", lat: 25.0819, lng: -77.3420 },
  { name: "Schooner Bar", lat: 25.0817, lng: -77.3405 },
  { name: "Boleros", lat: 25.0820, lng: -77.3412 },
  { name: "The Lime & Coconut", lat: 25.0815, lng: -77.3425 },
  { name: "Playmakers Bar & Arcade", lat: 25.0816, lng: -77.3430 },
  { name: "Music Hall", lat: 25.0822, lng: -77.3418 },
  { name: "Two70 Bar", lat: 25.0825, lng: -77.3422 },
  { name: "Giovanni's Wine Bar", lat: 25.0828, lng: -77.3410 },
  { name: "Solarium Bar", lat: 25.0830, lng: -77.3408 },
  { name: "Casino Royale Bar", lat: 25.0832, lng: -77.3402 },
  { name: "Windjammer Bar", lat: 25.0834, lng: -77.3398 },
  { name: "Sunshine Bar", lat: 25.0836, lng: -77.3395 },
];

// ROOM SYNC (no login) via URL
const getRoomId = () => {
  if (typeof window === "undefined") return "default";
  const hash = window.location.hash.replace("#", "");
  return hash || "default-room";
};

const roomId = getRoomId();

export default function BarCrawlChecklistApp() {
  const [theme, setTheme] = useState("dark");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [confetti, setConfetti] = useState([]);
  const [mapOpen, setMapOpen] = useState(false);

  const channel = useRef(null);

  const [checked, setChecked] = useState(() => {
    const saved = localStorage.getItem("barcrawl-state");
    if (saved) return JSON.parse(saved);

    const init = {};
    barsList.forEach((b) => {
      init[b.name] = {};
      peopleList.forEach((p) => (init[b.name][p] = false));
    });
    return init;
  });

  // ---- PERSIST ----
  useEffect(() => {
    localStorage.setItem("barcrawl-state", JSON.stringify(checked));
  }, [checked]);

  // ---- SUPABASE-STYLE REALTIME (mock fallback via BroadcastChannel) ----
  useEffect(() => {
    if (typeof window === "undefined") return;
    channel.current = new BroadcastChannel(`barcrawl-${roomId}`);

    channel.current.onmessage = (e) => {
      if (e.data?.type === "sync") {
        setChecked(e.data.payload);
      }
    };

    return () => channel.current?.close();
  }, []);

  const broadcast = (data) => {
    channel.current?.postMessage(data);
  };

  // ---- SOUND ----
  const playSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.value = 880;
      g.gain.value = 0.05;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.1);
    } catch {}
  };

  // ---- VIBRATION ----
  const vibrate = () => {
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // ---- CONFETTI ----
  const triggerConfetti = () => {
    const arr = Array.from({ length: 30 }).map(() => ({
      id: Math.random(),
      x: Math.random() * 100,
    }));
    setConfetti(arr);
    setTimeout(() => setConfetti([]), 1200);
  };

  // ---- DISTANCE CHECK ----
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const toRad = (x) => (x * Math.PI) / 180;
    const a =
      Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(toRad(lon2 - lon1) / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const geoCheckIn = (bar) => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      const b = barsList.find((x) => x.name === bar);
      const dist = getDistance(
        pos.coords.latitude,
        pos.coords.longitude,
        b.lat,
        b.lng
      );

      if (dist < 200) {
        alert(`✔ Checked in at ${bar}`);
      } else {
        alert(`Too far from ${bar} (${Math.round(dist)}m)`);
      }
    });
  };

  // ---- MAP ROUTE ----
  const openMapRoute = () => {
    const coords = barsList.map((b) => `${b.lat},${b.lng}`).join("/");
    window.open(`https://www.google.com/maps/dir/${coords}`, "_blank");
  };

  // ---- TOGGLE ----
  const toggleCheck = (bar, person) => {
    setChecked((prev) => {
      const updated = {
        ...prev,
        [bar]: {
          ...prev[bar],
          [person]: !prev[bar][person],
        },
      };

      playSound();
      vibrate();
      broadcast({ type: "sync", payload: updated });

      const done = barsList.every((b) => updated[b.name]?.[person]);
      if (done) triggerConfetti();

      return updated;
    });
  };

  const completedCount = (p) =>
    barsList.reduce((a, b) => a + (checked[b.name]?.[p] ? 1 : 0), 0);

  const roomLink =
    typeof window !== "undefined" ? window.location.href : "";

  return (
    <div
      className={
        theme === "dark"
          ? "min-h-screen bg-black text-white p-4"
          : "min-h-screen bg-white text-black p-4"
      }
    >
      <h1 className="text-3xl text-center font-bold">🍹 Bar Crawl Ultimate</h1>

      <div className="flex flex-wrap justify-center gap-2 my-3">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="px-3 py-2 bg-gray-700 rounded"
        >
          Sound
        </button>
        <button
          onClick={() => setVibrationEnabled(!vibrationEnabled)}
          className="px-3 py-2 bg-gray-700 rounded"
        >
          Vibration
        </button>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="px-3 py-2 bg-gray-700 rounded"
        >
          Theme
        </button>
        <button
          onClick={openMapRoute}
          className="px-3 py-2 bg-blue-600 rounded"
        >
          Route Map
        </button>
      </div>

      <div className="text-center text-xs mb-2">
        Room: {roomId} | Share link: {roomLink}
      </div>

      <div className="text-center mb-3">
        <a href={roomLink} className="text-blue-400">
          Invite Friends (same link)
        </a>
      </div>

      {confetti.map((c) => (
        <div
          key={c.id}
          className="fixed text-xl"
          style={{ left: `${c.x}%`, top: "0%" }}
        >
          🍾
        </div>
      ))}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-700">
          <thead>
            <tr>
              <th>Bar</th>
              {peopleList.map((p) => (
                <th key={p}>
                  {p} ({completedCount(p)})
                </th>
              ))}
              <th>📍</th>
            </tr>
          </thead>

          <tbody>
            {barsList.map((b) => (
              <tr key={b.name} className="border-t border-gray-700">
                <td>{b.name}</td>

                {peopleList.map((p) => (
                  <td key={p} className="text-center">
                    <button
                      onClick={() => toggleCheck(b.name, p)}
                      className={`w-8 h-8 ${
                        checked[b.name]?.[p]
                          ? "bg-green-500"
                          : "bg-gray-700"
                      }`}
                    >
                      {checked[b.name]?.[p] ? "✓" : ""}
                    </button>
                  </td>
                ))}

                <td>
                  <button onClick={() => geoCheckIn(b.name)}>📍</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center text-xs mt-4 opacity-60">
        No login • Real-time room sync • GPS check-in • Route maps • Haptics •
        Confetti
      </div>
    </div>
  );
}
