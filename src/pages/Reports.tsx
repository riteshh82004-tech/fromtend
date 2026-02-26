import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Filter,
  Download,
  Heart,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useAuthStore } from "../store/authStore";
import { usePatientStore } from "../store/patientStore";
import { useECGStore } from "../store/ecgStore";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Waveform } from "../components/animations/Waveform";
import { useHealthScore } from "../hooks/useHealthScore";
import { generateECGPDF } from "../utils/pdfGenerator";

export const Reports: React.FC = () => {
  const { user, currentRole } = useAuthStore();
  const { patients, selectedPatient, selectPatient } = usePatientStore();
  const { sessions, getPatientSessions } = useECGStore();
  const [timeFilter, setTimeFilter] = useState<
    "week" | "month" | "3months" | "year"
  >("month");
  const [selectedReport, setSelectedReport] = useState<
    "overview" | "vitals" | "lifestyle" | "trends" | "ecg"
  >("overview");
  const healthScore = useHealthScore();

  const isClinicMode = currentRole === "clinic";
  const targetUser = isClinicMode && selectedPatient ? selectedPatient : user;

  // Generate mock data for charts
  const chartData = useMemo(() => {
    const days =
      timeFilter === "week"
        ? 7
        : timeFilter === "month"
          ? 30
          : timeFilter === "3months"
            ? 90
            : 365;
    return Array.from({ length: Math.min(days, 30) }, (_, i) => ({
      date: new Date(
        Date.now() - (days - i) * 24 * 60 * 60 * 1000,
      ).toLocaleDateString(),
      healthScore: 70 + Math.random() * 30,
      ecg: 65 + Math.random() * 20,
      spo2: 95 + Math.random() * 5,
      glucose: 90 + Math.random() * 40,
    }));
  }, [timeFilter]);

  const timeFilters = [
    { key: "week" as const, label: "1 Week" },
    { key: "month" as const, label: "1 Month" },
    { key: "3months" as const, label: "3 Months" },
    { key: "year" as const, label: "1 Year" },
  ];

  const reportTypes = [
    { key: "overview" as const, label: "Overview", icon: BarChart3 },
    { key: "vitals" as const, label: "Vitals", icon: TrendingUp },
    { key: "lifestyle" as const, label: "Lifestyle", icon: Calendar },
    { key: "trends" as const, label: "Trends", icon: TrendingDown },
    { key: "ecg" as const, label: "ECG Sessions", icon: Heart },
  ];

  // Get ECG sessions for current user/patient
  const ecgSessions = useMemo(() => {
    const targetUserId =
      isClinicMode && selectedPatient ? selectedPatient.id : user?.id;
    if (!targetUserId) return [];
    return getPatientSessions(targetUserId);
  }, [sessions, isClinicMode, selectedPatient, user, getPatientSessions]);

  const handleGeneratePDF = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session || !user) return;

    const patientName =
      isClinicMode && selectedPatient ? selectedPatient.name : user.name;

    try {
      await generateECGPDF({
        patientName,
        patientId: user.id,
        session,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const renderClinicPatientSelector = () => {
    if (!isClinicMode) return null;

    return (
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Select Patient
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {patients.map((patient) => (
            <motion.button
              key={patient.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                selectPatient(
                  selectedPatient?.id === patient.id ? null : patient,
                )
              }
              className={`
                p-3 rounded-xl border-2 text-left transition-all duration-200
                ${
                  selectedPatient?.id === patient.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }
              `}
            >
              <div className="font-medium text-gray-800">{patient.name}</div>
              <div className="text-sm text-gray-600">
                Score: {patient.healthScore}
              </div>
            </motion.button>
          ))}
        </div>
      </Card>
    );
  };

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {healthScore?.overall ?? 0}
            </div>
            <div className="text-sm text-gray-600">Current Health Score</div>
            <div className="flex items-center justify-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-xs text-green-600">+5% vs last month</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">72</div>
            <div className="text-sm text-gray-600">Avg Heart Rate</div>
            <div className="flex items-center justify-center mt-2">
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-xs text-red-600">-2% vs last month</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">98</div>
            <div className="text-sm text-gray-600">Avg SpO₂ (%)</div>
            <div className="flex items-center justify-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-xs text-green-600">Normal</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">95</div>
            <div className="text-sm text-gray-600">Avg Glucose</div>
            <div className="flex items-center justify-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-xs text-green-600">Optimal</span>
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Health Score Trend
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="healthScore"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#1d4ed8" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );

  const renderVitalsReport = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Vital Signs Comparison
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Bar dataKey="ecg" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spo2" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="glucose" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Individual Vital Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          {
            key: "ecg",
            label: "ECG/Heart Rate",
            color: "#ef4444",
            unit: "bpm",
          },
          { key: "spo2", label: "SpO₂", color: "#3b82f6", unit: "%" },
          { key: "glucose", label: "Glucose", color: "#10b981", unit: "mg/dL" },
        ].map((vital) => (
          <Card key={vital.key}>
            <h4 className="font-semibold text-gray-800 mb-3">{vital.label}</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey={vital.key}
                    stroke={vital.color}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderECGReport = () => {
    if (ecgSessions.length === 0) {
      return (
        <Card>
          <div className="text-center py-12">
            <Heart size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No ECG Sessions Found
            </h3>
            <p className="text-gray-500">
              Start an ECG test to capture and view your heart rhythm data
            </p>
          </div>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ecgSessions.map((session) => (
            <Card key={session.id} className="overflow-hidden">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">ECG Session</h3>
                    <p className="text-sm text-gray-600">
                      {session.startTime.toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGeneratePDF(session.id)}
                    icon={Download}
                  >
                    PDF
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {session.duration
                        ? `${session.duration.toFixed(1)}s`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Heart Rate:</span>
                    <span className="font-medium">
                      {session.avgHeartRate
                        ? `${session.avgHeartRate} bpm`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Samples:</span>
                    <span className="font-medium">
                      {session.samples.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quality:</span>
                    <span
                      className={`font-medium ${
                        session.signalQuality === "excellent"
                          ? "text-green-600"
                          : session.signalQuality === "good"
                            ? "text-blue-600"
                            : session.signalQuality === "fair"
                              ? "text-yellow-600"
                              : "text-red-600"
                      }`}
                    >
                      {session.signalQuality || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <Waveform
                    animated={false}
                    color="#ef4444"
                    height={100}
                    width={300}
                    showGrid={true}
                    samples={session.samples}
                  />
                </div>

                <div className="text-xs text-gray-500">
                  {session.startTime.toLocaleTimeString()} -{" "}
                  {session.endTime.toLocaleTimeString()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Health Reports</h1>
            <p className="text-gray-600">
              {isClinicMode && selectedPatient
                ? `Viewing reports for ${selectedPatient.name}`
                : "Your comprehensive health analysis"}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Time Filter */}
            <div className="flex items-center bg-gray-100 rounded-2xl p-1">
              {timeFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setTimeFilter(filter.key)}
                  className={`
                    px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200
                    ${
                      timeFilter === filter.key
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600"
                    }
                  `}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clinic Patient Selector */}
        {renderClinicPatientSelector()}

        {targetUser ? (
          <>
            {/* Report Type Selector */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              {reportTypes.map((report) => {
                const Icon = report.icon;
                return (
                  <motion.button
                    key={report.key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedReport(report.key)}
                    className={`
                      flex items-center space-x-2 px-4 py-3 rounded-2xl font-medium transition-all duration-200 whitespace-nowrap
                      ${
                        selectedReport === report.key
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span>{report.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Report Content */}
            <motion.div
              key={selectedReport}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {selectedReport === "overview" && renderOverviewReport()}
              {selectedReport === "vitals" && renderVitalsReport()}
              {selectedReport === "ecg" && renderECGReport()}
              {(selectedReport === "lifestyle" ||
                selectedReport === "trends") && (
                <Card>
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <BarChart3 size={64} className="mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      {selectedReport === "lifestyle"
                        ? "Lifestyle Analysis"
                        : "Trend Analysis"}
                    </h3>
                    <p className="text-gray-500">
                      Coming soon - Advanced {selectedReport} reporting
                    </p>
                  </div>
                </Card>
              )}
            </motion.div>
          </>
        ) : (
          <Card>
            <div className="text-center py-12">
              <Filter size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Select a Patient
              </h3>
              <p className="text-gray-500">
                Choose a patient to view their health reports
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
