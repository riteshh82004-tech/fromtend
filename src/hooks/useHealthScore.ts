import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { usePatientStore } from '../store/patientStore';
import { calculateHealthScore } from '../utils/healthScore';

export const useHealthScore = () => {
  const { user, currentRole } = useAuthStore();
  const { selectedPatient, getPatientReadings } = usePatientStore();

  return useMemo(() => {
    if (!user) return null;

    const targetUser = currentRole === 'clinic' && selectedPatient ? selectedPatient : user;
    const readings = currentRole === 'clinic' && selectedPatient 
      ? getPatientReadings(selectedPatient.id)
      : getPatientReadings(user.id);

    return calculateHealthScore(targetUser, readings);
  }, [user, currentRole, selectedPatient, getPatientReadings]);
};