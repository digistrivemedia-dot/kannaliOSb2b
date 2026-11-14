import { create } from "zustand";

export type SelectOption = { value: string; label: string; description?: string };

type SelectRequest = {
  title: string;
  options: SelectOption[];
  value: string | null;
  onSelect: (value: string) => void;
};

type SelectSheetState = SelectRequest & {
  /** Hands the choices to the sheet route (`app/sheets/select.tsx`), which opens next. */
  open: (request: SelectRequest) => void;
};

/** What the select sheet shows. Only one select sheet is open at a time. */
export const useSelectSheet = create<SelectSheetState>((set) => ({
  title: "",
  options: [],
  value: null,
  onSelect: () => {},
  open: (request) => set(request),
}));
