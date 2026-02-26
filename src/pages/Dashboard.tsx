import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Users, TrendingUp, Activity } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { usePatientStore } from "../store/patientStore";
import { HealthScore } from "../components/dashboards/HealthScore";
import { VitalsCard } from "../components/dashboards/VitalsCard";
import { LifestyleInfo } from "../components/dashboards/LifestyleInfo";
import { PatientList } from "../components/dashboards/PatientList";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useUiStore } from "../store/uiStore";
export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, currentRole, switchRole } = useAuthStore();
  const { patients, selectedPatient, selectPatient } = usePatientStore();
  const [showTestSelection, setShowTestSelection] = useState(false);
  const isMobile = useUiStore((state) => state.isMobile);

  const isClinicMode = currentRole === "clinic";
  const displayUser = isClinicMode && selectedPatient ? selectedPatient : user;
  console.log(isMobile);
  const handleVitalClick = (type: "ecg" | "spo2" | "glucose" | "period") => {
    setShowTestSelection(false);
    // Navigate to health test page with test type parameter
    navigate(`/health-test?test=${type}`);
  };

  const renderPatientDashboard = () => (
    <div className="space-y-6">
      {/* Health Score & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HealthScore />
        </div>
        <Card className="flex flex-col items-center justify-center space-y-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => navigate("/health-test")}
              size="lg"
              className="w-full"
              icon={Plus}
            >
              Take New Reading
            </Button>
          </motion.div>

          {showTestSelection && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-2"
            >
              {[
                "ecg",
                "spo2",
                "glucose",
                ...(displayUser?.gender === "female" ? ["period"] : []),
              ].map((test) => (
                <Button
                  key={test}
                  variant="outline"
                  onClick={() => handleVitalClick(test as any)}
                  className="w-full text-sm"
                >
                  {test.toUpperCase()} Test
                </Button>
              ))}
            </motion.div>
          )}
        </Card>
      </div>

      {/* Vitals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <VitalsCard
          type="ecg"
          value={72}
          unit="bpm"
          timestamp={new Date().toISOString()}
          onClick={() => handleVitalClick("ecg")}
        />
        <VitalsCard
          type="spo2"
          value={98}
          unit="%"
          timestamp={new Date().toISOString()}
          onClick={() => handleVitalClick("spo2")}
        />
        <VitalsCard
          type="glucose"
          value={95}
          unit="mg/dL"
          timestamp={new Date().toISOString()}
          onClick={() => handleVitalClick("glucose")}
        />
        {displayUser?.gender === "female" && (
          <VitalsCard
            type="period"
            unit="days"
            onClick={() => handleVitalClick("period")}
          />
        )}
      </div>

      {/* Lifestyle Summary */}
      <LifestyleInfo user={displayUser} />
    </div>
  );
  const renderClinicDashboard = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                {patients.length}
              </h3>
              <p className="text-gray-600">Total Patients</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">89%</h3>
              <p className="text-gray-600">Avg Health Score</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">24</h3>
              <p className="text-gray-600">Tests Today</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Patient Management */}
      <PatientList
        onSelectPatient={selectPatient}
        selectedPatient={selectedPatient}
      />

      {/* Selected Patient Dashboard */}
      {selectedPatient && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              Patient Dashboard - {selectedPatient.name}
            </h2>
            <Button variant="outline" onClick={() => selectPatient(null)}>
              Close Patient View
            </Button>
          </div>
          {renderPatientDashboard()}
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Role Toggle for 'both' users */}
      {user?.role === "both" && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          {isMobile && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Dashboard Mode
                </h2>
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => switchRole("patient")}
                    className={`
                    px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    ${
                      currentRole === "patient"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600"
                    }
                  `}
                  >
                    Personal
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => switchRole("clinic")}
                    className={`
                    px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    ${
                      currentRole === "clinic"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600"
                    }
                  `}
                  >
                    Clinic
                  </motion.button>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Dashboard Content */}
      <motion.div
        key={currentRole}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isClinicMode ? renderClinicDashboard() : renderPatientDashboard()}
      </motion.div>
    </div>
  );
};
