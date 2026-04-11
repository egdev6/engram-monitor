export type LoadingStore = {
  pageLoading: boolean;
  apiFetching: boolean;
  formSubmitting: boolean;
  setPageLoading: (loading: boolean) => void;
  setApiFetching: (fetching: boolean) => void;
  setFormSubmitting: (submitting: boolean) => void;
};
