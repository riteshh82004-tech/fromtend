import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Bluetooth, Bell, Shield, Download, Trash2,
  HelpCircle, LogOut, Settings as SettingsIcon, Usb, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useDeviceStore } from '../store/deviceStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Settings: React.FC = () => {
  const { user, updateUser, logout } = useAuthStore();
  const {
    status: deviceStatus,
    mode: deviceMode,
    connectUSB,
    connectBluetooth,
    disconnect,
    error: deviceError,
  } = useDeviceStore();
  const [activeSection, setActiveSection] = useState<'profile' | 'devices' | 'notifications' | 'privacy' | 'support'>('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [notifications, setNotifications] = useState({
    testReminders: true,
    healthAlerts: true,
    deviceConnection: false,
    weeklyReports: true
  });

  const sections = [
    { key: 'profile' as const, label: 'Profile', icon: User },
    { key: 'devices' as const, label: 'Devices', icon: Bluetooth },
    { key: 'notifications' as const, label: 'Notifications', icon: Bell },
    { key: 'privacy' as const, label: 'Privacy', icon: Shield },
    { key: 'support' as const, label: 'Support', icon: HelpCircle }
  ];

  const handleSaveProfile = () => {
    if (user) {
      updateUser(profileData);
    }
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <Button variant="outline" size="sm">Change Avatar</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={profileData.name}
              onChange={(value) => setProfileData({ ...profileData, name: value })}
            />
            <Input
              label="Email"
              type="email"
              value={profileData.email}
              onChange={(value) => setProfileData({ ...profileData, email: value })}
            />
            <Input
              label="Phone Number"
              type="tel"
              value={profileData.phone}
              onChange={(value) => setProfileData({ ...profileData, phone: value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <div className="px-4 py-3 bg-gray-50 rounded-2xl text-gray-600">
                {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not set'}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button onClick={handleSaveProfile}>Save Changes</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </div>
      </Card>

      {user?.lifestyle && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Lifestyle Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Exercise Level</div>
              <div className="font-semibold text-gray-800 capitalize">{user.lifestyle.exercise}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Sleep Hours</div>
              <div className="font-semibold text-gray-800">{user.lifestyle.sleep}h</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Smoking</div>
              <div className={`font-semibold ${user.lifestyle.smoking ? 'text-red-600' : 'text-green-600'}`}>
                {user.lifestyle.smoking ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Drinking</div>
              <div className={`font-semibold ${user.lifestyle.drinking ? 'text-yellow-600' : 'text-green-600'}`}>
                {user.lifestyle.drinking ? 'Regular' : 'No'}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="mt-4">
            Update Lifestyle
          </Button>
        </Card>
      )}
    </div>
  );

  const renderDevicesSection = () => (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">ECG Device</h3>
          <div className="text-sm text-gray-600">
            Status: <span className="font-medium text-gray-800">{deviceStatus}</span>
            {deviceMode ? <span className="ml-2 text-gray-500">({deviceMode.toUpperCase()})</span> : null}
          </div>
        </div>

        {deviceError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-red-800">Connection error</div>
                <div className="text-sm text-red-700">{deviceError}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            icon={Usb}
            disabled={deviceStatus === 'connecting' || deviceStatus === 'connected'}
            onClick={() => {
              void connectUSB();
            }}
          >
            Connect via USB
          </Button>
          <Button
            variant="outline"
            icon={Bluetooth}
            disabled={deviceStatus === 'connecting' || deviceStatus === 'connected'}
            onClick={() => {
              void connectBluetooth();
            }}
          >
            Connect via Bluetooth
          </Button>
          <Button
            className="md:col-span-2"
            variant="danger"
            disabled={deviceStatus !== 'connected'}
            onClick={disconnect}
          >
            Disconnect
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Troubleshooting</h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <HelpCircle className="w-5 h-5 mr-2" />
            Device Connection Issues
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <SettingsIcon className="w-5 h-5 mr-2" />
            Reset Device Settings
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Download className="w-5 h-5 mr-2" />
            Update Device Firmware
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderNotificationsSection = () => (
    <Card>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h3>
      <div className="space-y-4">
        {Object.entries(notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
            <div>
              <div className="font-medium text-gray-800 capitalize">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </div>
              <div className="text-sm text-gray-600">
                {key === 'testReminders' && 'Get reminded to take regular health tests'}
                {key === 'healthAlerts' && 'Receive alerts for abnormal readings'}
                {key === 'deviceConnection' && 'Notifications when devices connect/disconnect'}
                {key === 'weeklyReports' && 'Weekly health summary reports'}
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setNotifications({ ...notifications, [key]: !value })}
              className={`
                relative w-12 h-6 rounded-full transition-all duration-200
                ${value ? 'bg-blue-600' : 'bg-gray-300'}
              `}
            >
              <motion.div
                animate={{ x: value ? 24 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full"
              />
            </motion.button>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderPrivacySection = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Data & Privacy</h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" icon={Download}>
            Export My Data
          </Button>
          <Button variant="outline" className="w-full justify-start" icon={Shield}>
            Privacy Policy
          </Button>
          <Button variant="danger" className="w-full justify-start" icon={Trash2}>
            Delete All Data
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Security</h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Two-Factor Authentication
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Active Sessions
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderSupportSection = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Get Help</h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" icon={HelpCircle}>
            Help Center
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Contact Support
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Live Chat
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Video Call Support
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">About</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Version</span>
            <span>2.1.0</span>
          </div>
          <div className="flex justify-between">
            <span>Build</span>
            <span>2024.01.15</span>
          </div>
          <div className="flex justify-between">
            <span>Platform</span>
            <span>Web</span>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-4">
          Check for Updates
        </Button>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Settings</h2>
            <div className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <motion.button
                    key={section.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveSection(section.key)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 text-left
                      ${activeSection === section.key
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-50 text-gray-700'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span>{section.label}</span>
                  </motion.button>
                );
              })}

              <hr className="my-4 border-gray-200" />
              
              <Button
                variant="danger"
                className="w-full justify-start"
                onClick={logout}
                icon={LogOut}
              >
                Sign Out
              </Button>
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeSection === 'profile' && renderProfileSection()}
            {activeSection === 'devices' && renderDevicesSection()}
            {activeSection === 'notifications' && renderNotificationsSection()}
            {activeSection === 'privacy' && renderPrivacySection()}
            {activeSection === 'support' && renderSupportSection()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};