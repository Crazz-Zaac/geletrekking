// pages/admin/create-trek.jsx
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { UserContext } from "../../context/UserContext";

const CreateTrek = () => {
  const router = useRouter();
  const { user } = useContext(UserContext);

  const [formData, setFormData] = useState({
    name: "",
    overview: "",
    price_gbp: "",
    price_usd: "",
    duration_days: "",
    difficulty: "",
    group_size_min: "",
    group_size_max: "",
    max_altitude_meters: "",
    itinerary_pdf_url: "",
    booking_link: "",
    trek_gallery_id: "",
    trek_map_embed_url: "",
    has_offer: false,
    offer_title: "",
    offer_description: "",
    discounted_price_gbp: "",
    discounted_price_usd: "",
    offer_valid_from: "",
    offer_valid_to: "",
    season_tag: "",
    is_featured: false,
    is_active: true,
  });

  const [message, setMessage] = useState("");

  // Redirect if user is not admin or superadmin
  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      router.replace("/");
    }
  }, [user]);

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return <p>Redirecting...</p>;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/treks", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(res.data.message || "Trek created successfully");

      // Reset form
      setFormData({
        name: "",
        overview: "",
        price_gbp: "",
        price_usd: "",
        duration_days: "",
        difficulty: "",
        group_size_min: "",
        group_size_max: "",
        max_altitude_meters: "",
        itinerary_pdf_url: "",
        booking_link: "",
        trek_gallery_id: "",
        trek_map_embed_url: "",
        has_offer: false,
        offer_title: "",
        offer_description: "",
        discounted_price_gbp: "",
        discounted_price_usd: "",
        offer_valid_from: "",
        offer_valid_to: "",
        season_tag: "",
        is_featured: false,
        is_active: true,
      });
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Error creating trek");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">Create Trek Package</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Overview */}
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-1">Overview</label>
          <textarea
            name="overview"
            value={formData.overview}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>

        {/* Prices & Duration */}
        <div className="flex space-x-4">
          <div>
            <label>Price (GBP)</label>
            <input
              type="number"
              name="price_gbp"
              value={formData.price_gbp}
              onChange={handleChange}
              className="border p-2"
            />
          </div>
          <div>
            <label>Price (USD)</label>
            <input
              type="number"
              name="price_usd"
              value={formData.price_usd}
              onChange={handleChange}
              className="border p-2"
            />
          </div>
        </div>

        <div>
          <label>Duration (days)</label>
          <input
            type="number"
            name="duration_days"
            value={formData.duration_days}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label>Difficulty</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="border p-2 w-full"
          >
            <option value="">Select Difficulty</option>
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
            <option value="extreme">Extreme</option>
          </select>
        </div>

        {/* Offer Section */}
        <div>
          <label>
            <input
              type="checkbox"
              name="has_offer"
              checked={formData.has_offer}
              onChange={handleChange}
              className="mr-2"
            />
            Has Offer
          </label>
        </div>

        {formData.has_offer && (
          <div className="space-y-2 border p-2 rounded">
            <div>
              <label>Offer Title</label>
              <input
                type="text"
                name="offer_title"
                value={formData.offer_title}
                onChange={handleChange}
                className="border p-1 w-full"
              />
            </div>
            <div>
              <label>Offer Description</label>
              <textarea
                name="offer_description"
                value={formData.offer_description}
                onChange={handleChange}
                className="border p-1 w-full"
              />
            </div>
            <div className="flex space-x-4">
              <div>
                <label>Discounted GBP</label>
                <input
                  type="number"
                  name="discounted_price_gbp"
                  value={formData.discounted_price_gbp}
                  onChange={handleChange}
                  className="border p-1"
                />
              </div>
              <div>
                <label>Discounted USD</label>
                <input
                  type="number"
                  name="discounted_price_usd"
                  value={formData.discounted_price_usd}
                  onChange={handleChange}
                  className="border p-1"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <div>
                <label>Offer Valid From</label>
                <input
                  type="date"
                  name="offer_valid_from"
                  value={formData.offer_valid_from}
                  onChange={handleChange}
                  className="border p-1"
                />
              </div>
              <div>
                <label>Offer Valid To</label>
                <input
                  type="date"
                  name="offer_valid_to"
                  value={formData.offer_valid_to}
                  onChange={handleChange}
                  className="border p-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Other options */}
        <div>
          <label>Season Tag</label>
          <input
            type="text"
            name="season_tag"
            value={formData.season_tag}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="mr-2"
            />
            Featured
          </label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="mr-2"
            />
            Active
          </label>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Trek
        </button>
      </form>
    </div>
  );
};

export default CreateTrek;
