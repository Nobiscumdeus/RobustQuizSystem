import { useState } from "react";
import axios from "axios";
import ScrollDownIcon from "../../utility/ChasfatAcademy/ScrollDownIcon";


const BulkRegister = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!file) {
      setError("Please select a file.");
      return;
    }

    // Check if the file is CSV or Excel
    const fileExtension = file.name.split(".").pop();
    if (!["csv", "xlsx", "xls"].includes(fileExtension)) {
      setError("Invalid file format. Please upload a CSV or Excel file.");
      return;
    }

    // Convert CSV/Excel to JSON (you can use a library like papaparse for CSV or SheetJS for Excel)
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/bulk-register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess(response.data.message || "Bulk registration successful!");
    } catch (error) {
      setError(error.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto ">
      <h2 className="text-xl font-semibold mt-8 mb-4">Bulk Student Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="p-2 border border-gray-300 rounded"
        />
        <div className="flex justify-center gap-4">
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload Students"}
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
      </form>
      <ScrollDownIcon />
    </div>
  );
};

export default BulkRegister;
