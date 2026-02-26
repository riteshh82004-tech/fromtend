import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Activity,
  Droplet,
  Calendar,
  Play,
  CheckCircle,
  Usb,
  Bluetooth,
  AlertCircle,
  X,
} from "lucide-react";
import { usePatientStore } from "../store/patientStore";
import { useAuthStore } from "../store/authStore";
import { useDeviceStore } from "../store/deviceStore";
import { useECGStore } from "../store/ecgStore";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Waveform } from "../components/animations/Waveform";
import { Pulse } from "../components/animations/Pulse";

export const HealthTest: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testTypeParam = searchParams.get("test") as
    | "ecg"
    | "spo2"
    | "glucose"
    | "period"
    | null;

  const { addReading } = usePatientStore();
  const { user } = useAuthStore();
  const {
    status: deviceStatus,
    mode: deviceMode,
    connectUSB,
    connectBluetooth,
    disconnect,
    startStreaming,
    stopStreaming,
    ecgData,
    clearData,
    error: deviceError,
  } = useDeviceStore();
  const {
    startSession,
    stopSession,
    addSamples,
    isRecording: ecgRecording,
    currentSession,
  } = useECGStore();

  // Initialize step and selectedTest based on URL parameter
  const getInitialStep = ():
    | "selection"
    | "instructions"
    | "connection"
    | "recording"
    | "results" => {
    if (testTypeParam) {
      return testTypeParam === "ecg" ? "instructions" : "instructions";
    }
    return "selection";
  };

  const [step, setStep] = useState<
    "selection" | "instructions" | "connection" | "recording" | "results"
  >(getInitialStep());
  const [selectedTest, setSelectedTest] = useState<
    "ecg" | "spo2" | "glucose" | "period" | null
  >(testTypeParam || null);

  // Update selectedTest when URL parameter changes
  useEffect(() => {
    if (testTypeParam) {
      setSelectedTest(testTypeParam);
      setStep("instructions");
    }
  }, [testTypeParam]);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    value: number;
    status: "normal" | "warning" | "danger";
  } | null>(null);
  const [connectionMode, setConnectionMode] = useState<
    "usb" | "bluetooth" | null
  >(null);

  const tests = [
    {
      id: "ecg" as const,
      name: "ECG Test",
      icon: Heart,
      color: "from-red-400 to-red-600",
      description: "Monitor your heart rhythm",
      duration: "30 seconds",
    },
    {
      id: "spo2" as const,
      name: "SpO₂ Test",
      icon: Activity,
      color: "from-blue-400 to-blue-600",
      description: "Measure blood oxygen levels",
      duration: "15 seconds",
    },
    {
      id: "glucose" as const,
      name: "Glucose Test",
      icon: Droplet,
      color: "from-green-400 to-green-600",
      description: "Check blood sugar levels",
      duration: "5 seconds",
    },
    ...(user?.gender === "female"
      ? [
          {
            id: "period" as const,
            name: "Period Tracker",
            icon: Calendar,
            color: "from-pink-400 to-pink-600",
            description: "Track menstrual cycle",
            duration: "2 minutes",
          },
        ]
      : []),
  ];

  // Handle ECG data streaming
  useEffect(() => {
    if (selectedTest === "ecg" && ecgRecording && ecgData.length > 0) {
      const newSamples = ecgData.slice(-10);
      if (newSamples.length > 0) {
        addSamples(newSamples);
      }
    }
  }, [ecgData, ecgRecording, selectedTest, addSamples]);

  // Handle recording progress for non-ECG tests
  useEffect(() => {
    if (recording && selectedTest !== "ecg") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setRecording(false);
            setStep("results");
            generateResult();
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [recording, selectedTest]);

  // Handle ECG recording with device
  useEffect(() => {
    if (selectedTest === "ecg" && recording && deviceStatus === "connected") {
      const duration = 30;
      const startTime = Date.now();

      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progressPercent = (elapsed / duration) * 100;

        setProgress(Math.min(progressPercent, 100));

        if (elapsed >= duration) {
          handleECGStop();
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [recording, deviceStatus, selectedTest]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (selectedTest === "ecg") {
        stopStreaming();
        if (ecgRecording) {
          stopSession();
        }
        disconnect();
        clearData();
      }
    };
  }, []);

  const handleECGConnection = async (mode: "usb" | "bluetooth") => {
    setConnectionMode(mode);
    try {
      if (mode === "usb") {
        await connectUSB();
      } else {
        await connectBluetooth();
      }

      if (deviceStatus === "connected") {
        if (user) {
          startSession(user.id, 250);
        }
        startStreaming();
        setStep("recording");
        setRecording(true);
      }
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  const handleECGStop = () => {
    setRecording(false);
    stopStreaming();
    stopSession();
    disconnect();

    if (currentSession && currentSession.samples.length > 0) {
      const heartRate =
        currentSession.avgHeartRate ||
        calculateHeartRateFromSamples(currentSession.samples);
      const status =
        heartRate >= 60 && heartRate <= 100
          ? "normal"
          : heartRate > 100
          ? "warning"
          : "danger";
      setResult({ value: heartRate, status });

      if (user) {
        addReading({
          id: currentSession.id,
          patientId: user.id,
          type: "ecg",
          value: heartRate,
          unit: "bpm",
          timestamp: currentSession.startTime.toISOString(),
          notes: `ECG session - ${
            currentSession.samples.length
          } samples, Quality: ${currentSession.signalQuality || "good"}`,
        });
      }
    }

    setStep("results");
  };

  const calculateHeartRateFromSamples = (samples: number[]): number => {
    if (samples.length < 100) return 0;
    const threshold = 600;
    const peaks: number[] = [];
    let lastPeakIndex = -100;

    for (let i = 1; i < samples.length - 1; i++) {
      if (
        samples[i] > threshold &&
        samples[i] > samples[i - 1] &&
        samples[i] > samples[i + 1] &&
        i - lastPeakIndex > 20
      ) {
        peaks.push(i);
        lastPeakIndex = i;
      }
    }

    if (peaks.length < 2) return 72;

    const intervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i - 1]);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    return Math.round((60 * 250) / avgInterval);
  };

  const generateResult = () => {
    if (!selectedTest) return;

    let value: number;
    let status: "normal" | "warning" | "danger";

    switch (selectedTest) {
      case "ecg":
        value = 60 + Math.random() * 40;
        status =
          value >= 60 && value <= 100
            ? "normal"
            : value > 100
            ? "warning"
            : "danger";
        break;
      case "spo2":
        value = 95 + Math.random() * 5;
        status = value >= 95 ? "normal" : value >= 90 ? "warning" : "danger";
        break;
      case "glucose":
        value = 80 + Math.random() * 40;
        status = value >= 80 && value <= 120 ? "normal" : "warning";
        break;
      case "period":
        value = Math.floor(Math.random() * 35) + 1;
        status = "normal";
        break;
      default:
        value = 0;
        status = "normal";
    }

    setResult({ value: Math.round(value), status });

    if (user) {
      addReading({
        id: Date.now().toString(),
        patientId: user.id,
        type: selectedTest,
        value: Math.round(value),
        unit: getUnit(selectedTest),
        timestamp: new Date().toISOString(),
        notes: `${selectedTest.toUpperCase()} test completed via mobile app`,
      });
    }
  };

  const getUnit = (test: string): string => {
    switch (test) {
      case "ecg":
        return "bpm";
      case "spo2":
        return "%";
      case "glucose":
        return "mg/dL";
      case "period":
        return "days";
      default:
        return "";
    }
  };

  const renderTestSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Select Test Type
        </h2>
        <p className="text-gray-600">
          Choose which health metric you'd like to measure
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tests.map((test) => {
          const Icon = test.icon;
          return (
            <motion.button
              key={test.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedTest(test.id);
                setStep("instructions");
              }}
              className={`p-6 rounded-3xl bg-white border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 ${
                test.id === "ecg" ? "ring-2 ring-red-500 ring-offset-2" : ""
              }`}
            >
              <div
                className={`w-16 h-16 bg-gradient-to-r ${test.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
              >
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{test.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{test.description}</p>
              <div className="text-xs text-blue-600 font-medium">
                {test.duration}
              </div>
              {test.id === "ecg" && (
                <div className="mt-2 text-xs text-red-600 font-semibold">
                  ★ Featured
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  const renderInstructions = () => {
    const test = tests.find((t) => t.id === selectedTest);
    if (!test) return null;

    const instructions = {
      ecg: [
        "Clean your hands and the electrode placement areas",
        "Attach electrodes to your wrists and ankles",
        "Remain still and avoid talking during the test",
        "Breathe normally and relax",
      ],
      spo2: [
        "Remove nail polish from your index finger",
        "Ensure your hands are warm and relaxed",
        "Place finger fully in the pulse oximeter",
        "Keep your hand still during measurement",
      ],
      glucose: [
        "Wash your hands with soap and warm water",
        "Insert test strip into glucose meter",
        "Use lancet to prick your fingertip",
        "Apply blood drop to test strip",
      ],
      period: [
        "Enter your last period start date",
        "Mark any symptoms you experienced",
        "Note flow intensity and duration",
        "Track mood and physical changes",
      ],
    };

    const Icon = test.icon;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div
            className={`w-20 h-20 bg-gradient-to-r ${test.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
          >
            <Icon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {test.name} Instructions
          </h2>
          <p className="text-gray-600">
            Follow these steps for accurate results
          </p>
        </div>

        <Card>
          <div className="space-y-4">
            {instructions[selectedTest!]?.map((instruction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <p className="text-gray-700 flex-1 pt-1">{instruction}</p>
              </motion.div>
            ))}
          </div>
        </Card>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setStep("selection")}
            className="flex-1"
            icon={ArrowLeft}
          >
            Back
          </Button>
          <Button
            onClick={() => {
              if (selectedTest === "ecg") {
                setStep("connection");
              } else {
                setStep("recording");
              }
            }}
            className="flex-1"
            icon={Play}
          >
            Start Test
          </Button>
        </div>
      </div>
    );
  };

  const renderConnection = () => {
    if (selectedTest !== "ecg") return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Connect ECG Device
          </h2>
          <p className="text-gray-600">Choose your connection method</p>
        </div>

        {deviceError && (
          <Card className="bg-red-50 border-red-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">
                  Connection Error
                </p>
                <p className="text-sm text-red-600">{deviceError}</p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleECGConnection("usb")}
            disabled={deviceStatus === "connecting"}
            className="p-8 rounded-3xl bg-white border-2 border-gray-200 hover:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Usb className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-semibold text-gray-800">
                  USB Connection
                </h3>
                <p className="text-sm text-gray-600">
                  Connect via USB cable (Recommended)
                </p>
              </div>
              {deviceStatus === "connecting" && deviceMode === "usb" && (
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleECGConnection("bluetooth")}
            disabled={deviceStatus === "connecting"}
            className="p-8 rounded-3xl bg-white border-2 border-gray-200 hover:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Bluetooth className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-semibold text-gray-800">
                  Bluetooth Connection
                </h3>
                <p className="text-sm text-gray-600">
                  Connect wirelessly via Bluetooth
                </p>
              </div>
              {deviceStatus === "connecting" && deviceMode === "bluetooth" && (
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </motion.button>
        </div>

        <Button
          variant="outline"
          onClick={() => setStep("instructions")}
          className="w-full"
          icon={ArrowLeft}
        >
          Back
        </Button>
      </div>
    );
  };

  const renderRecording = () => {
    const test = tests.find((t) => t.id === selectedTest);
    if (!test) return null;

    const Icon = test.icon;

    return (
      <div className="space-y-8 text-center">
        <div>
          <div
            className={`w-24 h-24 bg-gradient-to-r ${test.color} rounded-3xl flex items-center justify-center mx-auto mb-4`}
          >
            <Icon className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Recording {test.name}
          </h2>
          <p className="text-gray-600">
            Please remain still and follow the instructions
          </p>
          {selectedTest === "ecg" && deviceStatus === "connected" && (
            <p className="text-sm text-green-600 mt-2">
              Device connected via {deviceMode?.toUpperCase()}
            </p>
          )}
        </div>

        {/* Animated Visual */}
        <div className="flex justify-center">
          {selectedTest === "ecg" && (
            <div className="w-full max-w-4xl">
              <Waveform
                animated
                color="#ef4444"
                height={300}
                width={800}
                showGrid={true}
              />
              {currentSession && (
                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  <div>Samples: {currentSession.samples.length}</div>
                  {currentSession.avgHeartRate && (
                    <div>Heart Rate: {currentSession.avgHeartRate} bpm</div>
                  )}
                </div>
              )}
            </div>
          )}
          {selectedTest === "spo2" && (
            <Pulse color="#3b82f6" value={Math.round(95 + progress / 20)} />
          )}
          {selectedTest === "glucose" && (
            <div className="relative w-20 h-32 bg-white rounded-full border-4 border-green-500">
              <motion.div
                className="absolute bottom-0 left-0 right-0 rounded-full bg-green-500"
                initial={{ height: 0 }}
                animate={{ height: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
          {selectedTest === "period" && (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-6 h-6 rounded-full bg-pink-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: i < progress / 3 ? 1 : 0.3 }}
                  transition={{ delay: i * 0.05 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <motion.div
              className="h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xl font-semibold text-gray-700">
            {Math.round(progress)}% Complete
          </p>
        </div>

        {selectedTest === "ecg" && recording && (
          <Button
            onClick={handleECGStop}
            size="lg"
            className="w-full"
            variant="outline"
          >
            Stop Recording
          </Button>
        )}

        {!recording && progress === 0 && selectedTest !== "ecg" && (
          <Button
            onClick={() => setRecording(true)}
            size="lg"
            className="w-full"
          >
            Start Recording
          </Button>
        )}
      </div>
    );
  };

  const renderResults = () => {
    const test = tests.find((t) => t.id === selectedTest);
    if (!test || !result) return null;

    const Icon = test.icon;
    const statusColors = {
      normal: "text-green-600",
      warning: "text-yellow-600",
      danger: "text-red-600",
    };

    const statusLabels = {
      normal: "Normal",
      warning: "Attention Needed",
      danger: "Consult Doctor",
    };

    return (
      <div className="space-y-8 text-center">
        <div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-8 h-8" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Test Complete
          </h2>
          <p className="text-gray-600">
            Your {test.name.toLowerCase()} results are ready
          </p>
        </div>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-0">
          <div className="text-center space-y-4">
            <div
              className={`w-20 h-20 bg-gradient-to-r ${test.color} rounded-2xl flex items-center justify-center mx-auto`}
            >
              <Icon className="w-10 h-10 text-white" />
            </div>

            <div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.5 }}
                className="text-5xl font-bold text-gray-800 mb-2"
              >
                {result.value}{" "}
                <span className="text-2xl font-normal text-gray-600">
                  {getUnit(selectedTest!)}
                </span>
              </motion.div>
              <div
                className={`text-xl font-semibold ${
                  statusColors[result.status]
                } mb-4`}
              >
                {statusLabels[result.status]}
              </div>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <div>Recorded: {new Date().toLocaleString()}</div>
              <div>Test Duration: {test.duration}</div>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <Button
            onClick={() => navigate("/dashboard")}
            size="lg"
            className="w-full"
          >
            View in Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setStep("selection");
              setSelectedTest(null);
              setResult(null);
              setProgress(0);
            }}
            className="w-full"
          >
            Take Another Test
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            icon={ArrowLeft}
          >
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Health Tests</h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>

        {/* Main Content */}
        <Card className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === "selection" && renderTestSelection()}
              {step === "instructions" && renderInstructions()}
              {step === "connection" && renderConnection()}
              {step === "recording" && renderRecording()}
              {step === "results" && renderResults()}
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
};
