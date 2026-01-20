import React, { useState } from "react";
import circleImage from "../../assets/image3.webp";
import logo from "../../assets/logo.jfif"; // <- your actual logo

interface BusinessUnitScreenProps {
  onClose: () => void;
}

const BusinessUnitScreen: React.FC<BusinessUnitScreenProps> = ({ onClose }) => {
  const [activeCard, setActiveCard] = useState<string>("personal");

  const options = [
    { id: "personal", title: "Personal", description: "Chat Now" },
    { id: "business", title: "Business", description: "Chat Now" },
    { id: "saving", title: " Investment", description: "Chat Now" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
          width: 380,
          height: 560,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            height: 220,
            position: "relative",
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
            background: "linear-gradient(to right, #166534, #22c55e, #4ade80)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              width: 56,
              height: 56,
              backgroundColor: "#fff",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            {/* Replace OM text with actual logo */}
            <img
              src={logo}
              alt="Logo"
              style={{ width: "80%", height: "80%", objectFit: "contain" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", paddingTop: 80, paddingLeft: 24 }}>
            <div style={{ color: "#fff", fontWeight: "bold", fontSize: 24, marginBottom: 6 }}>
              Old Mutual
            </div>
            <div style={{ color: "rgba(255,255,255,0.95)", fontSize: 14 }}>
              Hey! How can we help you today
            </div>
          </div>
        </div>

        {/* Center chat button - overlapping header and cards */}
        <div
          style={{
            position: "absolute",
            top: 180,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
          }}
        >
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#ffffff",
              borderRadius: 8,
              padding: "12px 15px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              color: "#16a34a",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              border: "none",
            }}
          >
            {/* Green chat box icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="#16a34a"
              viewBox="0 0 16 16"
            >
              <path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10l4 4V4a2 2 0 0 0-2-2H2z" />
            </svg>
            Chat with us now
          </button>
        </div>

        {/* Cards */}
        <div style={{ flex: 1, backgroundColor: "#ffffff", padding: 16, marginTop: 16 }}>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
            {options.map((option) => {
              const isActive = activeCard === option.id;
              return (
                <div
                  key={option.id}
                  onClick={() => setActiveCard(option.id)}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: 8,
                    borderRadius: 8,
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: isActive ? "#16a34a" : "#bbf7d0",
                    backgroundColor: isActive ? "#16a34a" : "#bbf7d0",
                    boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.2)" : "0 2px 6px rgba(0,0,0,0.1)",
                    transform: isActive ? "scale(1.05)" : "scale(1)",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      border: "2px solid #fff",
                      backgroundImage: `url(${circleImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      marginBottom: 8,
                    }}
                  ></div>

                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      marginBottom: 4,
                      textAlign: "center",
                      color: isActive ? "#ffffff" : "#1f2937",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {option.title}
                  </div>

                  <button
                    style={{
                      backgroundColor: isActive ? "#ffffff" : "#16a34a",
                      color: isActive ? "#16a34a" : "#ffffff",
                      fontWeight: 600,
                      fontSize: 10,
                      padding: "4px 8px",
                      borderRadius: 6,
                      cursor: "pointer",
                      boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.1)" : "0 2px 4px rgba(0,0,0,0.2)",
                      outline: "none",
                    }}
                  >
                    {option.description}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom menu */}
        <div
          style={{
            backgroundColor: "#f9fafb",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            borderTop: "1px solid #e5e7eb",
            padding: 16,
            marginTop: 8,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#16a34a", cursor: "pointer" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  transition: "background-color 0.2s",
                }}
              >
                <svg style={{ width: 20, height: 20 }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
              <span style={{ fontSize: 10, marginTop: 6, fontWeight: 500 }}>Home</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#4b5563", cursor: "pointer" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  transition: "background-color 0.2s",
                }}
              >
                <svg style={{ width: 20, height: 20 }} fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span style={{ fontSize: 10, marginTop: 6, fontWeight: 500 }}>Conversation</span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 40,
              height: 40,
              backgroundColor: "#16a34a",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#fff",
              fontSize: 24,
              fontWeight: "bold",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessUnitScreen;
