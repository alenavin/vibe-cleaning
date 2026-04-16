import { useState, useEffect } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ref, onValue, push, update, remove } from "firebase/database";
import { db } from "./firebase";
import "./App.css";

const DEFAULT_ITEMS = [
  { text: "Vacuum floors", done: false },
  { text: "Wipe countertops", done: false },
  { text: "Clean bathroom", done: false },
  { text: "Take out trash", done: false },
];

export default function App() {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingDescId, setEditingDescId] = useState(null);
  const [descInput, setDescInput] = useState("");
  const [sortDelayed, setSortDelayed] = useState(new Set());
  const [listRef] = useAutoAnimate({ duration: 1000, easing: "ease-in-out" });

  useEffect(() => {
    const itemsRef = ref(db, "items");
    const unsubscribe = onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded = Object.entries(data).map(([id, val]) => ({
          id,
          ...val,
        }));
        setItems(loaded);
      } else if (!initialized) {
        // First run: seed default items
        DEFAULT_ITEMS.forEach((item) => push(itemsRef, item));
      } else {
        setItems([]);
      }
      setInitialized(true);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggle = (id, done) => {
    update(ref(db, `items/${id}`), { done: !done });
    if (!done) {
      setSortDelayed((prev) => new Set([...prev, id]));
      setTimeout(() => {
        setSortDelayed((prev) => {
          const s = new Set(prev);
          s.delete(id);
          return s;
        });
      }, 800);
    }
  };

  const addItem = () => {
    const text = input.trim();
    if (!text) return;
    push(ref(db, "items"), { text, done: false });
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addItem();
  };

  const deleteItem = (e, id) => {
    e.stopPropagation();
    remove(ref(db, `items/${id}`));
  };

  const startEditingDesc = (e, item) => {
    e.stopPropagation();
    setEditingDescId(item.id);
    setDescInput(item.description || "");
  };

  const saveDesc = (id) => {
    update(ref(db, `items/${id}`), { description: descInput.trim() });
    setEditingDescId(null);
  };

  const handleDescKeyDown = (e, id) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveDesc(id);
    }
    if (e.key === "Escape") setEditingDescId(null);
  };

  const doneCount = items.filter((i) => i.done).length;
  const sortedItems = [...items].sort((a, b) => {
    const aDone = a.done && !sortDelayed.has(a.id);
    const bDone = b.done && !sortDelayed.has(b.id);
    return Number(aDone) - Number(bDone);
  });

  return (
    <div className="app">
      <header className="app-header">
        <h1>🫧 Vibe-cleaning 🫧</h1>
        <h3>Чеклист уборки для сладеньких котяток 🐱 🧹 🧼 </h3>
        <span className="progress">
          {doneCount} / {items.length} done
        </span>
      </header>
      пше
      {loading && (
        <div className="loading">
          <div className="spinner" />
          <span>смотрю где грязьненько</span>
        </div>
      )}
      <ul className="list" ref={listRef}>
        {sortedItems.map((item) => (
          <li
            key={item.id}
            className={item.done ? "item done" : "item"}
            onClick={() => toggle(item.id, item.done)}
          >
            <span className="checkbox">{item.done ? "✓" : ""}</span>
            <div className="item-body">
              <span className="item-text">{item.text}</span>
              {editingDescId === item.id ? (
                <input
                  className="desc-input"
                  autoFocus
                  placeholder="Add a description..."
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  onBlur={() => saveDesc(item.id)}
                  onKeyDown={(e) => handleDescKeyDown(e, item.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className={
                    item.description ? "item-desc" : "item-desc placeholder"
                  }
                  onClick={(e) => startEditingDesc(e, item)}
                >
                  {item.description || "Add a description..."}
                </span>
              )}
            </div>
            <button
              className="delete-btn"
              onClick={(e) => deleteItem(e, item.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <div className="add-bar">
        <input
          type="text"
          placeholder="Add a task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={addItem}>Add</button>
      </div>
    </div>
  );
}
