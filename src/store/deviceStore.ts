import { create } from 'zustand';
import type { ECGDataPoint } from '../types';

type USBSerialPort = {
  readable?: ReadableStream<Uint8Array>;
  open: (options: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
};

type BluetoothECGCharacteristic = EventTarget & {
  value?: DataView | null;
  startNotifications: () => Promise<void>;
  stopNotifications: () => Promise<void>;
  service?: {
    device?: {
      gatt?: {
        disconnect: () => void;
      };
    };
  };
};

interface DeviceState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  mode: 'usb' | 'bluetooth' | null;
  port: USBSerialPort | BluetoothECGCharacteristic | null;
  reader: ReadableStreamDefaultReader<Uint8Array> | null;
  ecgData: number[];
  ecgBuffer: ECGDataPoint[];
  isStreaming: boolean;
  error: string | null;
  connectUSB: () => Promise<void>;
  connectBluetooth: () => Promise<void>;
  disconnect: () => void;
  startStreaming: () => void;
  stopStreaming: () => void;
  clearData: () => void;
}

const ECG_BUFFER_SIZE = 1000;

export const useDeviceStore = create<DeviceState>((set, get) => {
  let dataInterval: number | null = null;

  const processData = (data: string) => {
    const lines = data.split('\n').filter(line => line.trim());
    const newSamples: number[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        const value = parseInt(trimmed, 10);
        if (!isNaN(value) && value >= 0 && value <= 1024) {
          newSamples.push(value);
        }
      }
    }

    if (newSamples.length > 0) {
      set((state) => {
        const updatedData = [...state.ecgData, ...newSamples];
        const trimmedData = updatedData.slice(-ECG_BUFFER_SIZE);
        
        const newBuffer: ECGDataPoint[] = newSamples.map((value, idx) => ({
          value,
          timestamp: Date.now() + idx
        }));

        return {
          ecgData: trimmedData,
          ecgBuffer: [...state.ecgBuffer.slice(-(ECG_BUFFER_SIZE - newSamples.length)), ...newBuffer]
        };
      });
    }
  };

  const readUSBData = async (port: USBSerialPort, reader: ReadableStreamDefaultReader<Uint8Array>) => {
    try {
      while (get().isStreaming && port.readable) {
        const { value, done } = await reader.read();
        if (done) break;

        const decoder = new TextDecoder();
        const text = decoder.decode(value);
        processData(text);
      }
    } catch (error) {
      console.error('Error reading USB data:', error);
      set({ status: 'error', error: 'Failed to read data from device' });
    }
  };

  const handleBluetoothNotification = (event: Event) => {
    const target = event.target as BluetoothECGCharacteristic;
    if (target.value) {
      const decoder = new TextDecoder();
      const text = decoder.decode(target.value);
      processData(text);
    }
  };

  return {
    status: 'disconnected',
    mode: null,
    port: null,
    reader: null,
    ecgData: [],
    ecgBuffer: [],
    isStreaming: false,
    error: null,

    connectUSB: async () => {
      try {
        set({ status: 'connecting', error: null });

        // Check browser support
        if (!('serial' in navigator)) {
          throw new Error('Web Serial API is not supported in this browser. Please use Chrome or Edge.');
        }

        // Request port access
        const port = (await (navigator as any).serial.requestPort()) as USBSerialPort;
        
        // Configure port
        await port.open({ baudRate: 9600 });

        // Create reader
        const reader = port.readable?.getReader();
        if (!reader) {
          throw new Error('Failed to create reader');
        }

        set({ 
          status: 'connected', 
          mode: 'usb', 
          port, 
          reader 
        });

        // Start reading data
        get().startStreaming();
      } catch (error: any) {
        console.error('USB connection error:', error);
        set({ 
          status: 'error', 
          error: error.message || 'Failed to connect via USB' 
        });
      }
    },

    connectBluetooth: async () => {
      try {
        set({ status: 'connecting', error: null });

        // Check browser support
        if (!('bluetooth' in navigator)) {
          throw new Error('Web Bluetooth API is not supported in this browser. Please use Chrome or Edge.');
        }

        // Request Bluetooth device
        const device = await (navigator as any).bluetooth.requestDevice({
          filters: [
            { services: ['heart_rate'] },
            { namePrefix: 'ECG' },
            { namePrefix: 'Arduino' }
          ],
          optionalServices: ['battery_service']
        });

        // Connect to GATT server
        const server = await device.gatt.connect();
        
        // Get primary service (using heart_rate as example, adjust for your device)
        const service = await server.getPrimaryService('heart_rate');
        
        // Get characteristic for ECG data
        const characteristic = await service.getCharacteristic('heart_rate_measurement');
        
        // Start notifications
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleBluetoothNotification);

        set({ 
          status: 'connected', 
          mode: 'bluetooth', 
          port: characteristic as BluetoothECGCharacteristic
        });

        // Start streaming
        get().startStreaming();
      } catch (error: any) {
        console.error('Bluetooth connection error:', error);
        if (error.name === 'NotFoundError') {
          set({ 
            status: 'error', 
            error: 'No Bluetooth device found. Make sure your device is paired and discoverable.' 
          });
        } else if (error.name === 'SecurityError') {
          set({ 
            status: 'error', 
            error: 'Bluetooth permission denied. Please allow access in your browser settings.' 
          });
        } else {
          set({ 
            status: 'error', 
            error: error.message || 'Failed to connect via Bluetooth' 
          });
        }
      }
    },

    disconnect: () => {
      const state = get();
      
      // Stop streaming
      get().stopStreaming();

      // Close USB connection
      if (state.mode === 'usb' && state.port) {
        const port = state.port as USBSerialPort;
        if (state.reader) {
          state.reader.cancel().catch(console.error);
        }
        port.close().catch(console.error);
      }

      // Close Bluetooth connection
      if (state.mode === 'bluetooth' && state.port) {
        const characteristic = state.port as BluetoothECGCharacteristic;
        characteristic.stopNotifications().catch(console.error);
        characteristic.service?.device?.gatt?.disconnect();
      }

      set({
        status: 'disconnected',
        mode: null,
        port: null,
        reader: null,
        error: null
      });
    },

    startStreaming: () => {
      const state = get();
      
      if (state.status !== 'connected' || state.isStreaming) {
        return;
      }

      set({ isStreaming: true });

      if (state.mode === 'usb' && state.port && state.reader) {
        readUSBData(state.port as USBSerialPort, state.reader);
      }
      // Bluetooth streaming is handled via event listeners
    },

    stopStreaming: () => {
      set({ isStreaming: false });
      
      if (dataInterval) {
        clearInterval(dataInterval);
        dataInterval = null;
      }
    },

    clearData: () => {
      set({ ecgData: [], ecgBuffer: [] });
    }
  };
});
