"use client";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../context/UserContext";
import { useRouter } from "next/router";

export default function AdminTreksPage() {
  const router = useRouter();
  const { user } = useContext(UserContext);
  const [role, setRole] = useState(null);
  const [treks, setTreks] = useState([]);
  const [selectedTrek, setSelectedTrek] = useState(null);
  const [extraSections, setExtraSections] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const r = localStorage.getItem("role");
    if (!token || (r !== "admin" && r !== "superadmin")) {
      router.push("/etalogin");
      return;
    }
    setRole(r);
    fetchTreks();
  }, []);

  const fetchTreks = async () => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/treks`);
    setTreks(res.data);
  };

  const selectTrek = async (id) => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/treks/${id}`);
    setSelectedTrek(res.data);
    setExtraSections(res.data.extra_sections || []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedTrek({ ...selectedTrek, [name]: value });
  };

  const addSection = () => {
    setExtraSections([...extraSections, { title: "", content: "" }]);
  };

  const removeSection = (index) => {
    const updated = extraSections.filter((_, i) => i !== index);
    setExtraSections(updated);
  };

  const handleSectionChange = (i, key, value) => {
    const updated = [...extraSections];
    updated[i][key] = value;
    setExtraSections(updated);
  };

  const saveTrek = async () => {
    const token = localStorage.getItem("token");
    await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/api/treks/${selectedTrek._id}`,
      { ...selectedTrek, extra_sections: extraSections },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Trek Updated");
    fetchTreks();
  };

  const deleteTrek = async () => {
    if (!selectedTrek) return;

    const confirmDelete = confirm(`Are you sure you want to delete "${selectedTrek.name}"?`);
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/treks/${selectedTrek._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Trek deleted");

      setSelectedTrek(null);
      fetchTreks();
    } catch (error) {
      console.error(error);
      alert("Failed to delete trek");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial", color: "#222" }}>
      
      {/* Left Sidebar */}
      <div style={{ width: "30%", background: "#111", padding: "20px", color: "white" }}>
        <h2 style={{ marginBottom: "15px" }}>Treks</h2>

        <button
          onClick={() => router.push("/admin/create-trek")}
          style={{
            width: "100%",
            background: "#0a472e",
            padding: "10px",
            color: "white",
            marginBottom: "15px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Create New Trek
        </button>

        {treks.map((trek) => (
          <div
            key={trek._id}
            onClick={() => selectTrek(trek._id)}
            style={{
              padding: "12px",
              background: selectedTrek?._id === trek._id ? "#0a472e" : "#222",
              marginBottom: "10px",
              cursor: "pointer",
              borderRadius: "6px"
            }}
          >
            {trek.name}
          </div>
        ))}
      </div>

      {/* Right Panel */}
      <div style={{ width: "70%", padding: "25px", overflowY: "auto", background: "#f8f8f8" }}>
        
        {!selectedTrek && (
          <h2 style={{ textAlign: "center", marginTop: "50px", color: "#555" }}>
            Select a trek to edit
          </h2>
        )}

        {selectedTrek && (
          <div>
            <h2 style={{ marginBottom: "20px" }}>Edit: {selectedTrek.name}</h2>

            <label>Title</label>
            <input
              name="name"
              value={selectedTrek.name}
              onChange={handleChange}
              style={inputStyle}
            />

            <label>Overview</label>
            <textarea
              name="overview"
              value={selectedTrek.overview}
              onChange={handleChange}
              rows="3"
              style={inputStyle}
            />

            <label>Price USD</label>
            <input
              name="price_usd"
              value={selectedTrek.price_usd}
              onChange={handleChange}
              style={inputStyle}
            />

            {/* Extra Sections */}
            <h3 style={{ marginTop: "25px", marginBottom: "10px" }}>Extra Sections</h3>

            {extraSections.map((sec, i) => (
              <div key={i} style={{
                padding: "12px",
                background: "#fff",
                marginBottom: "14px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                position: "relative"
              }}>
                
                <button
                  onClick={() => removeSection(i)}
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "6px",
                    background: "#e11d48",
                    border: "none",
                    color: "#fff",
                    padding: "5px 9px",
                    borderRadius: "50%",
                    cursor: "pointer"
                  }}
                >
                  X
                </button>

                <input
                  placeholder="Section Title"
                  value={sec.title}
                  onChange={(e) => handleSectionChange(i, "title", e.target.value)}
                  style={inputStyle}
                />

                <textarea
                  placeholder="Section Content"
                  value={sec.content}
                  onChange={(e) => handleSectionChange(i, "content", e.target.value)}
                  rows="3"
                  style={inputStyle}
                />
              </div>
            ))}

            <button onClick={addSection} style={buttonSecondary}>Add Section</button>
            <button onClick={saveTrek} style={buttonPrimary}>Save Changes</button>
            <button
              onClick={deleteTrek}
              style={{
                ...buttonPrimary,
                background: "#b91c1c",
                marginLeft: "10px"
              }}
            >
              Delete Trek
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  fontSize: "15px",
  marginBottom: "10px",
  borderRadius: "6px",
  border: "1px solid #aaa"
};

const buttonPrimary = {
  background: "#0a472e",
  color: "white",
  padding: "12px 20px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "16px",
  marginTop: "15px"
};

const buttonSecondary = {
  background: "#006400",
  color: "white",
  padding: "10px 14px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginBottom: "10px"
};
