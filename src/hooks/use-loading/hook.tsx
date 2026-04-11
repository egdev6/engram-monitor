import useLoadingStore from './store';

const useLoading = () => {
  const { pageLoading, apiFetching, formSubmitting, setPageLoading, setApiFetching, setFormSubmitting } =
    useLoadingStore();

  return {
    pageLoading,
    apiFetching,
    formSubmitting,
    setPageLoading,
    setApiFetching,
    setFormSubmitting
  };
};

export default useLoading;
