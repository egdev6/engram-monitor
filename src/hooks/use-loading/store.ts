import { create } from 'zustand';
import type { LoadingStore } from './types';

const useLoadingStore = create<LoadingStore>((set) => ({
  pageLoading: false,
  apiFetching: true,
  formSubmitting: false,
  setPageLoading: (loading) => set({ pageLoading: loading }),
  setApiFetching: (fetching) => set({ apiFetching: fetching }),
  setFormSubmitting: (submitting) => set({ formSubmitting: submitting })
}));

export default useLoadingStore;
