import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ListMedicines = () => {
  const [medicines, setMedicines] = useState([]);

  // Fetch all medicines on component mount
  useEffect(() => {
    axios
      .get("https://blueeye10.pythonanywhere.com/api/pharmacy/medicines/all/")  // Replace with your actual API URL
      .then((response) => {
        setMedicines(response.data);  // Set medicines state from response
      })
      .catch((error) => {
        alert("Error fetching medicines: " + error.response?.data || error.message);
      });
  }, []);

  // Handle delete medicine
  const handleDelete = (id) => {
    const confirmation = window.confirm("Are you sure you want to delete this medicine?");
    
    if (confirmation) {
      axios
        .delete(`https://blueeye10.pythonanywhere.com/api/medicines/${id}/delete/`)  // Replace with your actual API URL
        .then(() => {
          // Remove the deleted medicine from state
          setMedicines(medicines.filter((medicine) => medicine.id !== id));
          alert("Medicine deleted successfully");
        })
        .catch((error) => {
          alert("Error deleting medicine: " + error.response?.data || error.message);
        });
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">All Medicines</h2>
      <div className="space-y-4">
        {medicines.map((medicine) => (
          <div key={medicine.id} className="flex justify-between items-center border-b py-2">
            <div>
              <h3 className="font-semibold">{medicine.medicine_name}</h3>
              <p className="text-gray-600">{medicine.description}</p>
            </div>
            <div>
              {/* Edit Button */}
              <Link
                to={`/pharmacist/medicines/${medicine.id}/update`}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600"
              >
                Edit
              </Link>
              
              {/* Delete Button */}
              <button
                onClick={() => handleDelete(medicine.id)}  // Call the delete handler
                className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 ml-2"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListMedicines;
