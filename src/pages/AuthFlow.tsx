import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, User, Calendar, Users, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import LoginSignupPage from "./LoginSignUp";

export const AuthFlow: React.FC = () => {
  const { login, token, user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Determine initial step based on authentication status
  const getInitialStep = ():
    | "welcome"
    | "register"
    | "role-select"
    | "login" => {
    if (isAuthenticated && user) {
      // If user is authenticated but profile is incomplete, show register step
      if (!user.phone || !user.dateOfBirth) {
        return "register";
      }
      // If profile is complete, they shouldn't be here
      return "register";
    }
    return "welcome";
  };

  const [step, setStep] = useState<
    "welcome" | "register" | "role-select" | "login"
  >(getInitialStep());
  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    email: "",
    dateOfBirth: "",
    gender: "male" as "male" | "female" | "other",
    medicalHistory: [] as string[],
    lifestyle: {
      smoking: false,
      drinking: false,
      exercise: "moderate" as "low" | "moderate" | "high",
      sleep: 8,
    },
  });
  const [selectedRole, setSelectedRole] = useState<
    "patient" | "clinic" | "both"
  >("patient");

  // Pre-populate form data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "male",
        medicalHistory: user.medicalHistory || [],
        lifestyle: user.lifestyle || {
          smoking: false,
          drinking: false,
          exercise: "moderate",
          sleep: 8,
        },
      }));
      if (user.role) {
        setSelectedRole(user.role);
      }
    }
  }, [isAuthenticated, user]);

  // Handle successful login/registration from LoginSignupPage
  const handleLoginSuccess = (user: any, authToken: string) => {
    // Pre-populate the register form with user data
    setFormData((prev) => ({
      ...prev,
      name: user.name || "",
      email: user.email || "",
    }));

    // Navigate to register step to complete profile
    setStep("register");
  };

  const handleRegister = async () => {
    if (!token) {
      alert("Authentication token not found. Please login again.");
      setStep("login");
      return;
    }

    try {
      // Send complete profile data to backend
      const response = await fetch(
        "http://localhost:5000/auth/complete-profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            medicalHistory: formData.medicalHistory,
            lifestyle: formData.lifestyle,
            role: selectedRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Profile completion failed");
      }

      // Update the auth store with complete user data
      login(
        {
          id: data.user.id || data.user._id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          dateOfBirth: data.user.dateOfBirth,
          gender: data.user.gender,
          role: data.user.role,
          medicalHistory: data.user.medicalHistory,
          lifestyle: data.user.lifestyle,
        },
        token
      );

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      alert(error.message || "Failed to complete profile");
      console.error(error);
    }
  };

  const roles = [
    {
      id: "patient" as const,
      title: "Patient",
      description: "Monitor your own health data",
      icon: User,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "clinic" as const,
      title: "Clinic",
      description: "Manage multiple patients",
      icon: Users,
      color: "from-green-500 to-green-600",
    },
    {
      id: "both" as const,
      title: "Both",
      description: "Personal + clinic management",
      icon: Activity,
      color: "from-purple-500 to-purple-600",
    },
  ];

  // If user is not authenticated and tries to access complete-profile, redirect to login
  useEffect(() => {
    if (!isAuthenticated && step === "register") {
      navigate("/login");
    }
  }, [isAuthenticated, step, navigate]);

  // Render login/signup page
  if (step === "login") {
    return (
      <LoginSignupPage
        onBack={() => setStep("welcome")}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8 text-center"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl flex items-center justify-center mx-auto"
            >
              <span className="text-3xl font-bold text-white">H</span>
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome to BioMatrix
            </h1>
            <p className="text-gray-600">
              Monitor your health with advanced technology
            </p>
          </div>

          <Card>
            <div className="space-y-4">
              <Button
                onClick={() => setStep("login")}
                className="w-full"
                size="lg"
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStep("login")}
              >
                I already have an account
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (step === "register") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md w-full"
        >
          <Card>
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  Complete Your Profile
                </h2>
                <p className="text-gray-600 mt-2">
                  Tell us more about yourself
                </p>
              </div>

              <div className="space-y-4">

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(value) =>
                    setFormData({ ...formData, phone: value })
                  }
                  icon={Phone}
                  required
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(value) =>
                    setFormData({ ...formData, dateOfBirth: value })
                  }
                  icon={Calendar}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-3">
                    {["male", "female", "other"].map((gender) => (
                      <button
                        key={gender}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, gender: gender as any })
                        }
                        className={`
                          px-4 py-2 rounded-xl font-medium transition-all duration-200 capitalize
                          ${
                            formData.gender === gender
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }
                        `}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exercise Level
                    </label>
                    <select
                      value={formData.lifestyle.exercise}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lifestyle: {
                            ...formData.lifestyle,
                            exercise: e.target.value as any,
                          },
                        })
                      }
                      className="w-full px-4 py-3 rounded-2xl border text-black border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sleep Hours
                    </label>
                    <input
                      type="number"
                      min="4"
                      max="12"
                      value={formData.lifestyle.sleep}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lifestyle: {
                            ...formData.lifestyle,
                            sleep: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-3 rounded-2xl border text-black border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Lifestyle Factors
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.lifestyle.smoking}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lifestyle: {
                              ...formData.lifestyle,
                              smoking: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        I smoke
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.lifestyle.drinking}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lifestyle: {
                              ...formData.lifestyle,
                              drinking: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        I drink alcohol regularly
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("welcome")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep("role-select")}
                  className="flex-1"
                  disabled={!formData.phone || !formData.dateOfBirth}
                >
                  Continue
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-lg w-full"
      >
        <Card>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Choose Your Role
              </h2>
              <p className="text-gray-600 mt-2">
                How will you be using BioMatrix?
              </p>
            </div>

            <div className="space-y-4">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;

                return (
                  <motion.button
                    key={role.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRole(role.id)}
                    className={`
                      w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left
                      ${
                        isSelected
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }
                    `}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`
                        w-12 h-12 rounded-xl bg-gradient-to-r ${role.color} flex items-center justify-center
                      `}
                      >
                        <Icon size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {role.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {role.description}
                        </p>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
                        >
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setStep("register")}
                className="flex-1"
              >
                Back
              </Button>
              <Button onClick={handleRegister} className="flex-1">
                Complete Setup
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
