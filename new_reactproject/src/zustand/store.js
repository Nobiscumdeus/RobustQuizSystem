import {create} from 'zustand'; // Correct named import

const useTourStore = create((set) => ({
  isTourRunning: false,
  currentStep:0,
  startTour: () => set({ isTourRunning: true,currentStep:0 }),
  stopTour: () => set({ isTourRunning: false,currentStep:0 }),
  setCurrentStep:(step)=>set({currentStep:step}),
}));

export default useTourStore;
