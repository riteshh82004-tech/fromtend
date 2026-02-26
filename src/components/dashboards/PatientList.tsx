import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, User, Calendar, Phone } from "lucide-react";
import { usePatientStore } from "../../store/patientStore";
import type { Patient } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";

interface PatientListProps {
  onSelectPatient: (patient: Patient | null) => void;
  selectedPatient: Patient | null;
}

export const PatientList: React.FC<PatientListProps> = ({
  onSelectPatient,
  selectedPatient,
}) => {
  const { patients, addPatient } = usePatientStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    gender: "male" as "male" | "female" | "other",
  });

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
  );

  const handleAddPatient = () => {
    const patient: Patient = {
      id: Date.now().toString(),
      ...newPatient,
      medicalHistory: [],
      lifestyle: {
        smoking: false,
        drinking: false,
        exercise: "moderate",
        sleep: 8,
      },
      healthScore: 75,
      lastTestDate: new Date().toISOString(),
      role: "patient",
    };
    addPatient(patient);
    setNewPatient({ name: "", phone: "", dateOfBirth: "", gender: "male" });
    setShowAddForm(false);
  };

  return (
    <Card>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Patient Management
          </h3>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            icon={Plus}
            size="sm"
          >
            Add Patient
          </Button>
        </div>

        {/* Search */}
        <Input
          placeholder="Search patients..."
          value={searchTerm}
          onChange={setSearchTerm}
          icon={Search}
        />

        {/* Add Patient Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="border border-gray-200 rounded-2xl p-4 bg-gray-50"
          >
            <h4 className="font-semibold text-gray-800 mb-3">
              Add New Patient
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Full Name"
                value={newPatient.name}
                onChange={(value) =>
                  setNewPatient({ ...newPatient, name: value })
                }
              />
              <Input
                placeholder="Phone Number"
                value={newPatient.phone}
                onChange={(value) =>
                  setNewPatient({ ...newPatient, phone: value })
                }
              />
              <Input
                type="date"
                value={newPatient.dateOfBirth}
                onChange={(value) =>
                  setNewPatient({ ...newPatient, dateOfBirth: value })
                }
              />
              <select
                value={newPatient.gender}
                onChange={(e) =>
                  setNewPatient({
                    ...newPatient,
                    gender: e.target.value as any,
                  })
                }
                className="px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex space-x-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPatient}
                size="sm"
                disabled={!newPatient.name || !newPatient.phone}
              >
                Add Patient
              </Button>
            </div>
          </motion.div>
        )}

        {/* Patient List */}
        {filteredPatients.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredPatients.map((patient) => (
              <motion.div
                key={patient.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  onSelectPatient(
                    selectedPatient?.id === patient.id ? null : patient
                  )
                }
                className={`
                  p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                  ${
                    selectedPatient?.id === patient.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {patient.name}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{patient.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date().getFullYear() -
                              new Date(patient.dateOfBirth).getFullYear()}{" "}
                            years
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {patient.healthScore}
                    </div>
                    <div className="text-xs text-gray-500">Health Score</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? "No patients found" : "No patients added yet"}
          </div>
        )}
      </div>
    </Card>
  );
};
