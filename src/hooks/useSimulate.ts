// Stub - implemented in Phase 6 (Prompt 12)
export function useSimulate() {
  return {
    runSimulation: async () => {},
    isSimulating: false,
    validationErrors: [] as string[],
    simulationLog: [] as import('../types').SimulationStep[],
  }
}
