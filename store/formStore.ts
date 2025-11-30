import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BasicInfo, FindingRow, Settings, CurrentFinding, OtherSection } from '@/types/form';

interface FormStore {
  // 基本情報
  basicInfo: BasicInfo;
  setBasicInfo: (info: Partial<BasicInfo>) => void;
  
  // 所見リスト
  findings: FindingRow[];
  addFinding: (finding: Omit<FindingRow, 'id'>) => void;
  removeFinding: (id: string) => void;
  clearFindings: () => void;
  
  // 現在入力中の所見
  currentFinding: CurrentFinding;
  setCurrentFinding: (finding: Partial<CurrentFinding>) => void;
  resetCurrentFinding: () => void;
  
  // その他セクション
  otherSection: OtherSection;
  setOtherSection: (section: Partial<OtherSection>) => void;
  resetOtherSection: () => void;
  
  // 設定
  settings: Settings;
  setSettings: (settings: Partial<Settings>) => void;
  
  // 自動保存
  autoSave: boolean;
  setAutoSave: (value: boolean) => void;
  
  // 全クリア（解析者以外）
  clearAllExceptAnalyst: () => void;
  
  // 完全リセット
  resetAll: () => void;
}

const initialBasicInfo: BasicInfo = {
  analyst: '',
  caseId: '',
  calciumScore: '',
  motionArtifact: false,
  noSignificantStenosis: false,
};

const initialOtherSection: OtherSection = {
  enabled: false,
  presetText: '',
  freeText: '',
};

const initialCurrentFinding: CurrentFinding = {
  vessel: '',
  segmentNo: '',
  isStent: false,
  location: '',
  stenosis: '',
  plaque: '',
  special: [],
  hasFreeText: false,
  freeText: '',
};

const initialSettings: Settings = {
  recipients: [],
};

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      // 基本情報
      basicInfo: initialBasicInfo,
      setBasicInfo: (info) =>
        set((state) => ({
          basicInfo: { ...state.basicInfo, ...info },
        })),
      
      // 所見リスト
      findings: [],
      addFinding: (finding) =>
        set((state) => ({
          findings: [
            ...state.findings,
            { ...finding, id: Date.now().toString() },
          ],
        })),
      removeFinding: (id) =>
        set((state) => ({
          findings: state.findings.filter((f) => f.id !== id),
        })),
      clearFindings: () => set({ findings: [] }),
      
      // 現在入力中の所見
      currentFinding: initialCurrentFinding,
      setCurrentFinding: (finding) =>
        set((state) => ({
          currentFinding: { ...state.currentFinding, ...finding },
        })),
      resetCurrentFinding: () =>
        set({ currentFinding: initialCurrentFinding }),
      
      // その他セクション
      otherSection: initialOtherSection,
      setOtherSection: (section) =>
        set((state) => ({
          otherSection: { ...state.otherSection, ...section },
        })),
      resetOtherSection: () =>
        set({ otherSection: initialOtherSection }),
      
      // 設定
      settings: initialSettings,
      setSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),
      
      // 自動保存
      autoSave: true,
      setAutoSave: (value) => set({ autoSave: value }),
      
      // 全クリア（解析者以外）
      clearAllExceptAnalyst: () => {
        const analyst = get().basicInfo.analyst;
        set({
          basicInfo: { ...initialBasicInfo, analyst },
          findings: [],
          currentFinding: initialCurrentFinding,
          otherSection: initialOtherSection,
        });
      },
      
      // 完全リセット
      resetAll: () =>
        set({
          basicInfo: initialBasicInfo,
          findings: [],
          currentFinding: initialCurrentFinding,
          otherSection: initialOtherSection,
        }),
    }),
    {
      name: 'ccta-repo-storage',
      partialize: (state) => ({
        basicInfo: state.basicInfo,
        findings: state.findings,
        otherSection: state.otherSection,
        settings: state.settings,
        autoSave: state.autoSave,
      }),
    }
  )
);

