import { toast} from 'react-toastify';


const useToast = () => {
    const NotifySuccess = (message)=> {
        // toast(message)
        toast.success(message, {
          toastId: "success 1",
      })
    }

    const NotifyError = (message) => {
      toast.error(message, {
        toastId: "error 1",
    })
    }  

return {
    NotifyError, NotifySuccess
  };
};

export default useToast