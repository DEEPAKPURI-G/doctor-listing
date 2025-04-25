import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

export default function App() {
  const [doctors, setDoctors] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [suggestions, setSuggestions] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  const [consultMode, setConsultMode] = useState(searchParams.get("mode") || "");
  const [specialties, setSpecialties] = useState(
    searchParams.getAll("specialty") || []
  );
  const [sortOption, setSortOption] = useState(searchParams.get("sort") || "");

  useEffect(() => {
    axios
      .get("https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json")
      .then((res) => {
        setDoctors(res.data);
      });
  }, []);

  useEffect(() => {
    let result = [...doctors];

    if (searchTerm.trim()) {
      result = result.filter((doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (consultMode) {
      result = result.filter((doc) => doc.mode === consultMode);
    }

    if (specialties.length > 0) {
      result = result.filter((doc) =>
        specialties.some((spec) => doc.specialties.includes(spec))
      );
    }

    if (sortOption === "fees") {
      result.sort((a, b) => a.fees - b.fees);
    } else if (sortOption === "experience") {
      result.sort((a, b) => b.experience - a.experience);
    }

    setFilteredDoctors(result);
  }, [doctors, searchTerm, consultMode, specialties, sortOption]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.trim() === "") {
      setSuggestions([]);
    } else {
      const topSuggestions = doctors
        .filter((doc) =>
          doc.name.toLowerCase().includes(val.toLowerCase())
        )
        .slice(0, 3);
      setSuggestions(topSuggestions);
    }
  };

  const handleSuggestionClick = (name) => {
    setSearchTerm(name);
    setSuggestions([]);
  };

  const handleModeChange = (e) => {
    const value = e.target.value;
    setConsultMode(value);
    updateParams({ mode: value });
  };

  const handleSpecialtyChange = (e) => {
    const { value, checked } = e.target;
    const newSpecialties = checked
      ? [...specialties, value]
      : specialties.filter((s) => s !== value);
    setSpecialties(newSpecialties);
    updateParams({ specialty: newSpecialties });
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortOption(value);
    updateParams({ sort: value });
  };

  const updateParams = (updates) => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (updates.mode !== undefined) params.mode = updates.mode;
    if (updates.specialty !== undefined) params.specialty = updates.specialty;
    if (updates.sort !== undefined) params.sort = updates.sort;
    setSearchParams(params);
  };

  return (
    <div style={{ display: "flex", padding: "1rem", fontFamily: "Arial" }}>
      <div style={{ width: "250px", marginRight: "2rem" }}>
        <div data-testid="filter-header-moc">
          <h3>Consultation Mode</h3>
          <label>
            <input
              type="radio"
              name="mode"
              value="Video Consult"
              onChange={handleModeChange}
              checked={consultMode === "Video Consult"}
              data-testid="filter-video-consult"
            />
            Video Consult
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="mode"
              value="In Clinic"
              onChange={handleModeChange}
              checked={consultMode === "In Clinic"}
              data-testid="filter-in-clinic"
            />
            In Clinic
          </label>
        </div>

        <div data-testid="filter-header-speciality" style={{ marginTop: "1rem" }}>
          <h3>Specialty</h3>
          {[
            "General Physician",
            "Dentist",
            "Dermatologist",
            "Paediatrician",
            "Gynaecologist",
            "ENT",
            "Diabetologist",
            "Cardiologist",
            "Physiotherapist",
            "Endocrinologist",
            "Orthopaedic",
            "Ophthalmologist",
            "Gastroenterologist",
            "Pulmonologist",
            "Psychiatrist",
            "Urologist",
            "Dietitian/Nutritionist",
            "Psychologist",
            "Sexologist",
            "Nephrologist",
            "Neurologist",
            "Oncologist",
            "Ayurveda",
            "Homeopath",
          ].map((specialty) => (
            <div key={specialty}>
              <label>
                <input
                  type="checkbox"
                  value={specialty}
                  checked={specialties.includes(specialty)}
                  onChange={handleSpecialtyChange}
                  data-testid={`filter-specialty-${specialty.replace(/\//g, "-").replace(/\s/g, "-")}`}
                />
                {specialty}
              </label>
            </div>
          ))}
        </div>

        <div data-testid="filter-header-sort" style={{ marginTop: "1rem" }}>
          <h3>Sort</h3>
          <label>
            <input
              type="radio"
              name="sort"
              value="fees"
              onChange={handleSortChange}
              checked={sortOption === "fees"}
              data-testid="sort-fees"
            />
            Fees (Low to High)
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="sort"
              value="experience"
              onChange={handleSortChange}
              checked={sortOption === "experience"}
              data-testid="sort-experience"
            />
            Experience (High to Low)
          </label>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search doctor by name"
          data-testid="autocomplete-input"
          style={{ padding: "0.5rem", width: "100%", marginBottom: "1rem" }}
        />
        {suggestions.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, marginBottom: "1rem" }}>
            {suggestions.map((doc) => (
              <li
                key={doc.name}
                onClick={() => handleSuggestionClick(doc.name)}
                data-testid="suggestion-item"
                style={{
                  background: "#eee",
                  padding: "0.5rem",
                  cursor: "pointer",
                  marginBottom: "2px",
                }}
              >
                {doc.name}
              </li>
            ))}
          </ul>
        )}

        {filteredDoctors.map((doc, idx) => (
          <div
            key={idx}
            data-testid="doctor-card"
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              marginBottom: "1rem",
              borderRadius: "8px",
            }}
          >
            <h2 data-testid="doctor-name">{doc.name}</h2>
            <p data-testid="doctor-specialty">
              Specialties: {doc.specialties.join(", ")}
            </p>
            <p data-testid="doctor-experience">Experience: {doc.experience} years</p>
            <p data-testid="doctor-fee">Fees: ₹{doc.fees}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
