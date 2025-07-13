// Re-export the Zustand store from its canonical location.
// This keeps backward-compatibility with modules that import
// `@/store/hospital-store` while the main implementation
// lives in `@/lib/store`.

export { useHospitalStore } from "@/lib/store"
